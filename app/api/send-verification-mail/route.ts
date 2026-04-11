import nodemailer from "nodemailer";
import { createVerificationToken } from "@/app/lib/tokenGenerator";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user";
import VerificationToken from "@/models/token";


async function sendEmail(email: string, token: string, redirectUrl?: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Build the verification link with redirect if provided
    let verificationLink = `${process.env.NEXTAUTH_URL}/verify?token=${token}&email=${encodeURIComponent(email)}`;
    if (redirectUrl) {
        verificationLink += `&redirect=${encodeURIComponent(redirectUrl)}`;
    }

    // For HTML email, escape & as &amp;
    const htmlVerificationLink = verificationLink.replace(/&/g, "&amp;");

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
                <a href="${htmlVerificationLink}" style="background-color: #2f5f4a; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Verify Email</a>
              </div>
              <p style="color: #777; font-size: 13px;">If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #777; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} Weddly. All rights reserved.</p>
            </div>
          </div>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${email} (redirect: ${redirectUrl || 'none'})`);
        console.log(`   Link: ${verificationLink}`);
    } catch (error: any) {
        console.error(`❌ Failed to send email to ${email}:`, error.message);
        throw error;
    }
}


export async function POST(req: NextRequest) {
    try {
        // Get the current session
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse request body to get optional redirectUrl
        const body = await req.json().catch(() => ({}));
        const redirectUrl = body.redirectUrl;

        // Connect to database and get fresh user email from DB
        await connectMongoDB();
        const user = await User.findById(session.user.id).select("email").lean();

        if (!user || !user.email) {
            return NextResponse.json(
                { message: "User email not found" },
                { status: 400 }
            );
        }

        // Check if EMAIL_USER and EMAIL_PASS are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("Email configuration missing: EMAIL_USER or EMAIL_PASS not set");
            return NextResponse.json(
                { message: "Email service is not configured. Please contact support." },
                { status: 500 }
            );
        }

        if (!process.env.NEXTAUTH_URL) {
            console.error("NEXTAUTH_URL not configured");
            return NextResponse.json(
                { message: "Application URL not configured. Please contact support." },
                { status: 500 }
            );
        }

        // Generate email verification token
        const token = await createVerificationToken(user.email);
        
        if (!token) {
            console.error("❌ Failed to create verification token");
            return NextResponse.json(
                { message: "Failed to generate verification token. Please try again." },
                { status: 500 }
            );
        }
        
        // Verify the token was actually saved to the database
        const savedToken = await VerificationToken.findOne({ token });
        if (!savedToken) {
            console.error("❌ CRITICAL: Token created but not found in database!");
            console.error("   Token:", token.substring(0, 20) + "...");
            console.error("   Email:", user.email);
            return NextResponse.json(
                { message: "Failed to save verification token. Please try again." },
                { status: 500 }
            );
        }
        console.log("✅ Token verified in database");
        
        console.log(`✅ Sending verification email to: ${user.email}`);

        // Send email verification with optional redirect URL
        try {
            await sendEmail(user.email, token, redirectUrl);
        } catch (emailError: any) {
            console.error("Email sending failed:", emailError.message);
            return NextResponse.json(
                { message: "Failed to send verification email. Please try again later." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Verification link sent successfully",
        }, { status: 200 });

    } catch (error) {
        console.error("Error in send-verification-mail:", error);
        return NextResponse.json(
            { message: "An error occurred. Please try again." },
            { status: 500 }
        );
    }
}
