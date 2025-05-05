require('dotenv').config();
const WebSocket = require('ws');
const { BedrockRuntimeClient, InvokeModelWithBidirectionalStreamCommand } = require('@aws-sdk/client-bedrock-runtime');
const fetch = require('node-fetch');

// Bedrock client
const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

const wss = new WebSocket.Server({ port: process.env.PORT || 3000, path: '/stream' });

wss.on('connection', (twilioSocket) => {
  let sonicSocket;

  twilioSocket.on('message', async (msg) => {
    // Handle the Twilio start event
    if (typeof msg === 'string') {
      const event = JSON.parse(msg);
      if (event.event === 'start') {
        // Initialize Nova Sonic STS stream
        sonicSocket = new WebSocket(process.env.SONIC_WS_URL, {
          headers: { Authorization: process.env.SONIC_AUTH_HEADER }
        });

        sonicSocket.on('open', () => {
          // Send initial payload to configure the STS stream
          sonicSocket.send(JSON.stringify({
            model: process.env.SONIC_MODEL,
            sample_rate: 8000,
            format: 'opus',
            functions: [require('./openai/toolSchema.json')],
            function_call: 'auto'
          }));
        });

        // Handle messages from Sonic (JSON and audio)
        sonicSocket.on('message', async (data) => {
          try {
            const payload = JSON.parse(data.toString());
            const fc = payload.choices?.[0]?.function_call;
            if (fc) {
              const args = JSON.parse(fc.arguments);
              // Invoke the Lambda-backed API
              const apiRes = await fetch(process.env.ORDER_API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(args)
              });
              const result = await apiRes.json();
              // Send function response back to Sonic
              sonicSocket.send(JSON.stringify({
                function_response: {
                  name: fc.name,
                  arguments: fc.arguments,
                  response: JSON.stringify(result)
                }
              }));
            }
          } catch (err) {
            // Binary audio frames or other non-JSON, skip
          }
        });
      }
    } else {
      // Forward binary Opus frames from Twilio to Sonic
      if (sonicSocket && sonicSocket.readyState === WebSocket.OPEN) {
        sonicSocket.send(msg);
      }
    }
  });

  twilioSocket.on('close', () => {
    if (sonicSocket) sonicSocket.close();
  });
});

console.log(`WebSocket bridge running on ws://0.0.0.0:${process.env.PORT || 3000}/stream`);
