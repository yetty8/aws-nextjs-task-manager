// app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const TABLE_NAME = process.env.DYNAMODB_TABLE!;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: session.user.email },
      },
    });

    const data = await client.send(command);
    const tasks = data.Items?.map((item) => unmarshall(item)) || [];
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json(
      { error: "Failed to fetch tasks", details: (err as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const newTask = {
      id: uuidv4(),
      userId: session.user.email,
      title: body.title,
      description: body.description || "",
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id: { S: newTask.id },
        userId: { S: newTask.userId },
        title: { S: newTask.title },
        description: { S: newTask.description },
        completed: { BOOL: newTask.completed },
        createdAt: { S: newTask.createdAt },
        updatedAt: { S: newTask.updatedAt },
      },
    });

    await client.send(command);
    return NextResponse.json(newTask);
  } catch (err: any) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json(
      { error: "Failed to create task", details: err.message },
      { status: 500 },
    );
  }
}
