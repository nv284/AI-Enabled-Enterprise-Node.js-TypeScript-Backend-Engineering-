/** dependency-cruiser config for the Bookstore API — enforces Clean Architecture layering. */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies indicate a design flaw.',
      from: {},
      to: { circular: true }
    },
    {
      name: 'domain-is-pure',
      severity: 'error',
      comment: 'Domain must only depend on itself (and zod).',
      from: { path: '^src/domain' },
      to: {
        path: '^(src/(application|infrastructure|presentation)|node_modules/(?!zod))'
      }
    },
    {
      name: 'application-only-uses-domain',
      severity: 'error',
      comment: 'Application layer must not import infrastructure or presentation.',
      from: { path: '^src/application' },
      to:   { path: '^src/(infrastructure|presentation)' }
    },
    {
      name: 'infrastructure-only-uses-domain',
      severity: 'error',
      comment: 'Infrastructure adapters may only depend on domain.',
      from: { path: '^src/infrastructure' },
      to:   { path: '^src/(application|presentation)' }
    },
    {
      name: 'presentation-uses-application-only',
      severity: 'error',
      comment: 'Controllers depend on application services; the only domain imports allowed are errors and DTOs.',
      from: { path: '^src/presentation' },
      to:   {
        path: '^src/infrastructure'
      }
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Files that no one imports (except main.ts) are probably dead code.',
      from: {
        orphan: true,
        pathNot: [
          '\\.d\\.ts$',
          '(^|/)tsconfig\\.[^/]+$',
          '(^|/)main\\.ts$'
        ]
      },
      to: {}
    }
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    exclude: 'tests'
  }
};
