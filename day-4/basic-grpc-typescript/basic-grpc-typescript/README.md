# Basic gRPC + Protocol Buffers (TypeScript)

## Problem Statement
Traditional applications often expose simple functionality using custom TCP sockets or manually designed REST endpoints. This can lead to inconsistent request/response formats and duplicated serialization logic.

## Solution
This project demonstrates a very small gRPC service using Protocol Buffers and TypeScript.
It is intentionally simple and **does not focus on high performance or ultra-fast communication**.

## Features
- Unary RPC
- Simple Greeting service
- Protocol Buffers
- TypeScript

## Setup
1. npm install
2. npm run proto
3. npm run build
4. npm run server
5. In another terminal: npm run client
