use hex_literal::hex;
use web3::{
    contract::{Contract, Options},
    types::{Address, U256},
};

const OWNER_OF: &str = "ownerOf";

pub async fn get_car_owner() -> web3::Result<Address> {
    let transport = web3::transports::Http::new(
        "https://eth-rinkeby.alchemyapi.io/v2/0hNqd5zfmqjAkLuwmphxjg_v6gEaOkiH",
    )?;
    let web3 = web3::Web3::new(transport);

    // TODO: get from the JSON instead (and strip 0x).
    // (this is the contract owner address, i.e. the address that deployed it unless you change it).
    let contract_address: Address = hex!("9F6eddB2Df4bE6e95fca79d1b1737F483CC6027d").into();
    let contract = Contract::from_json(
        web3.eth(),
        contract_address,
        include_bytes!("../../../nft/build/abi.json"),
    )
    .unwrap();

    let result = contract
        .query(OWNER_OF, (U256::from(37),), None, Options::default(), None)
        .await
        .unwrap();

    Ok(result)
}
