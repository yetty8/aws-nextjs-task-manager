import { hash } from "bcryptjs";
import { createUser, getUserByEmail } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Input validation
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          error: "Email and password are required",
          details: "Missing required fields",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Check if user already exists
    console.log("Checking if user exists:", email);
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log("User already exists:", email);
      return new Response(
        JSON.stringify({
          error: "Email already in use",
          details: "A user with this email already exists",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Hash password and create user
    console.log("Creating new user:", email);
    const hashedPassword = await hash(password, 10);
    const user = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: (name || email.split("@")[0]).trim(),
      createdAt: new Date().toISOString(),
    };

    // Save user to database
    await createUser(user);
    console.log("User created successfully:", user.id);

    // Return success response
    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create account",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        ...(error.code === "ConditionalCheckFailedException" && {
          details: "A user with this email already exists",
        }),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
