import { shallowMount } from "@vue/test-utils";
import AccountConnector from "@/components/AccountConnector.vue";

describe("AccountConnector.vue", () => {
  it("renders props.msg when passed", () => {
    const msg = "new message";
    const wrapper = shallowMount(AccountConnector, {
      props: { msg },
    });
    expect(wrapper.text()).toMatch(msg);
  });
});
