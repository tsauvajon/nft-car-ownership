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
const UNLOCK_DOORS: &str = "UNLOCK_DOORS";
const LOCK_DOORS: &str = "LOCK_DOORS";

#[derive(Deserialize)]
pub struct SignedPayload {
    message: String,
    signature: String,
}

#[derive(Deserialize, Debug)]
pub struct Message {
    car_id: u128,
    nonce: u128,
    action: String,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct UnlockTheCar {}

impl Handler<UnlockTheCar> for Pool {
    type Result = ();

    fn handle(&mut self, _msg: UnlockTheCar, _: &mut Context<Self>) {
        self.send_message("unlock the car!!")
    }
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct LockTheCar {}

impl Handler<LockTheCar> for Pool {
    type Result = ();

    fn handle(&mut self, _msg: LockTheCar, _: &mut Context<Self>) {
        self.send_message("lock the car!!")
    }
}

pub async fn execute(pool: Data<Addr<Pool>>, payload: Json<SignedPayload>) -> impl Responder {
    let message: Message = serde_json::from_str(payload.message.as_str())
        .or_else(|e| Err(error::ErrorBadRequest(format!("invalid message: {:?}", e))))?;

    if message.car_id != HARDCODED_CAR_ID {
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

    match message.action.as_str() {
        UNLOCK_DOORS => {
            pool.try_send(UnlockTheCar {}).unwrap();
            change_color(GREEN).await;
        }
        LOCK_DOORS => {
            pool.try_send(LockTheCar {}).unwrap();
            change_color(RED).await;
        }
        _ => return Err(error::ErrorBadRequest("unknown action")),
    };

    Ok("Unlocking the car!")
}
