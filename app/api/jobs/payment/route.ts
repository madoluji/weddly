import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "next-auth/react";
import Contract from "@/models/contract";
import Payment from "@/models/payment";// Assuming this is defined elsewhere
import { generateEsewaSignature } from "@/app/lib/generateEsewaSignature";
import { PaymentRequestData } from "@/types/PaymentRequestData";

function validateEnvironmentVariables() {
    const requiredEnvVars = [
        "NEXT_PUBLIC_BASE_URL",
        "NEXT_PUBLIC_ESEWA_MERCHANT_CODE",
        "NEXT_PUBLIC_ESEWA_SECRET_KEY",
        "NEXT_PUBLIC_SUCCESS_URL",
        "NEXT_PUBLIC_FAILURE_URL",
    ];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing environment variable: ${envVar}`);
        }
    }
}

export async function POST(req: Request) {
    try {
        validateEnvironmentVariables();

        // Get session to identify client
        const userData = req.headers.get("user");
        const user = userData ? JSON.parse(userData) : null;


        if (!user || !user.id) {
            return NextResponse.json({ message: "Unauthorized: No user data" }, { status: 401 });
        }
        const clientId = user.id;

        // Get contractId 
        const paymentData: PaymentRequestData = await req.json();
        const { contractId, method } = paymentData;

        if (!contractId) {
            console.error("Missing required fields or invalid method:", paymentData);
            return NextResponse.json(
                { error: "Missing required fields or invalid method" },
                { status: 400 }
            );
        }

        console.log("Initiating eSewa payment");
        // Fetch contract details
        const contract = await Contract.findById(contractId).select("jobId freelancerId price status");
        if (!contract) {
            return NextResponse.json({ error: "Contract not found" }, { status: 404 });
        }
        if (contract.status === "completed") {
            return NextResponse.json({ error: "Contract already paid" }, { status: 400 });
        }

        const jobId = contract.jobId;
        const freelancerId = contract.freelancerId;
        const amount = contract.price;

        const taxAmount = amount * 0.13; // 13% tax 
        const platformFee = amount * 0.03; // 3% fee
        const clientAmount = amount + platformFee + taxAmount; // Amount paid by client
        const freelancerCut = amount * 0.10; // 10% cut from freelancer
        const freelancerAmount = amount - freelancerCut; // Amount to freelancer

        const totalAmount = amount + taxAmount + platformFee;

        console.log("Initiating eSewa payment for contract:", contractId);
        const transactionUuid = `${Date.now()}-${uuidv4()}`;
        const transactionCode = `TXN-${Date.now()}`; // Placeholder; adjust if eSewa provides this

        const esewaConfig = {
            amount: amount.toString(),
            tax_amount: taxAmount.toString(),
            total_amount: clientAmount.toString(),
            transaction_uuid: transactionUuid,
            product_code: process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE!,
            product_service_charge: platformFee.toString(),
            product_delivery_charge: "0",
            success_url: process.env.NEXT_PUBLIC_SUCCESS_URL!,
            failure_url: process.env.NEXT_PUBLIC_FAILURE_URL!,
            contractId: contractId.toString(),
            signed_field_names: "amount,tax_amount,total_amount,transaction_uuid,product_code,product_service_charge,success_url,failure_url,contractId",
        };

        const signatureString = `total_amount=${esewaConfig.total_amount},transaction_uuid=${esewaConfig.transaction_uuid},product_code=${esewaConfig.product_code},product_service_charge=${esewaConfig.product_service_charge},success_url=${esewaConfig.success_url},failure_url=${esewaConfig.failure_url},contractId=${esewaConfig.contractId},amount=${esewaConfig.amount},tax_amount=${esewaConfig.tax_amount},`;
        const signature = generateEsewaSignature(process.env.NEXT_PUBLIC_ESEWA_SECRET_KEY!, signatureString);

        // Create Payment record (initially assume failure until eSewa confirms)
        const payment = await Payment.create({
            jobId,
            contractId,
            clientId,
            freelancerId,
            totalAmount: clientAmount,
            freelancerAmount: freelancerAmount,
            platformFee: platformFee + freelancerCut,
            transactionId: transactionUuid,
            transactionCode: transactionCode,
            status: "failed", // Default; updated on callback
        });

        console.log("Payment record created:", payment._id);

        return NextResponse.json({
            amount,
            esewaConfig: {
                ...esewaConfig,
                signature,
                product_service_charge: Number(esewaConfig.product_service_charge),
                product_delivery_charge: Number(esewaConfig.product_delivery_charge),
                tax_amount: Number(esewaConfig.tax_amount),
                total_amount: Number(esewaConfig.total_amount),
            },
        });
    } catch (err) {
        console.error("Payment API Error:", err);
        return NextResponse.json(
            {
                error: "Error creating payment session",
                details: err instanceof Error ? err.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}