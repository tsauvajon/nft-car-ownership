use crate::pool::{Pool, WsMessage};
use actix::prelude::*;
use actix::{fut, ActorContext, ActorFuture, ContextFutureSpawner, WrapFuture};
use actix_web::{web, web::Data, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;

#[derive(Message)]
#[rtype(result = "()")]
pub struct Connect {
    pub addr: Recipient<WsMessage>,
}

impl Handler<Connect> for Pool {
    type Result = ();

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        println!("client joined");
        self.sessions.push(msg.addr);
    }
}

pub async fn register(
    pool: Data<Addr<Pool>>,
    req: HttpRequest,
    stream: web::Payload,
) -> Result<HttpResponse, Error> {
    let resp = ws::start(CarWs { pool_addr: pool }, &req, stream);
    resp
}

pub struct CarWs {
    pool_addr: Data<Addr<Pool>>,
}

impl Handler<WsMessage> for CarWs {
    type Result = ();

    fn handle(&mut self, msg: WsMessage, ctx: &mut Self::Context) {
        ctx.text(msg.0)
    }
}

// TODO: heartbeat + disconnection
impl Actor for CarWs {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.pool_addr
            .send(Connect {
                addr: ctx.address().recipient(),
            })
            .into_actor(self)
            .then(|res, _, ctx| {
                if let Err(e) = res {
                    println!("sending Connect failed: {:?}", e);
                    ctx.stop();
                }

                fut::ready(())
            })
            .wait(ctx);
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for CarWs {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        let msg = match msg {
            Err(e) => {
                println!("ws error: {:?}", e);
                return;
            }
            Ok(msg) => msg,
        };

        match msg {
            ws::Message::Ping(msg) => ctx.pong(&msg),
            ws::Message::Pong(_msg) => (),
            ws::Message::Text(text) => ctx.text(text),
            ws::Message::Binary(bin) => ctx.binary(bin),
            ws::Message::Close(_reason) => println!("client dropped"),
            _ => {
                println!("stopping after receiving 'other' message: {:?}", msg);
                ctx.stop()
            }
        }
    }
}
