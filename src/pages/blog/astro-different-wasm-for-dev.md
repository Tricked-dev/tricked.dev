---
layout: "../../layouts/BlogPost.astro"
title: "Astro Use different wasm files for development and production"
description: "My astro plugin implementation to achieve this behavior, can be extended to just normal js"
pubDate: "Sep 23 2024"
heroImage: "/assets/1903255995_A paper plane flying over a city  _xl-beta-v2-2-2.png"
---

While adding wasm to my astro site i came across the need to have 2 versions of my wasm-bindgen wasm one for development with more development logging and better stacktraces etc, and one for production that was MUCH smaller and didnt include all the logging. I was using svelte and wanted to keep the top level import due to loading it dynamically making no sense for this use case.
So instead i ended up creating 2 folders one for my production wasm and one for development like this:

```sh
cargo build --lib -p lib_knuckle --target wasm32-unknown-unknown --features debug
# I use wasm-bindgen to generate the bindings but cretaing your own handrolled bindings should work just fine!
# https://rustwasm.github.io/wasm-bindgen/introduction.html
wasm-bindgen ./target/wasm32-unknown-unknown/debug/lib_knuckle.wasm --target bundler --out-dir src/lib/wasmdev

RUSTFLAGS="-Zlocation-detail=none" cargo +nightly build -Z build-std=std,panic_abort -Z build-std-features=panic_immediate_abort \
     --target wasm32-unknown-unknown --profile release-wasm \
     --lib -p lib_knuckle

wasm-bindgen ./target/wasm32-unknown-unknown/release-wasm/lib_knuckle.wasm --target bundler --out-dir src/lib/wasmprd
# Optional - helps a ton with decreasing the size of the wasm binary
wasm-opt -Oz --optimize-for-js -o ./src/lib/wasmprd/lib_knuckle_bg.wasm ./src/lib/wasmprd/lib_knuckle_bg.wasm
```

Then i added this import `import { Game } from "./lib/wasmdev/lib_knuckle";` to the top of my svelte file. But as you might have noticed itll always pull the dev version. To work around this i created a custom astro plugin

```js
const myWasmPlugin = {
  name: "wasm-plugin",
  hooks: {
    "astro:config:setup": (config) => {
      // @ts-ignore
      if (process.env.NODE_ENV === "production") {
        config.updateConfig({
          vite: {
            resolve: {
              alias: {
                "./lib/wasmdev/": "./lib/wasmprd/",
              },
            },
          },
        });
      }
    },
  },
};
```

When using `astro build` the NODE_ENV is set to production making it so the vite aliases the dev build to be the production build making it so only the wasm binary of the production build is used and put into the output folder!
This helps reduce the data i sent to my users and after making these "tools" costs nothing for me to do!

If you use wasm-bindgen like me you might get errors trying to import wasm this can be easily fixed using the `vite-plugin-wasm` npm package

just add it to your astro config ala:

```
import wasm from "vite-plugin-wasm";

....

export default defineConfig({
  ...
  vite: {
    plugins: [wasm()],
  },
});
```

And everything will work as expected.
