import { server } from './server';

const PORT = Number(process.env.PORT) || 3000;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`todo-api listening on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown so Docker/K8s stop signals are honored.
const shutdown = (signal: string) => {
  console.log(`Received ${signal}, shutting down...`);
  server.close(() => process.exit(0));
  // Force exit if not closed in 10s.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
