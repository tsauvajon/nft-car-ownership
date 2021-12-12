mod car;
mod event_bus;
mod listener;

use car::Car;
use event_bus::EventBus;
use yew::agent::Bridged;
use yew::prelude::*;

enum Msg {
    NewCommand(String),
}

struct App {
    _producer: Box<dyn Bridge<EventBus>>,

    unlocked: bool,
    error: Option<String>,
}

impl Component for App {
    type Message = Msg;
    type Properties = ();

    fn create(_props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            _producer: EventBus::bridge((&link).callback(Msg::NewCommand)),
            unlocked: false,
            error: None,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::NewCommand(cmd) => {
                match cmd.as_str() {
                    "unlock the car!!" => self.unlocked = true,
                    "lock the car!!" => self.unlocked = false,
                    _ => self.error = Some(format!("unknown command: {:?}", cmd)),
                };
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
                <Car unlocked=self.unlocked />
                <listener::WebSockerListener />
            </div>
        }
    }
}

fn main() {
    yew::start_app::<App>();
}
