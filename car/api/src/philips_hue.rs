/**
 * Philips Hue is a line of color changing LED lamps and white
 * bulbs which can be controlled wirelessly.
 *
 * In my case, I have two color LED lamps that I can control with
 * a simple HTTP API.
 *
 * By turning them green on unlock or red on lock, I made my development flow
 * easier (fewwer ALT+TABs needed), and also had fun with the changing
 * colors.
 */
use hyper::{Client, StatusCode, Uri};
use tokio;

pub const RED: u32 = 1000;
pub const YELLOW: u32 = 9000;
pub const GREEN: u32 = 25000;

// TODO: implement me.
pub async fn blink(hue: u32) {
    change_color(hue).await;
}

pub async fn change_color(hue: u32) {
    for id in 1..=2 {
        tokio::spawn(async move {
            set_light_color(hue, id).await;
        });
    }
}

async fn set_light_color(hue: u32, light_id: u32) {
    let client = Client::new();
    let uri = format!(
        // TODO: config
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
            // TODO: JSON
            "{{\"on\":true, \"sat\":254, \"bri\":254,\"hue\":{:?}}}",
            hue
        )))
        .unwrap();

    let resp = client.request(req).await.unwrap();
    if resp.status() != StatusCode::OK {
        println!("{:?}: {:?}", resp.status(), resp.body());
    }
}
