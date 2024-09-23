---
layout: "../../layouts/BlogPost.astro"
title: "Webrtc Pitfalls"
description: "Weird things i came across while making a webrtc p2p game"
pubDate: "Sep 23 2024"
heroImage: "/assets/1903255995_A paper plane flying over a city  _xl-beta-v2-2-2.png"
---

While creating a webrtc p2p game i came across a bunch of webrtc chat examples to base my own game of like [This article](https://dev.to/eneaslari/create-a-peer-to-peer-chat-app-with-webrtc-40m3) chatgpt and other sites. All those examples worked fine on chrome on my network for the most part but they didn't work on firefox due to me using datachannels and sending binary.

> PITFALL 1 - Binary Type
> https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel/binaryType

By default chrome uses ArrayBuffer and Firefox Blob this makes the code incompatible with eachother to fix this you just have to change the binary type but good luck knowing this from the start while testing on firefox

So then i wanted to test my website locally on firefox instead of my deployed one but was suprised with weird error saying i need to add a turn server even though it works perfectly fine on chrome for me, so after a bunch of digging and searching the incorrect terms i came accross this.

> PITFALL 2 - WebRTC ICE gathering fails in completely pure LAN environment
> https://bugzilla.mozilla.org/show_bug.cgi?id=1659672

And the belonging stackoverflow answer https://stackoverflow.com/questions/72862092/webrtc-ice-failed-in-firefox-but-working-in-ms-edge the solution for this problem is to use a tunnel service like ngrok [or friends](https://github.com/anderspitman/awesome-tunneling) and test your application on a http enviroment fun right!

And even after all this i couldnt get webrtc to be that reliable and ended up suffering many more issues with it that i couldnt figure out how to fix. So i did the thing that every js developer does best and searched for a package to fix my issues, i quickly came accross simple-peer tried it out and it didnt work with vite out of the box :\(. But desprate to fix my issues i tried polyfilling the node EventEmitter and i got it to work-ish. Sending binary didnt work as the other side wouldnt receive it but my solution for that was to grab the datachannel myself and add my own event handlers

```js
const p = new SimplePeer({
  initiator: location.hash === "#1",
  trickle: false,
});
p._channel.onmessage = (message) => {
  // my own logic
};
// sending via my own method
p._channel.send;
```

I had to patch the SimplePeer library to remove the default onmessage handler cause it would overwrite mine sometimes. But after that it was working mostly flawlessly. After using claude to generate [some types for the libary](https://github.com/Tricked-dev/knucklebones/blob/4cb3ee0251749ca1b88cc261775537d97b8a18ad/src/lib/peer/lite.d.ts#L29) i was set and ready to tackle other problems.
