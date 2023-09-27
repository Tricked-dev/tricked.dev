---
layout: "../../layouts/BlogPost.astro"
title: "sending TSPL to a TSC printer on linux"
description: "A guide on how you can use libusb to send tspl to a tsc printer using rust"
pubDate: "Sep 27 2023"
heroImage: "/assets/687435_Thermal heat printer tspl _xl-1024-v1-0.png"
---

TSPL (Thermal Printer Control Language) is a scripting language used by TSC thermal printers. It's essential for creating labels, barcodes, and more. While tools exist for Windows, Linux users might find it challenging to work with TSC printers directly. This article presents a Rust-based solution for this.

### Prerequisites

- Basic knowledge of Rust.
- Rust and Cargo installed on your machine.
- A TSC printer connected to your Linux machine.

After doing a couple hours of research i couldnt find anything about how to send TSPL to a printer on linux theres diagtool for Windows but it doesnt work via wine.

So after doing a bit of research on how `rusb` the libusb library for rust worked it looked as simple as sending the tspl data to the printer and it was

```
cargo add color_eyre rusb
```

```rs
static HANDLE: OnceCell<DeviceHandle<GlobalContext>> = OnceCell::new();

pub fn write_binary(data: &[u8]) -> color_eyre::Result<()> {
     // Check if we already have a handle for the device
    if let Some(handle) = HANDLE.get() {
        handle.write_bulk(0x01, data, Duration::from_secs(1))?;
        return Ok(());
    }

    // Iterate over devices to find a TSC printer
    for device in rusb::devices()?.iter() {
        let device_desc = device.device_descriptor()?;
        if device_desc.vendor_id() == 0x1203 {
            let mut handle = device.open()?;
            #[cfg(target_os = "linux")]
            if handle.kernel_driver_active(0)? {
                handle.detach_kernel_driver(0)?;
            }
            handle.claim_interface(0)?;
            handle.write_bulk(0x01, data, Duration::from_secs(1))?;
            HANDLE.set(handle).unwrap();
        }
    }
    Ok(())
}
```

This is all the code needed to send tspl to a TSC printer on linux, this code detects all devices made by TSC (`0x1203`) and send the data you want to send to it for example

```rs
write_binary("SOUND 5, 500\n".as_bytes())
```

i also made a little helper function that automatically applies the `\n` for you

```rs
pub fn write_text(tspl_commands: String) -> color_eyre::Result<()> {
    let mut tspl_commands = tspl_commands.clone();
    if !tspl_commands.ends_with('\n') {
        tspl_commands.push('\n');
    }

    write_binary(tspl_commands.as_bytes())?;

    Ok(())
}
```

But thats it all you need to send tspl to a printer using linux

## Conclusion

Working with TSC printers on Linux might seem daunting due to the lack of native tools. However, with some Rust and the `rusb` library, you can easily communicate with these printers using TSPL. Whether you're printing labels, barcodes, or any other tasks, this method ensures seamless integration on a Linux environment.
