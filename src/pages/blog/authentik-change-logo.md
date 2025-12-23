---
layout: "../../layouts/BlogPost.astro"
title: "Change authentik logo/branding"
description: "A simple guide on how to change the logo / branding on a Authentik installation"
pubDate: "April 20 2024"
updatedDate: "Dec 23 2025
heroImage: "/assets/themed_authentik.png"
---

## Introduction

Authentik by default uses the Authentik logo while logging in and mentions Authentik in the login screen too, Changing this can be done fairly easily and can improve the user experience.

## Changing the text in the login screen

Go to `admin interface > Flows and Stages > Flows` (/if/admin/#/flow/flows) and edit the default authentication flow with the edit button to change to text inside.

![Screenshot of the menu](/assets/authentik-flow-vars.png)

After this hit update and do it for the other one and that should be changed now.

## Changing the icon & CSS

Changing the icons is a bit more involved it requires you to edit the `docker-compose.yml` to mount the new images

```yml
volumes:
  - ./media:/media
  - ./custom-templates:/templates
  - ./branding/brand_icon.png:/web/dist/assets/icons/icon_left_brand.png # Add the brand icon in the ./branding folder next to your docker-compose
  - ./branding/favicon.ico:/web/dist/assets/icons/favicon.ico # Add the favicon
```

You can create a branding folder for example and put your branding images in there. Then you can restart Authentik and go to the `admin interface > System > Brands` location and edit authentik-default and update the new logos to the following location in this example.

![Brands](/assets/authentik-brands.png)

logo: `/static/dist/assets/icons/icon_left_brand.png`
favicon: `/static/dist/assets/icons/icon.png`

You can also change the title here to something else than Authentik

Styling with custom css can also be done in the brands section `admin interface > System > Brands > Custom CSS`, you no longer need to mount a custom.css. You can view [This authentik discussion](https://github.com/goauthentik/authentik/discussions/4831) for some inspiration on what you can do with custom css
