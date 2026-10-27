import { afterAll, describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));

function fakeReact() {
  return {
    createElement: (type: any, props: any, ...children: any[]) => ({ type, props, children }),
    Fragment: 'fragment',
  };
}

describe('client registration', () => {
  afterAll(() => {
    delete (globalThis as any).window;
  });

  it('registers one sidebar entry and one main panel through the module loader', async () => {
    const loads: any[] = [];
    (globalThis as any).window = {
      __ModuleLoader__: {
        load(definition: any) { loads.push(definition); },
      },
    };
    await import('../src/client/index.tsx');
    expect(loads).toHaveLength(1);
    expect(loads[0].id).toBe('dsh-plugin-love');

    const plugin = loads[0].factory((id: string) => {
      if (id !== 'react') throw new Error(`unexpected module ${id}`);
      return fakeReact();
    });
    const registrations: any[] = [];
    const ctx = {
      effect<T>(fn: () => T): T { return fn(); },
      locale: {
        bind: () => (key: string) => key,
        register: () => () => {},
      },
      slots: {
        inject: (_name: string, callback: () => any) => callback(),
        register: (options: any) => { registrations.push(options); return () => {}; },
      },
    };
    plugin.apply(ctx);
    expect(registrations.map((item) => item.name)).toEqual(['sidebar.panellist', 'main']);
    expect(registrations[0].id).toBe('love');
    expect(registrations[1].key).toBe('love');
  });

  it('the built client bundle loads and registers the same slots', async () => {
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
    expect(loads).toHaveLength(1);
    const plugin = loads[0].factory((id: string) => {
      if (id !== 'react') throw new Error(`unexpected module ${id}`);
      return fakeReact();
    });
    const registrations: any[] = [];
    plugin.apply({
      effect<T>(fn: () => T): T { return fn(); },
      locale: { bind: () => (key: string) => key, register: () => () => {} },
      slots: {
        inject: (_name: string, callback: () => any) => callback(),
        register: (options: any) => { registrations.push(options); return () => {}; },
      },
    });
    expect(registrations.map((item) => item.name)).toEqual(['sidebar.panellist', 'main']);
  });
});
