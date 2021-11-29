pub async fn accounts() -> web3::Result<()> {
    let transport = web3::transports::Http::new(
        "https://eth-rinkeby.alchemyapi.io/v2/0hNqd5zfmqjAkLuwmphxjg_v6gEaOkiH",
    )?;
    let web3 = web3::Web3::new(transport);

    let accounts = web3.eth().accounts().await?;
    println!("Accounts: {:?}", accounts);

    println!("Calling balance.");
    for account in accounts {
        let balance = web3.eth().balance(account, None).await?;
        println!("Balance of {:?}: {}", account, balance);
    }

    Ok(())
}
