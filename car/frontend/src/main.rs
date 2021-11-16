mod car;

use car::Car;
use futures::{SinkExt, StreamExt};
use reqwasm::websocket::{Message, WebSocket};
use wasm_bindgen_futures::spawn_local;
use yew::prelude::*;
use yew::services::ConsoleService;

enum Msg {
    Open,
    Close,
}

struct Model {
    // `ComponentLink` is like a reference to a component.
    // It can be used to send messages to the component
    link: ComponentLink<Self>,
    // ws: WebSocket,
    open: bool,
}

impl Component for Model {
    type Message = Msg;
    type Properties = ();

    fn create(_props: Self::Properties, link: ComponentLink<Self>) -> Self {
        let ws = WebSocket::open("ws://127.0.0.1:8081/api/ws").unwrap();
        let (mut sender, mut receiver) = (ws.sender, ws.receiver);

        spawn_local(async move {
            while let Some(m) = receiver.next().await {
                match m {
                    Ok(Message::Text(m)) => {
                        ConsoleService::info(format!("message: {:?}", m).as_ref())
                    }
                    Ok(Message::Bytes(m)) => {
                        ConsoleService::info(format!("message: {:?}", m).as_ref())
                    }
                    Err(e) => ConsoleService::error(format!("ws: {:?}", e).as_ref()),
                }
            }
        });

        spawn_local(async move {
            sender
                .send(Message::Text("test".to_string()))
                .await
                .unwrap();
        });

        Self {
            link,
            // ws: ws,
            open: false,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Open => {
                self.open = true;
                true
            }
            Msg::Close => {
                self.open = false;
                true
            }
        }
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        false
    }

    fn view(&self) -> Html {
        html! {
            <div>
                {
                    if self.open {
                        html! {<button onclick=self.link.callback(|_| Msg::Close)>{ "Close" }</button>}
                    } else {
                        html! {<button onclick=self.link.callback(|_| Msg::Open)>{ "Open" }</button>}
                    }
                }
                <Car open=self.open />
            </div>
        }
    }
}

fn main() {
    yew::start_app::<Model>();
}
