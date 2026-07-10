import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { createContext, AppContext } from "./context";

async function main() {
  const server = new ApolloServer<AppContext>({
    typeDefs,
    resolvers,
    introspection: true,
    includeStacktraceInErrorResponses: process.env.NODE_ENV !== "production"
  });

  const port = Number(process.env.PORT ?? 4000);

  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async () => createContext()
  });

  console.log(`GraphQL Book API ready at ${url}`);
  console.log(`Open the Apollo Sandbox in your browser to explore the schema.`);
}

main().catch((err) => {
  console.error("Fatal server error:", err);
  process.exit(1);
});