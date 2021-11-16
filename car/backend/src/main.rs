use actix::prelude::*;
use actix_web::{web, App, Error, HttpRequest, HttpResponse, HttpServer, Responder};
use actix_web_actors::ws;

/// Define HTTP actor
struct CarWs;

impl Actor for CarWs {
    type Context = ws::WebsocketContext<Self>;
}

/// Handler for ws::Message message
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for CarWs {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Pong(_msg)) => (),
            Ok(ws::Message::Text(text)) => ctx.text(text),
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
            Ok(ws::Message::Close(reason)) => {
                format!("stopping because: {:?}", reason);
                ctx.close(reason);
                ctx.stop();
            }
            _ => {
                println!("stopping after receiving 'other' message");
                ctx.stop()
            }
        }
    }
}

async fn index(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let resp = ws::start(CarWs {}, &req, stream);
    println!("{:?}", resp);
    resp
}

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
                .route("/close", web::post().to(close))
                .route("/ws/", web::get().to(index)),
        )
    })
    .bind("127.0.0.1:8081")?
    .run()
    .await
}
