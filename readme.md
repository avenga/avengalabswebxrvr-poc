# WebXR VR demo - Avenga Labs meets Avenga Values

## What is it

It's a simple WebXR VR demo showing [Avenga](https://avenga.com) values in VR.

[Here](https://avengalabs-webxrvr-74a6c21.wao.zone) you can see the working demo.

[Here](https://youtu.be/mmJGd4VfP3M) you can see headset recorded video.

## How to build

1. Make sure you have *webpack* installed.

2. Install three.js
`npm install three`

3. Build
`npx webpack`

## How to run locally

1. Install simple web server
`npm install http-server`
(tested also on nginx, it's only statis content so should work with other http servers)

2. Run web server locally in local project directory, https recommended (required by Oculus headsets)
`http-server -S . -p 443 -C cert.pem`

### Test inside local browser

1. Install WebXR extensions for your browser

<https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje> - for Chrome

<https://addons.mozilla.org/en-US/firefox/addon/webxr-api-emulator/> - for Firefox

- Open *<https://127.0.0.1>* on local machine to test it.

- Enable WebXR with developer tools, you can change the position of virtual headset, use controllers, etc.

### Test with your headset in local (wifi) network

- Find out what is the local IP address of your development laptop / Mac / PC

- Open <https://your-dev-machine-address> in your headset (i.e. Oculus Browser)

## Contact

[Jacek Chmiel](jacek.chmiel@avenga.com)

Follow us:

[Medium](https://medium.com/avenga)

[Twitter](https://twitter.com/avenga_global)

[LinkedIN](https://www.linkedin.com/company/avenga/)
