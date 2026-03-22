"use server";

import { headers } from "next/headers";
import { connectMongoDB } from "../lib/mongodb";
import Contract from "@/models/contract";
import Payment from "@/models/payment"; // Import the Payment model

const PAYPAL_API_URL =
    process.env.NODE_ENV === "production" ? "https://api-m.sandbox.paypal.com" : "https://api-m.sandbox.paypal.com";

// Get access token from PayPal
async function getPayPalAccessToken() {
    try {
        const auth = Buffer.from(
            `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
        ).toString("base64");

        const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${auth}`,
            },
            body: "grant_type=client_credentials",
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Failed to get PayPal access token: ${data.error_description}`);
        }

        return data.access_token;
    } catch (error) {
        console.error("Error getting PayPal access token:", error);
        throw error;
    }
}

// Create a PayPal order
export async function createOrder(contractId?: string) {
    let amount = "1.00";
    try {
        // If contractId is provided, fetch the contract amount from MongoDB
        await connectMongoDB();
        const contract = await Contract.findById(contractId);
        if (!contract) {
            throw new Error("Contract not found");
        }

        const jobId = contract.jobId;
        const freelancerId = contract.freelancerId;
        const taxAmount = contract.price * 0.13; // 13% tax 
        const platformFee = contract.price * 0.03; // 3% fee
        const clientAmount = parseFloat((contract.price + platformFee).toFixed(2)); // Amount paid by client
        const freelancerCut = contract.price * 0.10; // 10% cut from freelancer
        const freelancerAmount = contract.price - freelancerCut - taxAmount; // Amount to freelancer
        amount = contract.price + platformFee;

        const accessToken = await getPayPalAccessToken();
        const headersList = headers();
        const host = headersList.get("host") || "localhost:3000";
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: amount,
                        },
                    },
                ],
                application_context: {
                    return_url: `${protocol}://${host}/success/${contractId || "undefined"}/${contract.freelancerId}?method=paypal`,
                    cancel_url: `${protocol}://${host}/cancel`,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Failed to create PayPal order: ${data.message}`);
        }


        // Create a payment document after successful payment initiation
        const payment = await Payment.create({
            jobId: contract.jobId,
            contractId: contract._id,
            clientId: contract.clientId,
            freelancerId: contract.freelancerId,
            totalAmount: amount,
            freelancerAmount: freelancerAmount,
            platformFee: platformFee,
            transactionId: data.id,
            method: "paypal",
            status: "failed", // Default; updated on callback
        });

        return data.id;
    } catch (error) {
        console.error("Error creating PayPal order:", error);
        throw error;
    }
}

// Capture a PayPal order
export async function captureOrder(orderId: string) {
    try {
        const accessToken = await getPayPalAccessToken();

        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Failed to capture PayPal order: ${data.message}`);
        }
        await connectMongoDB();

        await Payment.updateOne(
            { transactionId: orderId },
            {
                status: "completed",
                transactionCode: orderId,
            }
        );

        const updatedPayment = await Payment.findOne({ transactionId: orderId });
        await Contract.updateOne(
            { _id: updatedPayment?.contractId },
            {
                status: "completed",
                updatedAt: new Date(),
                $push: {
                    statusHistory: {
                        status: "completed", updatedAt: new Date(),
                    },
                },
            }
        );
        const freelancerId = updatedPayment?.freelancerId.toString();

        return { data, freelancerId, transcation_uuid: updatedPayment?.transactionId, transaction_code: updatedPayment?.transactionCode };
    } catch (error) {
        console.error("Error capturing PayPal order:", error);
        throw error;
    }
}

