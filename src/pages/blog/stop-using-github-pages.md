---
layout: "../../layouts/BlogPost.astro"
title: "Stop using Github pages"
description: "Github pages has the worst user experience of any website hosting out there. I will show you why and what alternatives you can consider"
pubDate: "Nov 19 2022"
# heroImage: "/blog/active-developer.png"
---

## Why are github pages bad?

### You have to use Github actions to deploy the website

"But as far as CI systems go, it's... pretty bad. It has a weird little sublanguage for conditionals embedded in YAML. It's really hard to re-use CI config across repositories, because they picked the wrong abstractions all around." ~ <https://fasterthanli.me/articles/my-ideal-rust-workflow#ci-solutions>

### Custom domains are a pain to setup

Custom domains require more effort than if you were using a service like Cloudflare pages or Vercel. You have to create a CNAME file and add a TXT record to your DNS. This is not a big deal but it is annoying.

### No SSR support

Github pages just hosts your static files and nothing more. unlike other services that support dynamic routes SSR api routes on their edge servers.

### No custom headers

Github pages does not support custom headers. This means you can't add a CSP header or a HSTS header. This is a big deal because it means you can't add security headers to your website.

### No custom redirects

Github pages has no way to do server side redirects instead you need to create a html page that uses js or html meta tags to redirect the user.

## Alternatives

### Cloudflare pages

Cloudflare pages don't require a action to deploy a website instead they just run your build script or any custom command instead and deploy a pre specified folder no need to edit yml files or anything. They also support custom domains and custom headers. They also support dynamic routes and SSR api routes. They also support custom redirects. see more <https://developers.cloudflare.com/pages/framework-guides/deploy-anything/>

### Vercel

Vercel is a very similar service to cloudflare pages. They also support custom domains and custom headers. They also support dynamic routes and SSR api routes. They also support custom redirects.
