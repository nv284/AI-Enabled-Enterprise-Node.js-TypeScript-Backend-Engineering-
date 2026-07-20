# AI Code & Documentation Generator API

Reference project for the workshop **AI-Powered Backend Engineering with TypeScript & Node.js**.

An Express + TypeScript API that generates TypeScript code from a spec, and documentation from code — using a **simulated LLM** (no API key, no cost).

## Run it

```bash
npm install
npm run dev      # starts on http://localhost:3000
```

## Endpoints

### `GET /health`
```bash
curl http://localhost:3000/health
```

### `POST /generate/code`
```bash
curl -X POST http://localhost:3000/generate/code \
  -H "Content-Type: application/json" \
  -d '{
    "name": "isValidEmail",
    "parameters": "email: string",
    "returns": "boolean",
    "description": "returns true if the string looks like a valid email"
  }'
```

### `POST /generate/docs`
```bash
curl -X POST http://localhost:3000/generate/docs \
  -H "Content-Type: application/json" \
  -d '{ "code": "export function add(a: number, b: number): number { return a + b; }" }'
```

## Test

```bash
npm test
```

## Project layout

```
src/
├── index.ts                    entry point (start server)
├── server.ts                   build the Express app
├── config.ts                   env-based config
├── llm/
│   ├── types.ts                LlmClient interface + message types
│   ├── SimulatedLlmClient.ts   the free, local model
│   ├── OpenAiClient.ts         real provider (optional)
│   └── index.ts                factory: choose the client
├── prompts/
│   ├── codePrompt.ts           🤖 prompt for code generation
│   └── docsPrompt.ts           🤖 prompt for docs generation
├── services/
│   ├── codeGenerator.ts        orchestration + validation
│   ├── docsGenerator.ts        orchestration + validation
│   └── sanitize.ts             defensive output cleaning
└── routes/
    ├── health.ts
    └── generate.ts
```

## Switching to a real LLM

1. `cp .env.example .env`
2. Set `LLM_PROVIDER=openai` and `OPENAI_API_KEY=...`
3. Restart. Only [src/llm/index.ts](src/llm/index.ts) decides which client is used — nothing else changes.
