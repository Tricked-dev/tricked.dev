---
layout: "../../layouts/BlogPost.astro"
title: "sending TSPL to a TSC printer on linux"
description: "A guide on how you can use libusb to send tspl to a tsc printer using rust"
pubDate: "Sep 27 2023"
heroImage: "/assets/687435_Thermal heat printer tspl _xl-1024-v1-0.png"
---

TSPL, or Thermal Printer Control Language, is the scripting protocol behind TSC thermal printers. It's indispensable for generating labels, barcodes, and more. While Windows users have a variety of tools at their disposal, those on Linux often face hurdles when trying to communicate directly with TSC printers. This article aims to bridge that gap with a Rust-based solution.

## Prerequisites

1. A foundational understanding of Rust.
2. Rust and Cargo properly set up on your machine.
3. A TSC printer connected to your Linux setup.

During my initial research phase, I discovered a conspicuous absence of Linux-native solutions for sending TSPL to a printer. There is 'diagtool' for Windows, but it's incompatible with Wine.

After delving deeper into the workings of `rusb`, Rust's libusb library, I realized the process was as straightforward as transmitting the TSPL data directly to the printer.

First, add the necessary dependencies:

```
cargo add color_eyre rusb
```

Then, implement the communication:

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

Executing the code above will enable you to send TSPL instructions, like:

```rs
write_binary("SOUND 5, 500\n".as_bytes())
```

For added convenience, I've also crafted a helper function to ensure every TSPL command is newline-terminated:

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

## Wrapping Up

Working with TSC printers on Linux might seem daunting due to the lack of native tools. However, with some Rust and the `rusb` library, you can easily communicate with these printers using TSPL. Whether you're printing labels, barcodes, or any other tasks, this method ensures seamless integration on a Linux environment.
