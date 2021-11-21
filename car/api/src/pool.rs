use actix::prelude::{Actor, Context, Message, Recipient};

#[derive(Message)]
#[rtype(result = "()")]
pub struct WsMessage(pub String);

type Socket = Recipient<WsMessage>;

pub struct Pool {
    pub sessions: Vec<Socket>,
}

impl Default for Pool {
    fn default() -> Pool {
        Pool {
            sessions: Vec::new(),
        }
    }
}

impl Pool {
    pub fn send_message(&self, message: &str) {
        self.sessions.iter().for_each(|recipient| {
            recipient
                .do_send(WsMessage(message.to_owned()))
                .expect("sending msg to pool recipient failed");
        });
    }
}

impl Actor for Pool {
    type Context = Context<Self>;
}
