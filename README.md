# WebRTC
Proof of concept for controlling a presentation framework in the browser using a mobile phone. Works by simulating events that trigger slide changes.

## Use
* download the code
* add a presentation that works over left and right arrow keypresses (impress.js, jmpress.js, reveal.js, etc.) to the presentation folder
* get a peer key from http://peerjs.com/peerserver, add it to the top of script.js
* upload everything to a host
* open the app in two browsers
* add 'Your ID' from one browser to the 'Connect to a peer' field in the other, click connect, approve the connection in the first browser
* click on next/prev

## TODO
* remove the iframe, have the project work as a plugin that adds its own small/hidden UI elements
* better synchronisation of connection approval/denial
* add keypress synchronisation toggle in case of state mismatch
* improve UI design

## References
* http://peerjs.com/
* https://github.com/peers/peerjs/blob/master/examples/chat.html
