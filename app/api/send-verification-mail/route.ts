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
        subject: "Welcome to Hey Job!",
        html: `<p>Click the link below to verify your email:</p>
           <div style="display: flex; justify-content: center; background-color: #f0f0f0; padding: 20px;">
             <a href="${process.env.NEXTAUTH_URL}/verify?token=${token}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
           </div>`,
    };

    await transporter.sendMail(mailOptions);
}


export async function POST(req: NextRequest, res: NextResponse) {
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
