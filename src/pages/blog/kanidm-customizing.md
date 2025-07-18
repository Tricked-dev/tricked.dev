---
layout: "../../layouts/BlogPost.astro"
title: "Customizing kanidm with css & images"
description: "Replacing images and css in the kanidm docker image by adding mountpoints"
pubDate: "Jul 13 2025"
heroImage: "/assets/idm.tricked.dev_ui_login.png"
---

## Prelude

Kanidm is great and has a decently nice looking ui with a ton of cool crabs, but
sometimes you just want to customize a application to make it more personal and
luckily Kanidm makes this quite easy.

most assets images/css are stored in the docker container and mostly loaded on
request.

## Changing the name

Starting with the name of the Kanidm instance this can be done with
`kanidm system domain set-displayname Whatever` this will change the Kanidm text
to what you provided see the banner image where i changed it to TrickedAuth

## Changing the logo / Oauth2 logo/name

You can view the
[official guide and information](https://kanidm.github.io/kanidm/stable/customising.html)
to change these

## Customizing built in logos and css

### Extracting the docker images

Start by extracting the docker image

```bash
docker pull docker.io/kanidm/server:latest
CID=$(docker create docker.io/kanidm/server:latest)
docker cp "$CID":/ ./kanidm-rootfs
docker rm "$CID"
```

after doing this you should copy just the `kanidm-rootfs/hpkg` folder to another
directory and delete the rest. Place the `hpkg` folder next to the
`docker-compose.yaml` of your Kanidm setup

and add the following mountpoints, my suggestion is to only mount the img and
style folder so that updates wont cause issues down the line with changed js
etc.

```yaml title=docker-compose.yaml
services:
    kanidm:
        image: docker.io/kanidm/server:latest
        ports:
            8443:8443
        volumes:
            - ./data:/data:rw,Z
            - ./hpkg/img:/hpkg/img:Z
            - ./hpkg/style.css:/hpkg/style.css:Z⏎
```

hpkg overview:

```bash
.
├── external
│   <omitted>
├── img
│   ├── apple-touch-icon.png
│   ├── favicon.png
│   ├── icon-accounts.svg
│   ├── icon-accounts.svg.br # You can safely delete all .br assets
│   ├── icon-groups.svg
│   ├── icon-groups.svg.br
│   ├── icon-oauth2.svg
│   ├── icon-oauth2.svg.br
│   ├── icon-person.svg
│   ├── icon-person.svg.br
│   ├── icon-robot.svg
│   ├── icon-robot.svg.br
│   ├── icons
│   │   ├── building-lock.svg
│   │   ├── key.svg
│   │   ├── person.svg
│   │   ├── phone-flip.svg
│   │   └── shield-lock.svg
│   ├── kani-waving.svg
│   ├── logo-{180,192,256,512}.png # these are only used for apple afaik you can skip overwriting these
│   ├── logo-square.svg
│   ├── logo-square.svg.br
│   └── logo.svg
├── modules
│   └── cred_update.mjs
├── pkhtml.js
├── style.css # This file you want to edit to get custom styles
└── style.js
```

### Adding a background image

adding a image as background

```css title=style.css
body {
  // all assets in the hpkg folder are hosted in the `/pkg` path in Kanidm
  background-image: url(/pkg/img/bg.jpg);
  background-size: cover;
}
```

just append this to your `style.css` and put the desired background in de
hpkg/img folder i would recommend small jpg's ~150kb so that the image is loaded
quickly instead of the default background being shown first

### Updating existing images

you can then start editing the assets. One thing in the current version of
Kanidm most images are svg's which have to stay svg - you can't just rename a
png to .svg as the browser will still try to parse it as svg markup and fail. If
you want to put your own images instead of the svg's you will likely want to use
other pngs/jpgs but you can't just put `<image>` elements inside svg's that
reference external URLs because kanidm's content security policy doesn't allow
external image references. This means you will have to use a script to embed the
photos directly into the svg as base64 data URIs with a script like this:

```js collapse={10-80} title=embed-svg-images.js
// Script generated by chatgpt basically just includes the <image> tags in a svg to base64 to make it so the image loads
const fs = require("fs").promises;
const path = require("path");
const { JSDOM } = require("jsdom"); // Install with: npm install jsdom

async function embedSvgImages(inputSvgPath, outputSvgPath) {
    try {
        // 1. Read the input SVG file
        const svgContent = await fs.readFile(inputSvgPath, "utf8");

        // 2. Parse the SVG content using JSDOM
        const dom = new JSDOM(svgContent, { contentType: "image/svg+xml" });
        const document = dom.window.document;

        // 3. Find all <image> elements
        const imageElements = document.querySelectorAll("image");

        for (const imageElement of imageElements) {
            let href = imageElement.getAttribute("href");

            // Check if href exists and is not already a data URI
            if (href && !href.startsWith("data:")) {
                // Resolve the absolute path of the image
                const imagePath = path.resolve(
                    path.dirname(inputSvgPath),
                    href,
                );

                try {
                    // Read the image file as a buffer
                    const imageData = await fs.readFile(imagePath);

                    // Determine the MIME type
                    const ext = path.extname(imagePath).toLowerCase();
                    let mimeType;
                    switch (ext) {
                        case ".png":
                            mimeType = "image/png";
                            break;
                        case ".jpg":
                        case ".jpeg":
                            mimeType = "image/jpeg";
                            break;
                        case ".gif":
                            mimeType = "image/gif";
                            break;
                        case ".webp":
                            mimeType = "image/webp";
                            break;
                        case ".svg":
                            mimeType = "image/svg+xml";
                            break;
                        default:
                            console.warn(
                                `Warning: Unknown image type for ${href}. Skipping embedding.`,
                            );
                            continue; // Skip this image if type is unknown
                    }

                    // Convert image data to Base64
                    const base64Data = imageData.toString("base64");

                    // Create the data URI
                    const dataUri = `data:${mimeType};base64,${base64Data}`;

                    // Update the href attribute
                    imageElement.setAttribute("href", dataUri);
                    console.log(`Embedded image: ${href}`);
                } catch (readError) {
                    console.error(
                        `Error reading image file ${imagePath}: ${readError.message}`,
                    );
                }
            }
        }

        // 4. Get the modified SVG content
        const modifiedSvgContent = dom.serialize();

        // 5. Write the modified SVG content to the output file
        await fs.writeFile(outputSvgPath, modifiedSvgContent, "utf8");
        console.log(
            `Successfully embedded images and saved to ${outputSvgPath}`,
        );
    } catch (error) {
        console.error(`Error processing SVG: ${error.message}`);
        process.exit(1);
    }
}

// --- Command Line Argument Handling ---
const args = process.argv.slice(2); // Get arguments excluding 'node' and 'script-name'

if (args.length !== 2) {
    console.log(
        "Usage: node embed-svg-images.js <input-svg-file> <output-svg-file>",
    );
    console.log("Example: node embed-svg-images.js input.svg output.svg");
    process.exit(1);
}

const inputSvgFile = args[0];
const outputSvgFile = args[1];

embedSvgImages(inputSvgFile, outputSvgFile);
```

You can then create a simple script like this which will convert your svg's to
ones with base64

```bash title=convert.sh
# or use node or deno whatever you prefer bun is the easiest though you wont need to npm i anything
bun embed-svg-images.js logo_src.svg logo.svg
bun embed-svg-images.js logo-square_src.svg logo-square.svg
```

You can create files like this in the img folder of kanidm

```
.
├── embed-svg-images.js
├── convert.sh
├── logo_src.svg
├── logo.svg
├── logo-square_src.svg
├── logo-square.svg
```

```xml title=logo_src.svg
<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
 <image 
    href="./confused.png"
    x="0" 
    y="0" 
    width="64" 
    height="64"
    preserveAspectRatio="xMidYMid meet"
    />
</svg>
```

then the script will turn that into a svg like this

```xml title=logo.svg
<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
 <image href="data:image/png;base64,ggg==" x="0" y="0" width="64" height="64" preserveAspectRatio="xMidYMid meet"/>
</svg>
```
