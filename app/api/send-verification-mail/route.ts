import nodemailer from "nodemailer";
import { createVerificationToken } from "@/app/lib/tokenGenerator";
import { NextRequest, NextResponse } from "next/server";



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


        const userData = req.headers.get("user");
        const user = userData ? JSON.parse(userData) : null;



        // Generate email verification token
        const token = await createVerificationToken(user.email) as string;

        // Send email verification
        await sendEmail(user.email, token);

        // Return user _id along with success message
        return NextResponse.json({
            message: "verification link send Success",

        }, { status: 200 });

    } catch (error) {
        console.error("Error sending mail:", error);
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}
