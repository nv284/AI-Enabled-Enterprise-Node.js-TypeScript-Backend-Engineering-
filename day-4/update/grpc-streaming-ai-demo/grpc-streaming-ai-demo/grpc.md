
# Improved gRPC Project

## Traditional Problem
Unary RPC sends one request and receives one response. If the client needs updates, it must repeatedly call the server.

## Improved Solution
This project uses **Server Streaming** so one request can receive multiple updates.

## AI-assisted Improvements
- Ask an AI assistant to generate `.proto` contracts from plain English requirements.
- Use AI to scaffold server/client code.
- Ask AI to add validation, comments, logging and documentation.

## Example AI Prompts
1. Generate a Protocol Buffer contract for a notification service using server streaming.
2. Generate TypeScript gRPC server from the protobuf.
3. Generate a TypeScript client that consumes a server stream.
4. Add comments and error handling.
5. Refactor into controller/service architecture.

## Why Better?
- Fewer client requests
- Live notifications
- Cleaner API contract
- Easier scalability
- Better separation of concerns

## Required Libraries
- @grpc/grpc-js
- @grpc/proto-loader
- typescript
- ts-node
- @types/node

## Steps to Run
1. Open the project in VS Code.
2. Run `npm install`
3. Run `npm run build`
4. Terminal 1: `npm run server`
5. Terminal 2: `npm run client`

Expected output:
- Robot Started
- Obstacle Detected
- Mission Completed

## Future Enhancements
- Bidirectional streaming
- Authentication
- AI-generated protobufs
- Logging
- Testing
- Docker
