import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { App, setReactRuntime } from '../src/client/app.tsx';

const root = fileURLToPath(new URL('../', import.meta.url));

function fakeCtx() {
  return {
    locale: {
      subscribe: () => () => {},
      getSnapshot: () => ({ active: 'zh' }),
      getLocale: () => ({ active: 'zh' }),
      bind: () => (key: string) => key,
      register: () => () => {},
    },
  };
}

describe('client render', () => {
  it('renders the empty state without throwing', () => {
    setReactRuntime(React as any);
    const html = renderToString(React.createElement(App, { ctx: fakeCtx() }));
    expect(html).toContain('爱');
    expect(html).toContain('把插件目录给我');
    expect(html).toContain('以爱为起点');
  });

  it('the built bundle renders the main panel with the real React runtime', async () => {
    const code = await readFile(join(root, 'client.js'), 'utf8');
    const loads: any[] = [];
    const sandbox = {
      window: { __ModuleLoader__: { load(definition: any) { loads.push(definition); } } },
      console,
      setTimeout,
      clearTimeout,
      URL,
      Blob: class {},
      document: { createElement: () => ({ click() {} }) },
      navigator: { clipboard: { writeText: async () => {} } },
      Intl,
    };
    vm.runInNewContext(code, sandbox, { filename: 'client.js' });
    const plugin = loads[0].factory((id: string) => {
      if (id !== 'react') throw new Error(`unexpected module ${id}`);
      return React;
    });
    const registrations: any[] = [];
    plugin.apply({
      effect<T>(fn: () => T): T { return fn(); },
      locale: {
        bind: () => (key: string) => key,
        register: () => () => {},
      },
      slots: {
        inject: (_name: string, callback: () => any) => callback(),
        register: (options: any, component: any) => {
          registrations.push({ options, component });
          return () => {};
        },
      },
    });
    const main = registrations.find((item) => item.options.name === 'main');
    expect(main).toBeTruthy();
    const html = renderToString(main.component());
    expect(html).toContain('爱');
    expect(html).toContain('把插件目录给我');
  });
});
