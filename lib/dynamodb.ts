import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: "us-east-2" }); // replace with your region
export const ddbDocClient = DynamoDBDocumentClient.from(client);
