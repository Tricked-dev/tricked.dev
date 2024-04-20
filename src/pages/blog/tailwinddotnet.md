---
layout: "../../layouts/BlogPost.astro"
title: "Avoiding npm & nodejs when using asp.net and tailwindcss using Bun"
description: "Simple guide on how to use bun with ASP.net and tailwindcss"
pubDate: "April 19 2024"
heroImage: "/assets/1903255995_A paper plane flying over a city  _xl-beta-v2-2-2.png"
---

Using tailwindcss with asp.net can be annoying with having to install node and npm on windows and updating it etc. Installing bun is much simpler and doesn't require npm.

## Introduction to Bun

Bun is a package manager that aims to simplify the development process by eliminating the need for a `node_modules` folder and a `package.json` file. It works by installing packages into a global cache and using them from there, effectively making it work like Deno. This approach can significantly speed up the build process and reduce the clutter in your project directories.

## Setting Up Your ASP.NET Project

To get started, you'll need to have an ASP.NET project set up. If you don't have one, you can create a new project using the .NET CLI with the command `dotnet new webapp -o MyWebApp`.

## Integrating Bun with ASP.NET

### Adding Bun to Your Project

First, you need to ensure that Bun is installed on your system. If it's not, you can install it by following the instructions on the [Bun website](https://bun.sh/). Once installed, you can verify the installation by running `bun -v` in your terminal.

### Configuring Your Project to Use Bun

To make your ASP.NET project use Bun for building and reloading, you need to add specific targets to your `.csproj` file. These targets will check for Bun's presence and use it to build your CSS with Tailwind CSS.

Open your `.csproj` file and add the following targets:

```xml
<Target Name="CheckForBun" BeforeTargets="BunInstall">
 <Exec Command="bun -v" ContinueOnError="true">
    <Output TaskParameter="ExitCode" PropertyName="ErrorCode" />
 </Exec>
 <Error Condition="'$(ErrorCode)' != '0'" Text="You must install Bun to build this project" />
</Target>

<Target Name="BuildCSS" BeforeTargets="Compile">
 <Exec Command="bun tailwind.config.js build" Condition=" '$(Configuration)' == 'Debug' " />
 <Exec Command="bun tailwind.config.js release" Condition=" '$(Configuration)' == 'Release' " />
</Target>
```

To get hot reloading open a new shell and do `bun tailwind.config.js watch`.

### Setting Up Tailwind CSS with Bun

Next, you'll need to set up Tailwind CSS in your project. Create a `tailwind.config.js` file in your project root with the following content:

```js
/** @type {import('tailwindcss').Config} */
require("postcss");

const scripts = {
  build: "",
  watch: "--watch",
  release: "--minify",
};

module.exports = {
  content: ["./**/*.{razor,cshtml,html}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};

if (require.main) {
  let cmd = process.argv[2];
  if (cmd in scripts) {
    Bun.$`bunx tailwindcss -i ./Styles/app.css -o ./wwwroot/css/app.css ${scripts[cmd]}`.then(
      console.log
    );
  }
}
```

This configuration file not only sets up Tailwind CSS but also acts as a script manager, allowing you to build and watch your CSS files with Bun.

### Creating Your Stylesheet

Create a `Styles/app.css` file in your project with the following content:

```css
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
```

Then, add a reference to this stylesheet in your `.cshtml` files to apply the Tailwind CSS styles.

### Docker Integration

If you're using Docker for your development environment, you can integrate Bun by updating your `Dockerfile` to install Bun. Here's how you can do it:

```diff
+RUN apt-get update && apt-get install -y unzip
WORKDIR /src
+ENV BUN_INSTALL=/usr/local
+RUN curl -fsSL https://bun.sh/install | bash
COPY ["Example/Example.csproj", "Example/"]
RUN dotnet restore "./Example/./Example.csproj"
COPY . .
WORKDIR "/src/Example"
+RUN rm -rf node_modules
```

This will ensure that Bun is installed in your Docker container, making it available for building your project.

## Conclusion

This works pretty well and is fast but idea integrations stop working so i just create a package.json and basically removed all benefits of this later lol. You still dont need npm and node though :D

## Credit

Based on <https://stackoverflow.com/questions/57669027/how-do-you-add-tailwind-css-into-a-blazor-app>
