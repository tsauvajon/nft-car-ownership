use crate::nft;
use crate::philips_hue::{change_color, GREEN, RED};
use crate::pool::Pool;

use actix::prelude::*;
use actix_web::{web::Data, Responder};

#[derive(Message)]
#[rtype(result = "()")]
pub struct OpenTheCar {}

impl Handler<OpenTheCar> for Pool {
    type Result = ();

    fn handle(&mut self, _msg: OpenTheCar, _: &mut Context<Self>) {
        self.send_message("open the car!!")
    }
}

pub async fn open(pool: Data<Addr<Pool>>) -> impl Responder {
    let car_owner = nft::get_car_owner().await.unwrap();
    println!("owner: {:?}", car_owner);

    change_color(GREEN).await;

    pool.try_send(OpenTheCar {}).unwrap();
    "Opening the car!"
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct CloseTheCar {}

impl Handler<CloseTheCar> for Pool {
    type Result = ();

    fn handle(&mut self, _msg: CloseTheCar, _: &mut Context<Self>) {
        self.send_message("close the car!!")
    }
}

pub async fn close(pool: Data<Addr<Pool>>) -> impl Responder {
    change_color(RED).await;

    pool.try_send(CloseTheCar {}).unwrap();
    "Closing the car!"
}
