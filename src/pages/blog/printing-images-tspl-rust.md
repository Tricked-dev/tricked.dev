---
layout: "../../layouts/BlogPost.astro"
title: "Printing images with TSPL and rust"
description: "How i used rust and TSPL to print images with labels"
pubDate: "Oct 02 2023"
heroImage: "/assets/rock.jpg"
---

Ever had the desire to print an image with a label using Rust and TSPL? As with many tasks in the world of programming, there are several steps involved. Today, I'm sharing how I converted an image into a printable format suitable for TSC thermal printers.

## Image Transformation

The first hurdle was preparing the image. TSC thermal printers require a particular format: monochrome bitmaps. Here's a quick snippet that showcases how I converted a standard image into this format:

```bash
convert input.jpg -colorspace Gray -ordered-dither h4x4a -scale 590x295 mono.bmp
convert mono.bmp -monochrome monochrome.bmp

```

With these two commands, the image is first converted into grayscale and then further processed to a monochrome bitmap. The final result, monochrome.bmp, is now ready for the next stage.

## Rust & TSPL Integration

Utilizing functions I previously created for [Writing TSPL on linux](/blog/writing-tspl-on-linux), I devised the following code:

```rs
use std::fs::read;

let mut data: Vec<u8> = vec![];
data.extend(
        b"SIZE 50.00 mm,25.00 mm
DENSITY 3
SPEED 2
SHIFT 0
OFFSET 0 mm
GAP 2.7 mm,0.00 mm
CODEPAGE UTF-8
CLS
DOWNLOAD \"frame.bmp\"\n",
    );
data.extend(read("./monochrome.bmp")?);
data.extend(b"\nEOP\nPUTBMP 0,0,\"frame.bmp\"\nPRINT 1,1\n");
write_binary(&data)?;
Ok(())
```

## Conclusion

Printing images with labels using TSPL and Rust may seem niche, but the process underscores the broader themes in programming: exploration, problem-solving, and innovation. Whether you're diving into the nuances of TSPL or embarking on another coding journey, remember that every challenge presents an opportunity for growth and creativity. Happy coding!
