import { connectMongoDB } from "@/app/lib/mongodb";
import { authorizeAdminRequest } from "@/app/lib/adminRouteAuth";
import {
    getAuditActorFromUser,
    getClientIpAddress,
    writeAdminAuditLog,
} from "@/app/lib/adminAudit";
import { adminError, adminSuccess } from "@/app/lib/adminApiResponse";
import Admin from "@/models/admin";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { NextRequest } from "next/server";



export async function POST(req: NextRequest) {
    const { user, response } = authorizeAdminRequest(req, ["superadmin"]);
    if (response) {
        return response;
    }

    const actor = getAuditActorFromUser(user);
    const ipAddress = getClientIpAddress(req);

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
            subject: "Welcome to Weddly - Your Administrator Account",
            html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="background-color: #2f5f4a; padding: 25px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600;">Welcome to Weddly</h1>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 35px 40px; background-color: #ffffff;">
                <p style="color: #333333; font-size: 16px; margin: 0 0 20px;">Dear ${name},</p>
                
                <p style="color: #555555; font-size: 15px; margin: 0 0 25px; line-height: 1.7;">
                    We're delighted to welcome you to Weddly. Your administrator account has been successfully created and is ready to use.
                </p>
                
                <!-- Credentials Box -->
                <div style="background-color: #f0f5f2; padding: 20px 25px; border-radius: 6px; margin-bottom: 25px; border-left: 4px solid #2f5f4a;">
                    <h3 style="color: #2f5f4a; margin: 0 0 15px; font-size: 18px; font-weight: 600;">Your Login Credentials</h3>
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
                    <a href="${process.env.NEXTAUTH_URL}/admin/login" style="background-color: #2f5f4a; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                        Access Your Account
                    </a>
                </div>
                
                <p style="color: #555555; font-size: 15px; margin: 30px 0 15px; line-height: 1.7;">
                    If you have any questions or need assistance, our support team is always ready to help.
                </p>
                
                <p style="color: #555555; font-size: 15px; margin: 0;">Best regards,</p>
                <p style="color: #2f5f4a; font-size: 16px; font-weight: 600; margin: 5px 0 0;">The Weddly Team</p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                <p style="color: #777777; font-size: 13px; margin: 0;">
                    © ${new Date().getFullYear()} Weddly. All rights reserved.
                </p>
                <p style="color: #999999; font-size: 12px; margin: 10px 0 0;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </div>
    `,
        };

        await transporter.sendMail(mailOptions);

        await writeAdminAuditLog({
            ...actor,
            action: "admin.create",
            resourceType: "admin",
            resourceId: newAdmin._id.toString(),
            status: "success",
            ipAddress,
            metadata: {
                userName,
                role,
                email,
            },
        });

        return adminSuccess(
            { id: newAdmin._id.toString(), role: newAdmin.role, userName: newAdmin.userName },
            "Admin added successfully",
            201
        );
    } catch (error) {
        console.error("Error adding admin:", error);
        await writeAdminAuditLog({
            ...actor,
            action: "admin.create",
            resourceType: "admin",
            status: "failed",
            errorMessage: "Error adding admin",
            ipAddress,
            metadata: {
                userName,
                role,
                email,
            },
        });
        return adminError("Error adding admin", 500);
    }
}