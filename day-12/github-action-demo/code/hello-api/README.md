# hello-api

Tiny Express + TypeScript API used as the sample project in the [GitHub Actions CI/CD training](../../README.md).

## Quick start

```powershell
npm ci
npm test         # vitest
npm run build    # tsc -> dist/
npm start        # http://localhost:3000
```

## Endpoints

| Method | Path | Example |
|--------|------|---------|
| GET | `/` | `curl http://localhost:3000/` |
| GET | `/add/:a/:b` | `curl http://localhost:3000/add/2/3` |
| GET | `/multiply/:a/:b` | `curl http://localhost:3000/multiply/4/5` |
| GET | `/divide/:a/:b` | `curl http://localhost:3000/divide/10/2` |

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm test` | Run vitest once |
| `npm run test:watch` | Run vitest in watch mode |
| `npm run lint` | Lint `src/` and `tests/` |
| `npm run page:build` | Generate `public/index.html` (the page deployed to GH Pages) |
