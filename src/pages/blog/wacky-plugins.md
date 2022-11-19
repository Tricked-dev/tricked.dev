---
layout: "../../layouts/BlogPost.astro"
title: "Rust Plugin system"
description: "Compile time plugins in rust"
pubDate: "Nov 14 2022"
# heroImage: "/blog/active-developer.png"
---

Today i created a dynamic plugin system in rust. It is a very simple system that allows you to load plugins at compile time. [Wacky Plugins](https://github.com/Tricked-dev/wacky-plugins)

## How it works

it uses a `build.rs` to discover the plugins at compile time and add them to the `Cargo.toml` file. It then uses a macro to load the plugins at runtime.

```rs
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let manifest = fs::read_to_string("./Cargo.toml")?;
    let mut doc = manifest.parse::<toml_edit::Document>()?;

    let entries = fs::read_dir("../../plugins")?
        .map(|res| res.map(|e| e.path()))
        .collect::<Result<Vec<_>, io::Error>>()?;
    for plugin in entries.clone() {
        doc["dependencies"][plugin.file_name().unwrap().to_str().unwrap()]["path"] =
            toml_edit::value(format!("{}", plugin.display()));
    }
    fs::write("./Cargo.toml", doc.to_string())?;
    let entries_str = entries
        .into_iter()
        .map(|e| {
            format_ident!(
                "{}",
                e.file_name()
                    .unwrap()
                    .to_string_lossy()
                    .to_string()
                    .replace("-", "_")
            )
        })
        .collect::<Vec<_>>();

    let result = quote! {
        use plugin_lib::PluginTrait;
        pub fn load_plugins() -> Vec<Box<dyn PluginTrait>> {
            vec![
                #(
                    Box::new(#entries_str::Plugin::new()),
                )*
            ]
        }
    };
    write(
        format!("{}{}", env::var("OUT_DIR").unwrap(), "/plugin_shim.rs"),
        result.to_string(),
    )?;
    Ok(())
}
```

And then you can use the plugins like this:

```rs
use plugin_loader::PLUGIN_REGISTRY;
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    PLUGIN_REGISTRY.initialize().await?;

    for plugin in PLUGIN_REGISTRY.plugins.lock().iter() {
        println!(
            "Plugin: {} initialized: {}",
            plugin.name(),
            plugin.initialized()
        );
    }
    let input = "This is cool text!";

    for plugin in PLUGIN_REGISTRY.plugins.lock().iter() {
        println!(
            "Plugin: {} processed text: {}",
            plugin.name(),
            plugin.text_process(input)
        );
    }

    Ok(())
}
```

## Why?

Having compile time checked plugins is great but having to recompile every time you want to add a plugin is not, but it may be worth it since you can use the full rust feature set async, all libraries, etc.

## Limitations/Advantages

### Advantages

- You dont have to use extern c and ffi
- A plugin is a trait and compile time checked
- Its cross platform

### Limitations

- You have to recompile every time you add a plugin
- You can dynamically load plugins
- Plugins have to be written in rust
