use crate::nft;
use crate::philips_hue::{blink, change_color, GREEN, RED, YELLOW};
use crate::pool::Pool;

use actix::prelude::*;
use actix_web::{
    error,
    web::{Data, Json},
    Responder,
};
use serde::Deserialize;

const HARDCODED_CAR_ID: u128 = 37;

#[derive(Deserialize)]
pub struct SignedPayload {
    message: String,
    signature: String,
}

#[derive(Deserialize, Debug)]
pub struct Message {
    id: u128,
    nonce: String,
    action: String,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct OpenTheCar {}

pub async fn open(pool: Data<Addr<Pool>>, payload: Json<SignedPayload>) -> impl Responder {
    let message: Message = serde_json::from_str(payload.message.as_str())
        .or_else(|e| Err(error::ErrorBadRequest(format!("invalid message: {:?}", e))))?;

    if message.id != HARDCODED_CAR_ID {
        println!("wrong car");
        return Err(error::ErrorBadRequest("wrong car"));
    }

    let car_owner = nft::get_car_owner().await.unwrap();
    let message_owner = nft::get_message_signer(payload.message.clone(), payload.signature.clone());
    let message_owner = match message_owner {
        Ok(owner) => owner,
        Err(e) => {
            println!("{:?}", e);
            blink(YELLOW).await;
            return Err(error::ErrorBadRequest(e));
        }
    };

    if message_owner != car_owner {
        println!(
            "real owner {:?}, request received from {:?}",
            car_owner, message_owner,
        );
        blink(YELLOW).await;
        return Err(error::ErrorBadRequest("not the owner"));
    }

    change_color(GREEN).await;

    pool.try_send(OpenTheCar {}).unwrap();
    Ok("Opening the car!")
}

impl Handler<OpenTheCar> for Pool {
    type Result = ();

    fn handle(&mut self, _msg: OpenTheCar, _: &mut Context<Self>) {
        self.send_message("open the car!!")
    }
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct CloseTheCar {}

pub async fn close(pool: Data<Addr<Pool>>) -> impl Responder {
    change_color(RED).await;

    pool.try_send(CloseTheCar {}).unwrap();
    "Closing the car!"
}

impl Handler<CloseTheCar> for Pool {
    type Result = ();

    fn handle(&mut self, _msg: CloseTheCar, _: &mut Context<Self>) {
        self.send_message("close the car!!")
    }
}
