import { jwtVerify } from "jose";

export async function authenticateToken(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "Unauthorized: No token provided", user: null };
    }

    const accessToken = authHeader.split(" ")[1];

    const secretKey = new TextEncoder().encode(
      process.env.ACCCESS_TOKEN_SECRET_KEY
    );
    const { payload: user } = await jwtVerify(accessToken, secretKey);
    return { error: null, user };
  } catch (err) {
    return { error: "Unauthorized: Invalid token", user: null };
  }
}
