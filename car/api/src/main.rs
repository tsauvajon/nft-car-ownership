mod car_commands;
mod nft;
mod pool;
mod websocket;

use actix::prelude::*;
use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
use pool::Pool;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    nft::accounts().await.unwrap();

    let pool = Pool::default().start();

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_header()
            .allow_any_method()
            .allow_any_origin();

        App::new()
            .app_data(web::Data::new(pool.clone()))
            .wrap(cors)
            .service(
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
