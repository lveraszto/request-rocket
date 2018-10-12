import Vue from 'vue';
import Vuex from 'vuex';
import sinon from 'sinon';
import { shallowMount } from '@vue/test-utils';
import RequestEditor from '@/components/request-editor';
import createStore from '@/store';
import Action from '@/store/action-types';
import Mutation from '@/store/mutation-types';
import Getters from '../../../../../src/renderer/store/getters';
import HttpMethod from '../../../../../src/common/method-types';

describe('RequestEditor.vue', () => {
  let store;

  beforeEach(() => {
    store = createStore();
  });

  it('should render correct contents', async () => {
    store.commit(Mutation.UPDATE_URL, 'https://some.url');
    await Vue.nextTick();
    const component = shallowMount(RequestEditor, { store });

    expect(component.find('#request-editor-url-field').element.value).to.equal('https://some.url');
  });

  context('editing the URL content', () => {
    it('should set the URL in the store', () => {
      const component = shallowMount(RequestEditor, { store });

      const input = component.find('#request-editor-url-field');

      input.element.value = 'https://new.url';
      input.trigger('input');

      expect(store.state.request.url).to.equal('https://new.url');
    });
  });

  context('clicking the send button', () => {
    context('when network is online', () => {
      it('should dispatch the request', () => {
        const requestSender = sinon.spy();

        const store = new Vuex.Store({
          state: {
            networkStatus: 'online',
            request: {}
          },
          getters: Getters,
          actions: {
            [Action.sendRequest]: requestSender
          }
        });

        const component = shallowMount(RequestEditor, { store });

        const button = component.find('#request-editor-send-button');

        button.trigger('click');

        expect(requestSender.calledOnce).to.eql(true);
      });
    });

    context('when network is offline', () => {
      it('should not send a request', () => {
        const requestSender = sinon.spy();

        const store = new Vuex.Store({
          state: {
            networkStatus: 'offline',
            request: {}
          },
          getters: Getters,
          actions: { [Action.sendRequest]: requestSender }
        });

        const component = shallowMount(RequestEditor, { store });
        const button = component.find('#request-editor-send-button');

        button.trigger('click');

        expect(requestSender.calledOnce).to.eql(false);
      });
    });
  });

  it('should contain an auth editor', () => {
    const component = shallowMount(RequestEditor, { store });

    expect(component.find({ name: 'AuthEditor' }).exists()).to.eql(true);
  });

  it('should render selector for http method options', () => {
    const component = shallowMount(RequestEditor, { store });
    const selectElement = component.find('select.http-method');

    store.state.request.httpMethodOptions.forEach(option => {
      expect(selectElement.find(`option[value="${option.id}"]`).text()).to.equal(option.label);
    });
  });

  it('should set the selected http method on the store', () => {
    const component = shallowMount(RequestEditor, { store });
    const select = component.find('select.http-method');
    select.element.value = HttpMethod.POST;
    select.trigger('input');

    expect(store.state.request.selectedHttpMethod).to.equal(HttpMethod.POST);
  });
});
