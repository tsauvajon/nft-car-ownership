const fs = require('fs');
const contract = JSON.parse(fs.readFileSync('./build/contracts/CarNFT.json', 'utf8'));
fs.writeFileSync('./build/abi.json', JSON.stringify(contract.abi));
