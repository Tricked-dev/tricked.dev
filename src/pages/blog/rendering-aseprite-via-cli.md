---
layout: "../../layouts/BlogPost.astro"
title: "Aseprite Export Script"
description: "A simple script to export aseprite files"
pubDate: "Sep 23 2024"
heroImage: "/assets/1903255995_A paper plane flying over a city  _xl-beta-v2-2-2.png"
---

I like using aseprite to create simple pixel art for games and various projects but having to export each time you make a change to the aseprite file gets boring quickly.
Luckily aseprite comes with a ~~nice~~ workable commandline that can be used to export your sprites automatically (via watchexec or nodemon) or via a single command after chagning your sprites and pressing ctrl+s

Heres the script i made for my needs

```bash
#!/bin/bash

# Exports each layer as a seperate png named by layer name
function layerAse2png {
    aseprite -b --split-layers sprites/$1.aseprite --save-as public/assets/$1-{layer}.png
}

# Exports all layers to a single png
function ase2png {
    aseprite -b sprites/$1.aseprite --save-as public/assets/$1.png
}
ase2png dice-bg
ase2png number-base
layerAse2png dices
layerAse2png end-texts
```

Works perfectly fine maybe i will make some github action to automate it on every commit where the assets change or something.
If anyone knows how to do this in the libresprite cli or even better combine them both feel free to comment it here personally couldnt get libresprite to work with the cli.
