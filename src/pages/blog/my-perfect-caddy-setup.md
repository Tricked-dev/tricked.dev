---
layout: "../../layouts/BlogPost.astro"
title: "My perfect caddy setup"
description: "The caddy config & tools i use for the perfect setup for my selfhosting needs"
pubDate: "Feb 13 2024"
heroImage: "/assets/01HPHWCYA9W26NY0RB7T7J1XH5.png"
---

So i wanted to setup serverside logging for my selfhosted applications to get some insights into what is used the most and how much bandwidth is being spent etc, i quickly found that goaccess is the best tool to get these insights.

I found the [example from hectorm](https://github.com/hectorm/docker-goaccess/tree/master/config/goaccess) to be the main way to get started but it was missing some things, it didn't log the hostname used and didn't work with proxies like Cloudflare it was also quite boilerplate full to add more domains.

So i modified the config to add these features

```Caddyfile
{
   admin off
   auto_https disable_redirects

   log all {
      include http.log.access.all
      output file /var/log/caddy/access.log
      format transform `{request>host}:443 {:request>remote_ip} - {request>user_id} [{ts}] "{request>method} {request>uri} {request>proto}" {status} {size} "{request>headers>Referer>[0]}" "{request>headers>User-Agent>[0]}"` {
        time_format "02/Jan/2006:15:04:05 -0700"
      }
  }
}


domain.com {
  log all
  reverse_proxy :3001
}
dash.domain.com {
  log all
  reverse_proxy :3001
}
```

This is already much better but i needed to get the real ip in my logs so i didn't just see Cloudflare ips, this can be done in 2 ways:

1. Manually read the headers for the x-forwarded-for header `{request>headers>X-Forwarded-For>[0]:request>headers>Cf-Connecting-Ip>[0]:request>remote_ip}`
2. Add cloudflare to trusted proxies theres a module for that https://github.com/WeidiDeng/caddy-cloudflare-ip then just add the cloudflare ip to trusted proxies

But if you are like me and use cloudflare tunnel (cloudflared) you have to configure it to use using the `trusted_proxies static private_ranges` option <https://caddyserver.com/docs/caddyfile/options#trusted-proxies>.

Although i couldn't get that method to work with the logger for some reason im guessing its cause of the usage of `request>remote_ip` instead of client_ip but i haven't tried using client_ip yet.

After that i also wanted to get ssl certs for my domains using a letsencrypt and the cloudflare api. I did this by using https://github.com/caddy-dns/cloudflare and updated my config to use the api key

```caddyfile
{
   log all { ... old stuff}

   acme_dns cloudflare <api key>
}

```

Now the ssl certs just work out of the box!, i can use caddy for internal and external use on the same server.

As a added bonus i configured Cloudflareds fallback to be localhost:80 and prefixed all my externals domains with http:// and disabled https redirects and cloudflared worked too now i just need to add a dns record pointing to the tunnel and update my caddyfile to add a new service.

My final config:

```
{
   admin off
   auto_https disable_redirects

   log all {
      include http.log.access.all
      output file /var/log/caddy/access.log
      format transform `{request>host}:443 {request>headers>X-Forwarded-For>[0]:request>headers>Cf-Connecting-Ip>[0]:request>remote_ip} - {request>user_id} [{ts}] "{request>method} {request>uri} {request>proto}" {status} {size} "{request>headers>Referer>[0]}" "{request>headers>User-Agent>[0]}"` {
        time_format "02/Jan/2006:15:04:05 -0700"
      }
         }

   acme_dns cloudflare <api key>

   servers {
        trusted_proxies cloudflare
   }

}

example.domain.com {
  log all
  reverse_proxy :3001
}

dash.domain.com {
  log all
  reverse_proxy :3000
}


goaccess.domain.com {
  log all
  root * /var/www/goaccess/
  file_server * browse

  @websockets {
     header Connection *Upgrade*
     header Upgrade websocket
  }
  reverse_proxy @websockets :7890
}

:80, :443 {
  respond "Funny 404"
}

```

final docker-compose file

```yml
version: "3"
services:
  caddy:
    image: caddycloudflare
    build: .
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - ./logs:/var/log/caddy/
      - www:/var/www/goaccess/
    restart: unless-stopped
    network_mode: "host"

  goaccess:
    image: "docker.io/hectorm/goaccess:latest"
    restart: "unless-stopped"
    volumes:
      - "/etc/goaccess/goaccess.conf:/etc/goaccess/goaccess.conf:ro"
      - "www:/var/www/goaccess/"
      - "./logs:/var/log/caddy/:ro"
    ports:
      - 7890:443
    depends_on:
      - "caddy"
volumes:
  caddy_data:
  www:
```

I also made my own caddy Dockerfile to use with it

```
FROM caddy:builder AS builder

RUN caddy-builder \
    github.com/caddy-dns/cloudflare \
    github.com/WeidiDeng/caddy-cloudflare-ip \
    github.com/greenpau/caddy-security \
    github.com/caddyserver/transform-encoder
FROM caddy:latest

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```

As you might see i changed the port from goaccess to 443 this is cause the port is hardcoded based on your config. Here is my final goaccess config too

```
cat /etc/goaccess/goaccess.conf
addr 0.0.0.0
port 443
daemonize false
real-time-html true
time-format %H:%M:%S
date-format %d/%b/%Y
log-format VCOMBINED
log-file /var/log/caddy/access.log
output /var/www/goaccess/index.html
```

I put my config in `/etc/goaccess/goaccess.conf` cause it was easier for testing but feel free to keep it as in the hectorm's example
