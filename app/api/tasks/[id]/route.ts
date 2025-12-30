import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

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

// Helper to safely get task ID
async function getTaskId(params: { id: string } | Promise<{ id: string }>) {
  const resolved = params instanceof Promise ? await params : params;
  if (!resolved?.id) throw new Error("Task ID is required");
  return resolved.id;
}

// GET /api/tasks/[id]
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const taskId = await getTaskId(params);
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { Item } = await client.send(
      new GetItemCommand({ TableName: TABLE_NAME, Key: marshall({ id: taskId }) })
    );
    if (!Item) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const task: Task = unmarshall(Item) as Task;
    if (task.userId !== session.user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json(task);
  } catch (error: any) {
    console.error("GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch task" }, { status: 500 });
  }
}

// PATCH /api/tasks/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const taskId = await getTaskId(params);
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json().catch(() => null)) as Partial<Task> | null;
    if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

    const { Item } = await client.send(new GetItemCommand({ TableName: TABLE_NAME, Key: marshall({ id: taskId }) }));
    if (!Item) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const existingTask: Task = unmarshall(Item) as Task;
    if (existingTask.userId !== session.user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

    if (!updates.length) return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

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
  } catch (error: any) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const taskId = await getTaskId(params);
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { Item } = await client.send(new GetItemCommand({ TableName: TABLE_NAME, Key: marshall({ id: taskId }) }));
    if (!Item) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const task: Task = unmarshall(Item) as Task;
    if (task.userId !== session.user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await client.send(new DeleteItemCommand({ TableName: TABLE_NAME, Key: marshall({ id: taskId }) }));

    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete task" }, { status: 500 });
  }
}
