---
layout: "../../layouts/BlogPost.astro"
title: "Adding kanidm login to linkwarden"
description: "Some quick info on adding kanidm login to linkwarden"
pubDate: "Jul 22 2025"
heroImage: "/assets/links.tricked.dev_login.png"
---

Basically create a application (quick plug try: [using my kanidm web ui oauth2 manager](https://github.com/Tricked-dev/kanidm-oauth2-manager) for creating it instead) with legacy crypto enabled you can keep pkce on on linkwarden though and set the redirect url to "https://<linkwarden-instance>/api/v1/auth/callback/authentik"

```ini title=.env
NEXT_PUBLIC_AUTHENTIK_ENABLED=true
AUTHENTIK_CUSTOM_NAME="Kanidm"
AUTHENTIK_ISSUER="https://<kanidm>/oauth2/openid/linkwarden"
AUTHENTIK_CLIENT_ID="linkwarden"
AUTHENTIK_CLIENT_SECRET="<secret>"
```

Then add the following settings to linkwarden and the button to login with Kanidm should be there, If you already have a account doing this will likely create a new account if you want to keep using the old one you can edit the database but i will leave that part as a readers exercise. 