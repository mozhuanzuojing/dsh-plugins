window.__ModuleLoader__.load({
  id: 'good-plugin',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'good-plugin';
    const CSS = [
      '.wl-panel{display:flex;flex-direction:column;gap:12px;padding:16px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);}',
      '.wl-card{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:12px;}',
      '.wl-btn{min-width:28px;min-height:28px;padding:4px 10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);}',
      '.wl-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;}',
      '.wl-fade{transition:opacity 120ms ease;}',
      '@media (prefers-reduced-motion: reduce){.wl-fade{transition:none;}}',
      '.wl-empty{font-size:14px;line-height:1.45;}',
    ].join('\n');

    const DICTIONARY = {
      zh: {
        title: '好样板',
        run: '审查',
        loading: '正在读取…',
        empty: '还没有记录',
        error: '读取失败',
        retry: '重试',
        copy: '复制',
        copied: '已复制',
        dirty: '有未保存改动',
        undo: '撤销',
        status: '状态',
        running: '运行中',
      },
      en: {
        title: 'Good fixture',
        run: 'Review',
        loading: 'Loading…',
        empty: 'No records yet',
        error: 'Could not load',
        retry: 'Retry',
        copy: 'Copy',
        copied: 'Copied',
        dirty: 'Unsaved changes',
        undo: 'Undo',
        status: 'Status',
        running: 'Running',
      },
    };

    function StatusDot() {
      return h('span', {
        role: 'img',
        'aria-label': DICTIONARY.en.status,
        style: { display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: 'var(--dsw-alias-state-success-primary)' },
      });
    }

    function Panel() {
      const [items, setItems] = React.useState([]);
      const [loading, setLoading] = React.useState(true);
      const [err, setErr] = React.useState(null);
      React.useEffect(() => {
        const controller = new AbortController();
        fetch('/api/good-fixture/items', { signal: controller.signal })
          .then((response) => response.json())
          .then((data) => setItems(Array.isArray(data.items) ? data.items : []))
          .catch((error) => { if (error.name !== 'AbortError') setErr(error); })
          .finally(() => setLoading(false));
        return () => controller.abort();
      }, []);
      return h('div', { className: 'wl-panel', 'data-plugin': NS },
        h('style', null, CSS),
        h('h2', { className: 'wl-card' }, DICTIONARY.en.title),
        h(StatusDot),
        loading ? h('p', { className: 'wl-empty' }, DICTIONARY.en.loading) : null,
        err ? h('div', { className: 'wl-empty' }, DICTIONARY.en.error, ' ', h('button', { className: 'wl-btn', onClick: () => setErr(null) }, DICTIONARY.en.retry)) : null,
        !loading && !err && items.length === 0 ? h('p', { className: 'wl-empty' }, DICTIONARY.en.empty) : null,
        h('ul', null, items.slice(0, 20).map((item) => h('li', { key: String(item.id) }, String(item.label)))),
      );
    }

    return {
      name: NS,
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', DICTIONARY.en), 'good-plugin: en');
        ctx.effect(() => ctx.locale.register(NS, 'zh', DICTIONARY.zh), 'good-plugin: zh');
        ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'good-plugin', locale: NS }, Panel)), 'good-plugin: main');
      },
    };
  },
});
