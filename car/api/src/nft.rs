use hex;
use serde::Deserialize;
use std::collections::HashMap;
use web3::{
    contract::{Contract, Options},
    signing::{keccak256, RecoveryError},
    types::{Address, U256},
};

const OWNER_OF: &str = "ownerOf";

#[derive(Deserialize, Debug)]
pub struct SolcOutput {
    abi: Vec<HashMap<String, serde_json::Value>>,
    networks: HashMap<String, Network>,
}

#[derive(Deserialize, Debug)]
struct Network {
    address: String,
}

fn read_compiled_contract() -> Result<SolcOutput, Box<dyn std::error::Error>> {
    let solc_output: SolcOutput = serde_json::from_slice(
        include_bytes!("../../../nft/build/contracts/CarNFT.json").as_ref(),
    )?;

    Ok(solc_output)
}

// TODO: call me once and pass me along
fn get_contract() -> web3::Result<Contract<web3::transports::Http>> {
    let transport = web3::transports::Http::new(
        // TODO: config
        "https://eth-rinkeby.alchemyapi.io/v2/0hNqd5zfmqjAkLuwmphxjg_v6gEaOkiH",
    )?;
    let web3 = web3::Web3::new(transport);
    let contract_metadata = read_compiled_contract().unwrap();

    let mut contract_address: [u8; 20] = Default::default();
    contract_address.copy_from_slice(
        &strip_0x_prefix(&contract_metadata.networks["4"].address).as_bytes()[..20],
    );
    let contract_address: Address = contract_address.into();

    let contract = Contract::from_json(
        web3.eth(),
        contract_address,
        &serde_json::to_vec(&contract_metadata.abi).unwrap(),
    )
    .unwrap();

    Ok(contract)
}

pub async fn get_car_owner() -> web3::Result<Address> {
    let contract = get_contract()?;
    let result = contract
        .query(OWNER_OF, (U256::from(37),), None, Options::default(), None)
        .await
        .unwrap();

    Ok(result)
}

fn strip_0x_prefix(data: &String) -> String {
    match data.strip_prefix("0x") {
        Some(stripped) => stripped.to_string(),
        None => data.to_owned(),
    }
}

pub fn get_message_signer(message: String, signature: String) -> Result<Address, RecoveryError> {
    let decoded_signature = hex::decode(strip_0x_prefix(&signature)).unwrap();
    web3::signing::recover(&eth_message(message), &decoded_signature[..64], 0)
}

fn eth_message(message: String) -> [u8; 32] {
    keccak256(
        format!(
            "{}{}{}",
            "\x19Ethereum Signed Message:\n",
            message.len(),
            message
        )
        .as_bytes(),
    )
}

#[test]
fn test_get_message_signer() {
    let message = "{\"some_data\": 123}";
    let signature = "b506a2a54d1c94c875157d46bdfd6f2527ac862476cd67d7a246f20fccbbd8cb630611f21c763d24d31af631c43962f79a54250f8ad7ed5d424b0f3ab04886c71b";

    let got = get_message_signer(message.to_string(), signature.to_string());
    let want: Address = hex_literal::hex!("481f83db3cd7342364bf16fb4abbd7978d09bace").into();
    assert_eq!(Ok(want), got);
}

#[test]
fn test_get_message_signer_with_0x_prefix() {
    let message = "{\"some_data\": 123}";
    let signature = "0xb506a2a54d1c94c875157d46bdfd6f2527ac862476cd67d7a246f20fccbbd8cb630611f21c763d24d31af631c43962f79a54250f8ad7ed5d424b0f3ab04886c71b";

    let got = get_message_signer(message.to_string(), signature.to_string());
    let want: Address = hex_literal::hex!("481f83db3cd7342364bf16fb4abbd7978d09bace").into();
    assert_eq!(Ok(want), got);
}
