export const name = 'good-plugin';
export const inject = ['tools'];

export function apply(ctx) {
  ctx.effect(() => {
    const timer = setInterval(() => {
      // A deliberately slow poll with an owned cleanup.
      void 0;
    }, 5000);
    return () => clearInterval(timer);
  }, 'good-plugin: poll');

  ctx.tools.register({
    name: 'fixture_inspect',
    description: 'Read a small fixture fact without writing anything. Use it only when the user asks for a read-only fixture check; it never mutates the workspace.',
    parameters: {
      target: {
        type: 'string',
        required: true,
        description: 'Absolute fixture path to inspect.',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ok: { type: 'boolean', required: true },
        },
      },
      render: () => [{ type: 'text', text: 'ok' }],
    },
    timeoutMs: 5000,
    isConcurrencySafe: () => true,
    async execute() {
      return { ok: true };
    },
  });
}
