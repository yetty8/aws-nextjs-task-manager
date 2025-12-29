// lib/db.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

export const ddb = DynamoDBDocumentClient.from(client);
export const USERS_TABLE = process.env.USERS_TABLE!;

export async function getUserByEmail(email: string) {
  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: USERS_TABLE,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email.toLowerCase().trim()
        },
        Limit: 1
      })
    );
    return result.Items?.[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function createUser(user: any) {
  try {
    await ddb.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: user,
        ConditionExpression: 'attribute_not_exists(email)'
      })
    );
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}