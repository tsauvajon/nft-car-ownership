use hex;
use web3::{
    contract::{Contract, Options},
    signing::{keccak256, RecoveryError},
    types::{Address, U256},
};

const OWNER_OF: &str = "ownerOf";

pub async fn get_car_owner() -> web3::Result<Address> {
    let transport = web3::transports::Http::new(
        // TODO: config
        "https://eth-rinkeby.alchemyapi.io/v2/0hNqd5zfmqjAkLuwmphxjg_v6gEaOkiH",
    )?;
    let web3 = web3::Web3::new(transport);

    // TODO: get from the JSON instead (and strip 0x).
    // (this is the contract owner address, i.e. the address that deployed it unless you change it).
    let contract_address: Address =
        hex_literal::hex!("9F6eddB2Df4bE6e95fca79d1b1737F483CC6027d").into();
    let contract = Contract::from_json(
        web3.eth(),
        contract_address,
        include_bytes!("../../../nft/build/abi.json"), // TODO: get it from the regular build artifact and extract the ABI.
    )
    .unwrap();

    let result = contract
        .query(OWNER_OF, (U256::from(37),), None, Options::default(), None)
        .await
        .unwrap();

    Ok(result)
}

pub fn get_message_signer(message: String, signature: String) -> Result<Address, RecoveryError> {
    let raw_signature = match signature.strip_prefix("0x") {
        Some(stripped) => stripped.to_string(),
        None => signature,
    };

    let decoded_signature = hex::decode(raw_signature).unwrap();
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
