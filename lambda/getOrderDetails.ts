import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

export const handler: APIGatewayProxyHandler = async (event) => {
  const { orderId } = JSON.parse(event.body || '{}');
  if (!orderId) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Missing orderId' }) };
  }
  try {
    const result = await client.send(new GetItemCommand({
      TableName: 'Orders',
      Key: { orderId: { S: orderId } },
    }));
    if (!result.Item) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Order not found' }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        customerName: result.Item.customerName.S,
        status: result.Item.status.S
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal error', error: err }) };
  }
};
