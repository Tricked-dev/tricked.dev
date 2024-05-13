---
layout: "../../layouts/BlogPost.astro"
title: "Changing who can login to a application with authentik"
description: "Configs for changing who can login to a application with authentik"
pubDate: "May 13 2024"
heroImage: "/assets/1903255995_A paper plane flying over a city  _xl-beta-v2-2-2.png"
---

By default authentik allows anyone to login to the application. This can however easily be changed by clicking on the application and clicking bind existing policy and selecting a user:

![alt text](/assets/authentik-binding.png)

Weird huh? this will make it so just that user can login to the application, so its open for everyone by default unless you add a binding.
