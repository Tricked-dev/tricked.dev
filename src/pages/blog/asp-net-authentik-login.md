---
layout: "../../layouts/BlogPost.astro"
title: "Adding authentik login to asp.net application"
description: "Configs for adding authentik login to asp.net application"
pubDate: "May 13 2024"
heroImage: "/assets/1903255995_A paper plane flying over a city  _xl-beta-v2-2-2.png"
---

All you need to do to add authentik login to asp.net is to add these options to your services:

```c#
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "Cookies";
    options.DefaultChallengeScheme = "oidc";
})
.AddCookie("Cookies")
.AddOpenIdConnect("oidc", options =>
{
    options.Authority = oauthAuthority;
    options.ClientId = oauthId;
    options.ClientSecret = oauthSecret; // Securely store and load this value
    options.ResponseType = "code";

    options.SaveTokens = true;

    options.Scope.Add("openid");
    options.Scope.Add("profile");
    options.Scope.Add("email");

    options.GetClaimsFromUserInfoEndpoint = true;

    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        NameClaimType = "name"
    };

    // Optionally handle events
    options.Events = new Microsoft.AspNetCore.Authentication.OpenIdConnect.OpenIdConnectEvents
    {
        OnAuthenticationFailed = context =>
        {
            // Log or handle authentication failures
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            // Additional token validation can go here
            return Task.CompletedTask;
        }
    };
});
```

The config options can be obtained from creating a oauth2 application on authentik and pasting them here

```c#
options.Authority = oauthAuthority;
options.ClientId = oauthId;
options.ClientSecret = oauthSecret;
```

All you need to do now is add `[Authorize]` to your controllers and done!

Well, unless you actually want to get the user info you can use this neat little extension i made

```c#


public class UserClaims
{
    public string UserId { get; set; }
    public string Email { get; set; }
    public bool EmailVerified { get; set; }
    public string Username { get; set; }
    public string Nickname { get; set; }
    public string[] Groups { get; set; }
}

public static class HttpContextExtensions
{
    public static UserClaims GetUserClaims(this HttpContext context)
    {
        var claims = context.User.Claims;

        var userClaims = new UserClaims
        {
            UserId = claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value,
            Email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value,
            EmailVerified = claims.FirstOrDefault(c => c.Type == "email_verified")?.Value == "true",
            Username = claims.FirstOrDefault(c => c.Type == "preferred_username")?.Value,
            Nickname = claims.FirstOrDefault(c => c.Type == "nickname")?.Value,
            Groups = claims.Where(c => c.Type == "groups").Select(c => c.Value).ToArray(),
        };

        return userClaims;
    }
}



// somewhere in one of your routes you can do this
var uinfo = HttpContext.GetUserClaims(); // HttpContext is reachable from anywhere no need to define it or anything
// maybe add iot tot he viewbag so it can be used everywhere
ViewBag.User = uinfo;

```
