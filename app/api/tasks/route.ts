import { NextResponse } from "next/server";

let tasks = [
  { id: 1, title: "Learn AWS", completed: false },
  { id: 2, title: "Build Next.js app", completed: false },
];

export async function GET() {
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const body = await request.json();
  const newTask = { id: tasks.length + 1, ...body };
  tasks.push(newTask);
  return NextResponse.json(newTask);
}
