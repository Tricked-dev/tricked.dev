---
layout: "../../layouts/BlogPost.astro"
title: "Kanidm and caddy security properly securing websites"
description: "How to properly secure sites with kanidm and caddy security, creating different oauth2 applications per subdomain and seamless login"
pubDate: "Jul 12 2025"
heroImage: "/assets/ChatGPT Image Jul 12, 2025, 09_01_21 PM.png"
---


In this example we will be securing esphome a well known application for creating esp32's that connect to homeassistant to provide sensor data and other type's of microcontroller shenigens, i will be hosting it on "esphome.tricked.dev" for this example

```nginx
{
        order authenticate before respond
        order authorize before reverse_proxy

        security {
                oauth identity provider kanidm_esphome {
                        realm esphome
                        driver generic
                        client_id "esphome"
                        client_secret {$CRED_ESPHOME_SECRET}
                        metadata_url https://idm.tricked.dev/oauth2/openid/esphome/.well-known/openid-configuration
                        scopes openid email profile groups
                }

                authentication portal authportal_esphome {
                        crypto default token lifetime 3600
                        # Set the cookie on just the subdomain
                        cookie domain esphome.tricked.dev
                        # Ideally you should use a different shared_key per host to avoid the ability to reuse cookies on other domains
                        crypto key sign-verify {env.SHARED_KEY}
                        enable identity provider kanidm_esphome
                }

                authorization policy esphome_policy {
                        # This way if you get unauthenticated it skips right to the kanidm login page instead of first showing caddy security login page
                        set auth url https://esphome.tricked.dev/auth/oauth2/esphome
                        crypto key sign-verify {env.SHARED_KEY}
                        # Limit access per group the <tricked.dev> should be replaced with the kanidm domain, in the examples you see the use of roles but that does not work here you NEED to use groups
                        allow groups generic_users@tricked.dev
                }
        }
}

# Use a wildcard here to avoid exposing the subdomain so easily with certificate transparency
*.tricked.dev {
    @esphome host esphome.tricked.dev
    handle @esphome {
        # Run the auth stuff on /auth otherwise you wont be able to access the website
        route /auth/* {
            authenticate with authportal_esphome
        }
        authorize with esphome_policy
        reverse_proxy :6052
    }
}
```

Creating the application on the kanidm side

```
kanidm system oauth2 create esphome
kanidm group create generic_users
kanidm system oauth2 set-landing-url esphome "https://esphome.tricked.dev"
kanidm system oauth2 add-redirect-url sonarr "https://esphome.tricked.dev/auth/oauth2/esphome/authorization-code-callback"
kanidm system oauth2 update-scope-map esphome generic_users email openid profile groups
kanidm system oauth2 warning-enable-legacy-crypto esphome

kanidm system oauth2 show-basic-secret esphome
```

Now put this in the environment for caddy

```ini
# kanidm system oauth2 show-basic-secret esphome
# openssl rand -base64 48
CRED_ESPHOME_SECRET=
SHARED_SECRET=
```

This was the complete effort of spending 5 (or many more) hours trying and researching things about caddy security and looking through caddy-security information

Creating a new application is as simple as changing the subdomain and copying the security configs again with a different name

If you find any improvements to this setup after trying it out please do create a comment on this blog with the better solution

A tiny pitfall is that when you do it this way if kanidm is running on the same server as caddy caddy-security will try to fetch the information about the openid connectors before caddy has fully started making it impossible to run them from the same server without some hacks (somehow skiupping tls veri and some other hurdles i came accross while going down that path), the alternative i used for this was that i was already running cloudflare tunnel that was redirecting all traffic to caddy so i made a extra rule for specifically kanidm to work without caddy in cloudflare zero trust.
![alt text](/assets/zt-image.png)