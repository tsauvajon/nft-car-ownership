## Design

The car backend can:
- receive calls to open/close the car
- transmit these orders to the car via websocket

Authentication?

The car needs to accept only calls from the owner, reject the other calls.
So the calls need to be signed with a wallet, somehow.

## Framework

I chose Actix Web over Rocket, because Rocket requires nightly and I wanted to stay on stable.
