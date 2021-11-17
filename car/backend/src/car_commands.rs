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
    pool.try_send(OpenTheCar {}).unwrap();
    "Opening the car!"
}

pub async fn close() -> impl Responder {
    "Closing the car!"
}
