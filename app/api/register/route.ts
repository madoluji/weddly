import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import bcrypt from "bcryptjs";
import User from "../../../models/user";
import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { createVerificationToken } from "@/app/lib/tokenGenerator";
import { emitNotificationEventSafe } from "@/app/lib/notification-events";

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
    subject: "Welcome to Weddly — Verify Your Email",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2f5f4a; padding: 25px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Weddly</h1>
        </div>
        <div style="padding: 35px 40px; background-color: #ffffff;">
          <p style="color: #333; font-size: 16px;">Please verify your email address to get started on Weddly.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/verify?token=${token}" style="background-color: #2f5f4a; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Verify Email</a>
          </div>
          <p style="color: #777; font-size: 13px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #777; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} Weddly. All rights reserved.</p>
        </div>
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

    await emitNotificationEventSafe({
      eventType: "USER_REGISTERED",
      userId: newUser._id.toString(),
      metadata: {
        email,
        name,
        lastName,
        href: "/user/profile",
      },
    });

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
