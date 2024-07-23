---
layout: "../../layouts/BlogPost.astro"
title: "How i rewrote my godot desktop pet in rust for better performance"
description: "A few days ago i wrote a desktop pet using godot but it had some major performance issues making me investigate rewriting it in rust"
pubDate: "Jul 23 2024"
heroImage: "/assets/1903255995_A paper plane flying over a city  _xl-beta-v2-2-2.png"
---

So i made the first version of my application in godot using the transparency and hide decoration option and then just changing the window location every frame, this worked fine on windows but had one problem on my kde install it made my entire system laggy and used about 300mb ram, i could only run a couple of instances before before my os was completely useless same counted for windows with about ~5.

So i thought why not rewrite it in rust, i ended up trying to use [WGPU](https://github.com/gfx-rs/wgpu) but.... i couldn't even get a png rendered so that wasn't a option anymore so then i thought why not use the rust game engine bevy even thought it is kinda heavy compared to godot its not as heavy for this type of purpose.

I quickly got my sprite following a cursor, animation states proved a bit more difficult compared to godot i had put the separate rat spritesheet styles into a single png to make it easier to do the animations but the awesome examples made it workable although the way i do animations still isn't optimal it works well enough.

Then comes the part where i wanted to actually share the compiled binary with someone and where i found out that just using bevy generates a massive binary thats 50mb i made it much smaller by disabling the bevy default features and just enabling what i needed this also had the benefit of reducing the cpu and ram usage by almost half. I then also did the usual easy to do min sized rust things and got a binary that was 15mb which is very good. 

But we still had one problem the asset folder had to be shared with the binary in order for the program to actually work i found [the bevy_embedded_asset](https://github.com/vleue/bevy_embedded_assets) crate and it worked but it didnt work when compiling the program with [cross](https://github.com/cross-rs/cross) which is what i wanted to use to compile to windows so i had to figure out [my own solution of including the bytes in the binary](https://github.com/Tricked-dev/desktopPetRS/blob/49a27208f040a462750dd17ce62ec07aeb3e2453/src/main.rs#L171-L179) and then it was perfect.

The end result can be found here [Tricked-dev/desktoppetrs](https://github.com/Tricked-dev/desktopPetRS)