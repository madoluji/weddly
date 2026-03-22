import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import bcrypt from "bcryptjs";
import User from "../../../models/user";
import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { createVerificationToken } from "@/app/lib/tokenGenerator";

interface UserRequestBody {
  email: string;
  name: string;
  lastName: string;
  password: string;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function sendEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Hey Job!",
    html: `<p>Click the link below to verify your email:</p>
           <div style="display: flex; justify-content: center; background-color: #f0f0f0; padding: 20px;">
             <a href="${process.env.NEXTAUTH_URL}/verify?token=${token}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
           </div>`,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, lastName, password }: UserRequestBody = await req.json();

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
    }

    await connectMongoDB();

    const existingUser = await User.findOne({ email }).select("_id");
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user and retrieve `_id`
    const newUser = await User.create({ email, name, lastName, password: hashedPassword, isFirstLogin: true });


    // Generate email verification token
    const token = await createVerificationToken(email) as string;

    // Send email verification
    await sendEmail(email, token);

    // Return user _id along with success message
    return NextResponse.json({
      message: "Success",
      userId: newUser._id.toString() // Send _id as string
    }, { status: 200 });

  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
