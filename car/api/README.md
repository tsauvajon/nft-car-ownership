## Design

The car backend can:
- receive calls to open/close the car
- transmit these orders to the car via websocket

Authentication?

The car needs to accept only calls from the owner, reject the other calls.
So the calls need to be signed with a wallet, somehow.

## Framework

I chose Actix Web over Rocket, because Rocket requires nightly and I wanted to stay on stable.

After moving further with the project, I found that due to differences
in Tokio versions between `actix-web` v3 and `web3` v0.17, I had to use
`actix-web` v4, that is a beta right now (Nov 2021). I also had to use
`actix-cors` and `actix-web-actors` on beta versions.

## TODO

- Deploy on the Raspberry Pi
- Config!!
- Blink function with Philips Hue:
  - get the current color into a variable
  - switch back and forth between blink color and current color, with a delay between each change
  - restore current color
