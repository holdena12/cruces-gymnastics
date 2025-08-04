import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { TableName } from './dynamodb-schema';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Use document client for easier JSON handling
export const docClient = DynamoDBDocumentClient.from(client);

// Basic DynamoDB operations
export const dynamoOperations = {
  // Put item
  put: async (item: any) => {
    const command = new PutCommand({
      TableName,
      Item: item,
    });
    
    try {
      await docClient.send(command);
      return { success: true };
    } catch (error) {
      console.error('DynamoDB put error:', error);
      return { success: false, error };
    }
  },

  // Get item
  get: async (pk: string, sk: string) => {
    const command = new GetCommand({
      TableName,
      Key: { PK: pk, SK: sk },
    });
    
    try {
      const response = await docClient.send(command);
      return { success: true, item: response.Item };
    } catch (error) {
      console.error('DynamoDB get error:', error);
      return { success: false, error };
    }
  },

  // Query items
  query: async (pk: string, skBeginsWith?: string) => {
    const command = new QueryCommand({
      TableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': pk,
      },
      ...(skBeginsWith && {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': pk,
          ':sk': skBeginsWith,
        },
      }),
    });
    
    try {
      const response = await docClient.send(command);
      return { success: true, items: response.Items || [] };
    } catch (error) {
      console.error('DynamoDB query error:', error);
      return { success: false, error };
    }
  },

  // Scan items with filter
  scan: async (filterExpression?: string, expressionValues?: Record<string, any>) => {
    const command = new ScanCommand({
      TableName,
      ...(filterExpression && {
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionValues,
      }),
    });
    
    try {
      const response = await docClient.send(command);
      return { success: true, items: response.Items || [] };
    } catch (error) {
      console.error('DynamoDB scan error:', error);
      return { success: false, error };
    }
  },

  // Update item
  update: async (pk: string, sk: string, updateExpression: string, expressionValues: Record<string, any>) => {
    const command = new UpdateCommand({
      TableName,
      Key: { PK: pk, SK: sk },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionValues,
      ReturnValues: 'ALL_NEW',
    });
    
    try {
      const response = await docClient.send(command);
      return { success: true, item: response.Attributes };
    } catch (error) {
      console.error('DynamoDB update error:', error);
      return { success: false, error };
    }
  },

  // Delete item
  delete: async (pk: string, sk: string) => {
    const command = new DeleteCommand({
      TableName,
      Key: { PK: pk, SK: sk },
    });
    
    try {
      await docClient.send(command);
      return { success: true };
    } catch (error) {
      console.error('DynamoDB delete error:', error);
      return { success: false, error };
    }
  },
};

// Helper function to generate unique IDs
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to format timestamps
export const formatTimestamp = (date: Date = new Date()): string => {
  return date.toISOString();
}; 