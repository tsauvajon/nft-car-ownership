const CarNFT = artifacts.require("CarNFT");

module.exports = function (deployer) {
    deployer.deploy(CarNFT);
};
