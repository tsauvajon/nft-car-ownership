

This is not about opening/locking the car.
This is about ownership!

Right now: you give the keys against money:
- cash -> not safe for the buyer, not always convenient for the seller
- regular cheque -> takes time, risky for the seller
- bank wire -> not convenient and risky for the buyer
- bank cheque -> slow, not convenient and expensive for the buyer

All of them require a physical exchange of the car keys. And all of them require payment before the keys are transferred to the new owner.

This repo is all about showing an alternate way of thinking about ownership and changing ownership.
It comes with its set of challenges and drawbacks, but it improves a few things:
- it can lessen the need for a legal framework, especially important in less regulated countries. The true ownership is defined programatically, in the Ethereum blockchain
- transfer of ownership is tied to a pre-defined exchange of money, and both happen at the same time (instead of payments => keys)
- totally virtual, which can help mitigate physical aggression/theft risk

Downsides (they can be mitigated):
- subject to DDoS attacks
- if you lose your private key, you lose your car
- added cybersecurity challenges

# Implementation

Costs:
- minting an NFT (gas fee)
- selling an NFT (gas fee)

Using the NFT to open/close the car is free bcs signature etc.

# TODO

- Shared configuration (ports, web3 API address...)
- Diagrams:
  - General flow
  - Signature (payload + private key => signature /// payload + signature => public key /// check NFT owner to see if it matches the public key)
