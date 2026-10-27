import type * as ReactNS from 'react';
import { App, SidebarIcon, setReactRuntime } from './app.tsx';
import { DICTIONARY } from './locale.ts';

declare global {
  interface Window {
    __ModuleLoader__: {
      load(definition: {
        id: string;
        factory(require: (id: string) => any): any;
      }): void;
    };
  }
}

const NS = 'dsh-plugin-love';

window.__ModuleLoader__.load({
  id: NS,
  factory(require) {
    const React = require('react') as typeof ReactNS;
    setReactRuntime(React);
    return {
      name: NS,
      inject: ['slots', 'locale'],
      apply(ctx: any) {
        const t = ctx.locale.bind(NS);
        ctx.effect(() => ctx.locale.register(NS, 'zh', DICTIONARY.zh), 'love: zh dictionary');
        ctx.effect(() => ctx.locale.register(NS, 'en', DICTIONARY.en), 'love: en dictionary');
        ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: 'love',
          order: 60,
          label: () => t('panel.title'),
          locale: NS,
        }, SidebarIcon)), 'love: sidebar entry');
        ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: 'love',
          locale: NS,
        }, () => React.createElement(App, { ctx }))), 'love: main panel');
      },
    };
  },
});
