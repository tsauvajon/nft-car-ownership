// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./0xcert-erc721/erc721-token-receiver.sol";
import "./CarNFT.sol";

contract Rental is CarNFT, ERC721TokenReceiver {
    mapping(uint256 => uint256) public rentalListings; // token id => price per day for each car that is available for renting.

    struct RentedCar {
        address rentee; // Car owner who gets money for lending the car.
        address renter; // Person who pays the rent for using the car.
        uint256 deadline; // When the rental ends.
    }

    mapping(uint256 => RentedCar) public activeRentals;

    modifier isListed(uint256 _tokenId) {
        require(rentalListings[_tokenId] != 0, "Not listed");
        _;
    }

    modifier isAvailable(uint256 _tokenId) {
        require(rentalListings[_tokenId] == 0, "Car is listed for rent");
        require(activeRentals[_tokenId].rentee != address(0), "Car is rented");
        _;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyNFTOwner(uint256 _tokenId) {
        require(msg.sender == activeRentals[_tokenId].rentee, NOT_OWNER);
        _;
    }

    function listForRent(uint256 _tokenId, uint256 _price)
        public
        isAvailable(_tokenId)
    {
        NFToken(this).approve(address(this), _tokenId);

        rentalListings[_tokenId] = _price;

        emit CarListedForRent(_tokenId, _price);
    }

    function endRental() public {
        // TODO: think about how to do this:
        //   time based e.g. using https://github.com/ethereum-alarm-clock/ethereum-alarm-clock?
        //   delegate it to some off-chain app?
        //   owner-triggered, at the risk of not giving the car long enough?
        // TODO: emit an event
    }

    function onERC721Received(
        address _operator,
        address _from,
        uint256 _tokenId,
        bytes calldata _data
    ) external onlyNFTOwner(_tokenId) returns (bytes4) {
        activeRentals[_tokenId] = RentedCar(
            _from,
            _operator,
            block.timestamp + 1 days // instead get it from the calldata
        );

        return MAGIC_ON_ERC721_RECEIVED;
    }

    function rent(uint256 _tokenId) public payable isListed(_tokenId) {
        uint256 duration = msg.value / rentalListings[_tokenId];
        require(duration > 0, "Minimum rental not reached");

        NFToken(this).transferFrom(
            NFToken(this).ownerOf(_tokenId),
            address(this),
            _tokenId
        );
        // TODO: transfer NFT to the contract
    }

    event CarListedForRent(uint256 indexed _tokenId, uint256 indexed _price);
}
