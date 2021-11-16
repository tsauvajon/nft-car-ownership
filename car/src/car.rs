use yew::prelude::*;

pub struct Car {
    props: Props,
}

#[derive(Properties, Clone)]
pub struct Props {
    pub open: bool,
}

impl Component for Car {
    type Message = ();
    type Properties = Props;

    fn create(props: Self::Properties, _link: ComponentLink<Self>) -> Self {
        Self { props }
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        true
    }

    fn change(&mut self, props: Self::Properties) -> ShouldRender {
        self.props = props;
        true
    }

    fn view(&self) -> Html {
        html! {
            <>
                {
                    if self.props.open {
                        html! { <img src="open.jpg" /> }
                    } else {
                        html! { <img src="closed.jpg" /> }
                    }
                }
            </>
        }
    }
}
