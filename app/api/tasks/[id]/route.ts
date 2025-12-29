import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

// Helper to safely get task ID
function getTaskId(params: { id: string } | Promise<{ id: string }>): string | Promise<string> {
  if (params instanceof Promise) {
    return params.then(resolvedParams => {
      if (!resolvedParams?.id) {
        console.error('No task ID found in params:', resolvedParams);
        throw new Error('Task ID is required');
      }
      return resolvedParams.id;
    });
  }
  
  if (!params?.id) {
    console.error('No task ID found in params:', params);
    throw new Error('Task ID is required');
  }
  return params.id;
}

// GET /api/tasks/[id] - Get a single task
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = await getTaskId(params);
    console.log('GET /api/tasks/[id] - Task ID:', taskId);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error('GET /api/tasks/[id] - Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const getCommand = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ id: taskId }),
    });

    const { Item } = await client.send(getCommand);
    if (!Item) {
      console.error('GET /api/tasks/[id] - Task not found:', taskId);
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = unmarshall(Item);
    
    // Verify ownership
    if (task.userId !== session.user.email) {
      console.error('GET /api/tasks/[id] - Forbidden: User does not own task');
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(task);
  } catch (error: any) {
    console.error('GET /api/tasks/[id] error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch task',
        code: error.code || 'FETCH_ERROR'
      },
      { status: error.status || 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const taskId = await getTaskId(params);
    console.log('PATCH /api/tasks/[id] - Task ID:', taskId);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error('PATCH /api/tasks/[id] - Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('PATCH /api/tasks/[id] - Invalid JSON body');
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { title, description, completed } = body;

    // Get the existing task first
    const getCommand = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ id: taskId }),
    });

    let existingTask;
    try {
      const { Item } = await client.send(getCommand);
      if (!Item) {
        console.error('PATCH /api/tasks/[id] - Task not found:', taskId);
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      existingTask = unmarshall(Item);
    } catch (dbError: any) {
      console.error('PATCH /api/tasks/[id] - Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch task' },
        { status: 500 }
      );
    }
    
    // Verify ownership
    if (existingTask.userId !== session.user.email) {
      console.error('PATCH /api/tasks/[id] - Forbidden: User does not own task');
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Prepare update expression
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    if (title !== undefined) {
      updateExpressions.push('#title = :title');
      expressionAttributeValues[':title'] = title;
      expressionAttributeNames['#title'] = 'title';
    }

    if (description !== undefined) {
      updateExpressions.push('#description = :description');
      expressionAttributeValues[':description'] = description;
      expressionAttributeNames['#description'] = 'description';
    }

    if (completed !== undefined) {
      updateExpressions.push('#completed = :completed');
      expressionAttributeValues[':completed'] = completed;
      expressionAttributeNames['#completed'] = 'completed';
    }

    // Always update the updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    expressionAttributeNames['#updatedAt'] = 'updatedAt';

    if (updateExpressions.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updateCommand = new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ id: taskId }),
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues, { removeUndefinedValues: true }),
      ReturnValues: 'ALL_NEW',
    });

    try {
      const { Attributes } = await client.send(updateCommand);
      if (!Attributes) {
        throw new Error('No attributes returned from update');
      }
      const updatedTask = unmarshall(Attributes);
      return NextResponse.json(updatedTask);
    } catch (updateError: any) {
      console.error('PATCH /api/tasks/[id] - Update error:', updateError);
      throw new Error(updateError.message || 'Failed to update task');
    }

  } catch (error: any) {
    console.error('PATCH /api/tasks/[id] error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to update task',
        code: error.code || 'UPDATE_ERROR'
      },
      { status: error.status || 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const taskId = await getTaskId(params);
    console.log('DELETE /api/tasks/[id] - Task ID:', taskId);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error('DELETE /api/tasks/[id] - Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the task first to verify ownership
    let task;
    try {
      const getCommand = new GetItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ id: taskId }),
      });

      const { Item } = await client.send(getCommand);
      if (!Item) {
        console.error('DELETE /api/tasks/[id] - Task not found:', taskId);
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      task = unmarshall(Item);
    } catch (dbError: any) {
      console.error('DELETE /api/tasks/[id] - Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch task' },
        { status: 500 }
      );
    }
    
    // Verify ownership
    if (task.userId !== session.user.email) {
      console.error('DELETE /api/tasks/[id] - Forbidden: User does not own task');
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete the task
    try {
      const deleteCommand = new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ id: taskId }),
        ReturnValues: 'ALL_OLD'
      });

      const { Attributes } = await client.send(deleteCommand);
      if (!Attributes) {
        throw new Error('No attributes returned from delete');
      }

      return new Response(null, { status: 204 });
    } catch (deleteError: any) {
      console.error('DELETE /api/tasks/[id] - Delete error:', deleteError);
      throw new Error(deleteError.message || 'Failed to delete task');
    }
  } catch (error: any) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to delete task',
        code: error.code || 'DELETE_ERROR'
      },
      { status: error.status || 500 }
    );
  }
}