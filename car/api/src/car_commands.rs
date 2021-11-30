use crate::nft;
use crate::pool::Pool;

use actix::prelude::*;
use actix_web::{web::Data, Responder};
use hyper::{Client, StatusCode, Uri};

const RED: u32 = 1000;
const GREEN: u32 = 25000;

pub async fn change_color(hue: u32) {
    for id in 1..=2 {
        set_light_color(hue, id).await;
    }
}

pub async fn set_light_color(hue: u32, light_id: u32) {
    let client = Client::new();
    let uri = format!(
        "http://192.168.1.33/api/9O2NMKebbLLjIY4Ekxhqa18-jP9hSTp7lp-oXzn1/lights/{:?}/state",
        light_id
    )
    .parse::<Uri>()
    .unwrap();

    use hyper::{Body, Method, Request};
    let req = Request::builder()
        .method(Method::PUT)
        .uri(uri)
        .body(Body::from(format!(
            "{{\"on\":true, \"sat\":254, \"bri\":254,\"hue\":{:?}}}",
            hue
        )))
        .unwrap();

    let resp = client.request(req).await.unwrap();
    if resp.status() != StatusCode::OK {
        println!("{:?}: {:?}", resp.status(), resp.body());
    }
}

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
