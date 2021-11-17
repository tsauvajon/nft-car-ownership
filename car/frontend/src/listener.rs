use crate::event_bus::{EventBus, Request};
use futures::StreamExt;
use reqwasm::websocket::{Message, WebSocket};
use wasm_bindgen_futures::spawn_local;
use yew::agent::Dispatched;
use yew::prelude::*;
use yew::services::ConsoleService;

pub struct WebSockerListener;

impl Component for WebSockerListener {
    type Message = ();
    type Properties = ();

    fn create(_props: Self::Properties, _link: ComponentLink<Self>) -> Self {
        let ws = WebSocket::open("ws://127.0.0.1:8081/api/ws").unwrap();
        let mut receiver = ws.receiver;

        spawn_local(async move {
            while let Some(m) = receiver.next().await {
                match m {
                    Ok(Message::Text(m)) => EventBus::dispatcher().send(Request::EventBusMsg(m)),
                    Ok(Message::Bytes(m)) => ConsoleService::error(
                        format!("unexpected binary message: {:?}", m).as_ref(),
                    ),
                    Err(e) => ConsoleService::error(format!("ws: {:?}", e).as_ref()),
                }
            }
        });

        Self {}
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        false
    }
    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        false
    }
    fn view(&self) -> Html {
        html! { <> </> }
    }
}
