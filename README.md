# Twilio + Amazon Nova Sonic STS + AWS Lambda

## Overview
This PoC demonstrates a real-time Speech-to-Speech (STS) integration using Twilio Media Streams, Amazon Nova Sonic (via Amazon Bedrock streaming API), and an AWS Lambda tool for DynamoDB lookups.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in  values.
   - Ensure  Twilio number has **Media Streams** enabled.
   - Verify  AWS credentials have access to Amazon Bedrock and DynamoDB.

3. **Build TypeScript Lambda (optional):**
   ```bash
   npx tsc
   ```

## Run

1. **Start Twilio webhook server:**
   ```bash
   npm run start:server
   ```

2. **Start WebSocket bridge to Nova Sonic:**
   ```bash
   npm run start:bridge
   ```

3. **Configure Twilio Voice webhook** for  number to:
   `https://$HOST:$PORT/voice`

4. **Test with a call**:
   - Call Twilio number and speak: “My order number is 90000
   - Hear back the order status fetched from DynamoDB.

## Project Structure

- `server.js` — Express Twilio webhook returning TwiML `<Connect><Stream>`  
- `sonicBridge.js` — WebSocket bridge between Twilio and Amazon Nova Sonic STS  
- `lambda/getOrderDetails.ts` — AWS Lambda handler for DynamoDB lookup (TypeScript)  
- `openai/toolSchema.json` — Function schema for streaming integration  
- `.env.example` — Environment variable template  
- `tsconfig.json` — Config for compiling TypeScript Lambda  
- `README.md` — This guide  
- `package.json` — Dependencies and scripts
