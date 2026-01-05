import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

// Initialize Cognito client
const client = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;

// Sign up a new user
export async function signUp(email: string, password: string) {
  const command = new SignUpCommand({
    ClientId: clientId,
    Username: email,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }],
  });

  try {
    return await client.send(command);
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

// Confirm a user's signup with a code
export async function confirmSignUp(email: string, code: string) {
  const command = new ConfirmSignUpCommand({
    ClientId: clientId,
    Username: email,
    ConfirmationCode: code,
  });

  try {
    return await client.send(command);
  } catch (error) {
    console.error("Error confirming sign up:", error);
    throw error;
  }
}

// Sign in a user
export async function signIn(email: string, password: string) {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: { USERNAME: email, PASSWORD: password },
  });

  try {
    const response = await client.send(command);
    return response.AuthenticationResult;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

// Resend confirmation code
export async function resendConfirmationCode(email: string) {
  const command = new ResendConfirmationCodeCommand({
    ClientId: clientId,
    Username: email,
  });

  try {
    return await client.send(command);
  } catch (error) {
    console.error("Error resending confirmation code:", error);
    throw error;
  }
}

// Forgot password
export async function forgotPassword(email: string) {
  const command = new ForgotPasswordCommand({
    ClientId: clientId,
    Username: email,
  });

  try {
    return await client.send(command);
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
}

// Confirm forgot password
export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  const command = new ConfirmForgotPasswordCommand({
    ClientId: clientId,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
  });

  try {
    return await client.send(command);
  } catch (error) {
    console.error("Error confirming password reset:", error);
    throw error;
  }
}
