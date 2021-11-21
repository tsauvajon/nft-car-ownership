mod car_commands;
mod pool;
mod websocket;

use actix::prelude::*;
use actix_web::{web, App, HttpServer};
use pool::Pool;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let pool = Pool::default().start();

    HttpServer::new(move || {
        App::new().app_data(web::Data::new(pool.clone())).service(
            web::scope("/api")
                .route("/open", web::post().to(car_commands::open))
                .route("/close", web::post().to(car_commands::close))
                .route("/ws", web::get().to(websocket::register)),
        )
    })
    .bind("127.0.0.1:8081")?
    .run()
    .await
}
