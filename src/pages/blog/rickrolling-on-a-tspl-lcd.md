---
layout: "../../layouts/BlogPost.astro"
title: "Rickrolling with a TSPL lcd"
description: "How i used a tspl printer to play a video and how to display images on a printer lcd"
pubDate: "Sep 27 2023"
heroImage: "/assets/rick.png"
---

**What is a TSPL Printer?**
TSPL or Thermal Printer Command Language is primarily used for label printing. Now, you might wonder, "Why would someone want to play a video on a label printer?" Well, the answer is simple: For fun! Let's dive into how I rickrolled everyone using a TSPL printer.

After doing a bunch of testing i found out that this is how you download files on a tspl printer to use them in printing or ofcourse doing a bit of trolling

The code uses the functions i made earlier for [Writing TSPL on linux](/blog/writing-tspl-on-linux)

```rs
let mut data: Vec<u8> = vec![];

data.extend("DOWNLOAD \"frame.bmp\"\n".to_owned().as_bytes());
data.extend(&binary);
data.extend("\nEOP\n".to_owned().as_bytes());
write_binary(&data)?;
```

In the code above, I start by defining a vector `data` which will store the binary content for our command. We then specify the filename `frame.bmp` for the downloaded file on the printer, append our image's binary content, and finish with the `EOP` (End of Procedure) command.

So i downloaded never gonna give you up changed it framerate and split out the frames to rickroll everyone

```sh
yt-dlp "https://youtu.be/dQw4w9WgXcQ?si=6yzQp08qKwLu6h7u"
ffmpeg -i Rick\ Astley\ -\ Never\ Gonna\ Give\ You\ Up\ \(Official\ Music\ Video\)\ \[dQw4w9WgXcQ\].webm -vf "scale=320:240" -r 10 resized_video.mp4
# the first 20 seconds at 10fps
ffmpeg -i resized_video.mp4 -vframes 200 frames/frames_%04d.bmp
```

Then its as simple as looping over all the frames and sending them to the printer and displaying them one by one

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

A later optimization would be to send all frames at the start and put it in the 8MB ram the printer has to display them without the `downloading` message.
