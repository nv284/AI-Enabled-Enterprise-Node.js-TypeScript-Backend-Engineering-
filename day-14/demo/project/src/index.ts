/**
 * Application entry point: build the app and start listening.
 */
import { config } from "./config.js";
import { createApp } from "./server.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`🚀 Server running at http://localhost:${config.port}`);
  console.log(`   LLM provider: ${config.llmProvider}`);
  console.log(`   Try: curl http://localhost:${config.port}/health`);
});
