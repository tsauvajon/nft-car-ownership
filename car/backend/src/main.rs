use actix_web::{web, App, HttpServer, Responder};

async fn open() -> impl Responder {
    "Opening the car!"
}

async fn close() -> impl Responder {
    "Closing the car!"
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().service(
            web::scope("/api")
                .route("/open", web::post().to(open))
                .route("/close", web::post().to(close)),
        )
    })
    .bind("127.0.0.1:8081")?
    .run()
    .await
}
