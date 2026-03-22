"use server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectMongoDB } from "@/app/lib/mongodb";
import Payment from "@/models/payment";
import Contract from "@/models/contract";


function validateEnvironmentVariables() {
  const requiredEnvVars = ["NEXT_PUBLIC_KHALTI_SECRET_KEY"];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable: ${envVar}`);
    }
  }
}

export async function POST(req: NextRequest) {
  console.log("Received POST request to /api/checkout-session");
  try {
    validateEnvironmentVariables();
    // Get session to identify client
    const userData = req.headers.get("user");
    const user = userData ? JSON.parse(userData) : null;
    const clientId = user?.id;
    const paymentData = await req.json();
    const { contractId, method } = paymentData;

    if (!contractId || method !== "khalti") {
      console.error("Missing required fields or invalid method:", paymentData);
      return NextResponse.json(
        { error: "Missing required fields or invalid method" },
        { status: 400 }
      );
    }
    await connectMongoDB();

    console.log("Initiating Khalti payment");

    const contract = await Contract.findById(contractId)
      .select("jobId freelancerId price status")
      .populate("jobId", "title");
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }
    if (contract.status === "completed") {
      return NextResponse.json(
        { error: "Contract already paid" },
        { status: 400 }
      );
    }

    const jobId = contract.jobId._id;
    const freelancerId = contract.freelancerId;
    const amount = contract.price;

    const taxAmount = amount * 0.13; // 13% tax
    const platformFee = amount * 0.03; // 3% fee
    const clientAmount = parseFloat((amount + platformFee).toFixed(2)); // Amount paid by client
    const freelancerCut = amount * 0.1; // 10% cut from freelancer
    const freelancerAmount = amount - freelancerCut - taxAmount; //
    console.log("Initiating khalti payment for contract:", contractId);
    const transactionId = `${Date.now()}-${uuidv4()}`;

    const khaltiConfig = {
      return_url: `http://localhost:3000/paymentBilling/confirm/khalti`,
      website_url: "http://localhost:3000",
      amount: Math.round(parseFloat(clientAmount.toString()) * 100),
      purchase_order_id: transactionId,
      purchase_order_name: contract.jobId.title,
    };

    const response = await fetch(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.NEXT_PUBLIC_KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(khaltiConfig),
      }
    );

    const payment = await Payment.create({
      jobId,
      contractId,
      clientId,
      freelancerId,
      totalAmount: clientAmount,
      freelancerAmount: freelancerAmount,
      platformFee: platformFee + freelancerCut + taxAmount,
      transactionId: transactionId,
      method: "khalti",
      status: "failed", // Default; updated on callback
    });

    console.log("Payment record created:", payment._id);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Khalti API Error:", errorData);
      throw new Error(
        `Khalti payment initiation failed: ${JSON.stringify(errorData)}`
      );
    }

    const khaltiResponse = await response.json();
    console.log("Khalti payment initiated:", khaltiResponse);

    return NextResponse.json({
      khaltiPaymentUrl: khaltiResponse.payment_url,
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

