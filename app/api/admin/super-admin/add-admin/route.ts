import { connectMongoDB } from "@/app/lib/mongodb";
import Admin from "@/models/admin";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest, res: NextResponse) {

    await connectMongoDB();

    const { name, lastName, userName, role, email } = await req.json();

    // Generate a random 6-digit password
    const generatePassword = () => {
        return Math.random().toString(36).slice(-6);
    };

    const password = generatePassword();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Save the admin to the database
        const newAdmin = new Admin({
            name,
            lastName,
            userName,
            role,
            email,
            password: hashedPassword,
            isFirstLogin: true,
        });

        await newAdmin.save();

        // Send the password via email
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
            subject: "Welcome to Hey Job - Your Administrator Account",
            html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="background-color: #FFC00E; padding: 25px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600;">Welcome to Hey Job</h1>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 35px 40px; background-color: #ffffff;">
                <p style="color: #333333; font-size: 16px; margin: 0 0 20px;">Dear ${name},</p>
                
                <p style="color: #555555; font-size: 15px; margin: 0 0 25px; line-height: 1.7;">
                    We're delighted to welcome you to Hey Job. Your administrator account has been successfully created and is ready to use.
                </p>
                
                <!-- Credentials Box -->
                <div style="background-color: #fff6de; padding: 20px 25px; border-radius: 6px; margin-bottom: 25px; border-left: 4px solid #FFAC10;">
                    <h3 style="color: #FFC00E; margin: 0 0 15px; font-size: 18px; font-weight: 600;">Your Login Credentials</h3>
                    <p style="margin: 8px 0; color: #333333; font-size: 15px;">
                        <strong>Username:</strong> ${userName}
                    </p>
                    <p style="margin: 8px 0; color: #333333; font-size: 15px;">
                        <strong>Password:</strong> ${password}
                    </p>
                </div>
                
                <p style="color: #555555; font-size: 15px; margin: 0 0 25px; line-height: 1.7;">
                    For security purposes, we recommend changing your password immediately after your first login. Please keep these credentials confidential.
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/admin/login" style="background-color: #ffc82c; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px; transition: all 0.3s ease;">
                        Access Your Account
                    </a>
                </div>
                
                <p style="color: #555555; font-size: 15px; margin: 30px 0 15px; line-height: 1.7;">
                    If you have any questions or need assistance, our support team is always ready to help.
                </p>
                
                <p style="color: #555555; font-size: 15px; margin: 0;">Best regards,</p>
                <p style="color: #FFC00E; font-size: 16px; font-weight: 600; margin: 5px 0 0;">The Hey Job Team</p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                <p style="color: #777777; font-size: 13px; margin: 0;">
                    © ${new Date().getFullYear()} Hey Job. All rights reserved.
                </p>
                <p style="color: #999999; font-size: 12px; margin: 10px 0 0;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </div>
    `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "Admin added successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error adding admin:", error);
        return NextResponse.json({ message: "Error adding admin" }, { status: 500 });
    }
}