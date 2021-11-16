mod car;

use car::Car;
use yew::prelude::*;

enum Msg {
    Open,
    Close,
}

struct Model {
    // `ComponentLink` is like a reference to a component.
    // It can be used to send messages to the component
    link: ComponentLink<Self>,
    open: bool,
}

impl Component for Model {
    type Message = Msg;
    type Properties = ();

    fn create(_props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self { link, open: false }
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
