// app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

// ---------------------
// Task type definition
// ---------------------
type Task = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

// ---------------------
// Helper to get task ID
// ---------------------
async function getTaskId(params: { id: string } | Promise<{ id: string }>) {
  const resolved = params instanceof Promise ? await params : params;
  if (!resolved?.id) throw new Error("Task ID is required");
  return resolved.id;
}

// ---------------------
// GET /tasks - get all tasks for user
// ---------------------
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  } catch (err: any) {
    console.error("GET_ALL error:", err);
    return NextResponse.json(
      { error: "Failed to fetch tasks", details: err.message },
      { status: 500 }
    );
  }
}

// ---------------------
// POST /tasks - create a new task
// ---------------------
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    if (!body.title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const newTask: Task = {
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
      Item: marshall(newTask),
    });

    await client.send(command);
    return NextResponse.json(newTask);
  } catch (err: any) {
    console.error("POST error:", err);
    return NextResponse.json(
      { error: "Failed to create task", details: err.message },
      { status: 500 }
    );
  }
}

// ---------------------
// GET /tasks/[id] - get task by ID
// ---------------------
export async function GET_BY_ID(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = await getTaskId(params);
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { Item } = await client.send(
      new GetItemCommand({ TableName: TABLE_NAME, Key: marshall({ id: taskId }) })
    );

    if (!Item) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const task: Task = unmarshall(Item) as Task;
    if (task.userId !== session.user.email)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json(task);
  } catch (err: any) {
    console.error("GET_BY_ID error:", err);
    return NextResponse.json(
      { error: "Failed to fetch task", details: err.message },
      { status: 500 }
    );
  }
}

// ---------------------
// PATCH /tasks/[id] - update task
// ---------------------
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const taskId = await getTaskId(params);
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as Partial<Task> | null;
    if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

    const { Item } = await client.send(
      new GetItemCommand({ TableName: TABLE_NAME, Key: marshall({ id: taskId }) })
    );
    if (!Item) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const existingTask: Task = unmarshall(Item) as Task;
    if (existingTask.userId !== session.user.email)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updates: string[] = [];
    const exprValues: Record<string, any> = {};
    const exprNames: Record<string, string> = {};

    ["title", "description", "completed"].forEach((key) => {
      if (body[key as keyof Task] !== undefined) {
        updates.push(`#${key} = :${key}`);
        exprValues[`:${key}`] = body[key as keyof Task];
        exprNames[`#${key}`] = key;
      }
    });

    // Always update updatedAt
    updates.push("#updatedAt = :updatedAt");
    exprValues[":updatedAt"] = new Date().toISOString();
    exprNames["#updatedAt"] = "updatedAt";

    if (!updates.length)
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

    const { Attributes } = await client.send(
      new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ id: taskId }),
        UpdateExpression: `SET ${updates.join(", ")}`,
        ExpressionAttributeNames: exprNames,
        ExpressionAttributeValues: marshall(exprValues, { removeUndefinedValues: true }),
        ReturnValues: "ALL_NEW",
      })
    );

    const updatedTask: Task = unmarshall(Attributes!) as Task;
    return NextResponse.json(updatedTask);
  } catch (err: any) {
    console.error("PATCH error:", err);
    return NextResponse.json({ error: err.message || "Failed to update task" }, { status: 500 });
  }
}

// ---------------------
// DELETE /tasks/[id] - delete task
// ---------------------
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const taskId = await getTaskId(params);
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { Item } = await client.send(
      new GetItemCommand({ TableName: TABLE_NAME, Key: marshall({ id: taskId }) })
    );
    if (!Item) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const task: Task = unmarshall(Item) as Task;
    if (task.userId !== session.user.email)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await client.send(new DeleteItemCommand({ TableName: TABLE_NAME, Key: marshall({ id: taskId }) }));

    return new Response(null, { status: 204 });
  } catch (err: any) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete task" }, { status: 500 });
  }
}
