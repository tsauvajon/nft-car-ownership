// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./0xcert-erc721/nf-token-enumerable.sol";
import "./0xcert-erc721/ownable.sol";

/**
 * @dev This is an example contract implementation of NFToken with enumerable extension.
 */
contract CarNFT is NFTokenEnumerable, Ownable {
    /**
     * @dev Mints a new NFT.
     * @param _to The address that will own the minted NFT.
     * @param _tokenId of the NFT to be minted by the msg.sender.
     */
    function mint(address _to, uint256 _tokenId) external onlyOwner {
        super._mint(_to, _tokenId);
    }

    /**
     * @dev Removes a NFT from owner.
     * @param _tokenId Which NFT we want to remove.
     */
    function burn(uint256 _tokenId) external onlyOwner {
        super._burn(_tokenId);
    }

    // Helpers

    function idToOwnerIndex(uint256 _tokenId) external view returns (uint256) {
        return _idToOwnerIndex[_tokenId];
    }

    function idToIndex(uint256 _tokenId) external view returns (uint256) {
        return _idToIndex[_tokenId];
    }

    function ownerToIdsLen(address _owner) external view returns (uint256) {
        return ownerToIds[_owner].length;
    }

    function ownerToIdbyIndex(address _owner, uint256 _index)
        external
        view
        returns (uint256)
    {
        return ownerToIds[_owner][_index];
    }
}
