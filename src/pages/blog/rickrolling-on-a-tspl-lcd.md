---
layout: "../../layouts/BlogPost.astro"
title: "Rickrolling with a TSPL lcd"
description: "How i used a tspl printer to play a video and how to display images on a printer lcd"
pubDate: "Sep 27 2023"
heroImage: "/assets/rick.png"
---

## Introduction

Most of us are familiar with printers and their primary function - printing. But what if I told you that a label printer could become an instrument of wholesome trolling? That's right, I managed to rickroll everyone using a TSPL printer's LCD. Here's how it all began.

## Decoding the TSPL Printer

First, let's demystify the term. TSPL, or Thermal Printer Command Language, is a command set mainly used for label printing. The idea of playing a video on such a device may seem bizarre. But sometimes, the journey is just for the sheer joy of experimentation.

## Downloading Files onto the Printer

My initial exploration led me to discover a method to download files onto a TSPL printer, allowing them to be utilized for printing or, in this case, to have some fun.

Utilizing functions I previously created for [Writing TSPL on linux](/blog/writing-tspl-on-linux), I devised the following code:

```rs
let mut data: Vec<u8> = vec![];

data.extend("DOWNLOAD \"frame.bmp\"\n".to_owned().as_bytes());
data.extend(&binary);
data.extend("\nEOP\n".to_owned().as_bytes());
write_binary(&data)?;
```

This code essentially instructs the printer to download a file named frame.bmp, followed by appending the file's binary content and finally signaling the end of the procedure with EOP.

## The Rickroll Setup

With the ability to download files onto the printer, I embarked on a whimsical journey to rickroll unsuspecting souls. Using `yt-dlp``, I downloaded the infamous 'Never Gonna Give You Up' video. To make it suitable for the printer's display, I then used ffmpeg to resize and reduce its framerate. The video was then split into individual frames to create the final animation.

```sh
yt-dlp "https://youtu.be/dQw4w9WgXcQ?si=6yzQp08qKwLu6h7u"
ffmpeg -i Rick\ Astley\ -\ Never\ Gonna\ Give\ You\ Up\ \(Official\ Music\ Video\)\ \[dQw4w9WgXcQ\].webm -vf "scale=320:240" -r 10 resized_video.mp4
# the first 20 seconds at 10fps
ffmpeg -i resized_video.mp4 -vframes 200 frames/frames_%04d.bmp
```

## Animation in Action

The final step involved sending these frames to the printer and sequentially displaying them, creating a mini rickroll animation on the printer's LCD:

```rs
write_text("\r\nCLS\r\nDISPLAY 16777215,16711680\r\nDISPLAY CLS\r\n".to_owned())?;

for file in fs::read_dir("frames").unwrap() {
    let binary = fs::read(file?.path())?;
    let mut data: Vec<u8> = vec![];
    data.extend("DOWNLOAD \"frame.bmp\"\n".to_owned().as_bytes());
    data.extend(&binary);
    data.extend("\nEOP\n".to_owned().as_bytes());
    data.extend("DISPLAY 0,0,\"frame.bmp\"\r\n".to_owned().as_bytes());
    write_binary(&data)?;
    std::thread::sleep(Duration::from_millis(100))
}
write_text("DELAY 5000\r\nDISPLAY OFF\r\n".to_owned())?;
```

An interesting optimization for future endeavors might involve preloading all frames onto the printer's 8MB RAM. This would enable smooth playback without any intermittent 'downloading' messages.

## Conclusion

This experiment with a TSPL printer underscores the unexpected fun that can emerge from everyday tech. While playing videos on a printer's LCD might seem unconventional, it's a whimsical reminder that with a dash of creativity, we can uncover delightful possibilities in the most ordinary places.
