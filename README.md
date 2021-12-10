# Overview

This is not about opening/locking the car.
This is about ownership!

## "Classic" ownership

The regular way of owning a car is buying the keys against money:
- cash -> not safe for the buyer, not always convenient for the seller
- regular cheque -> takes time, risky for the seller
- bank wire -> not convenient and risky for the buyer
- bank cheque -> slow, not convenient and expensive for the buyer

All of them require a physical exchange of the car keys. And all of them require payment before the keys are transferred to the new owner.

## NFT ownership

This project is all about showing an alternate way of thinking about ownership, and especially transferring ownership.
It comes with its set of challenges and drawbacks, but it improves a few things:
- it can lessen the need for a legal framework, especially important in less regulated countries. The true ownership is defined programatically, in the Ethereum blockchain
- transfer of ownership is tied to a pre-defined exchange of money, and both happen at the same time (instead of payments => keys)
- totally virtual, which can help mitigate physical aggression/theft risk

Downsides (they can be mitigated):
- subject to DDoS attacks
- if you lose your private key, you lose your car
- additional cybersecurity challenges

![overview](./docs/overview.png)

TODO: explain the diagram

# How it works

## 1. The manufacturer creates a car

![building a car and minting an NFT for it](./docs/mint_nft.png)

TODO: explain

Cost: gas fees for minting the NFT

## 2. Someone buys the car

![buy the NFT, you get full control over the car](./docs/buy_car.png)

TODO: explain

Cost: gas fees for transferring the NFT

## 3. The owner uses the car

Lock or unlock the doors, start the engine...

![flow to unlock the car](./docs/unlock_car.png)

TODO: explain

Cost: no gas fees - we're just signing a message and sending it over.

## 4. The owner resells the car

On a marketplace, directly to someone else...

![reselling the car is simply trading the NFT](./docs/resell_car.png)

TODO: explain

Cost: gas fees for transferring the NFT

# TODO

- Shared configuration (ports, web3 API address...)
- Single setup command for all the parts of the project
- Video demo
