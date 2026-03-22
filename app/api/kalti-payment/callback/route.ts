import { NextRequest, NextResponse } from "next/server";
import Payment from "@/models/payment";
import Contract from "@/models/contract";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const pidx = searchParams.get("pidx");
        const txnId = searchParams.get("txnId");
        const amount = searchParams.get("amount");
        const total_amount = searchParams.get("total_amount");
        const status = searchParams.get("status");
        const mobile = searchParams.get("mobile");
        const tidx = searchParams.get("tidx");
        const purchase_order_id = searchParams.get("purchase_order_id");
        const purchase_order_name = searchParams.get("purchase_order_name");
        const transaction_id = searchParams.get("transaction_id");

        if (
            !amount ||
            !total_amount ||
            !status ||
            !mobile ||
            !tidx ||
            !purchase_order_id ||
            !purchase_order_name ||
            !transaction_id
        ) {
            return NextResponse.json(
                { error: "Missing data parameter" },
                { status: 400 }
            );
        }

        // Find Payment record
        const payment = await Payment.findOne({ transactionId: purchase_order_id });
        if (!payment) {
            return NextResponse.json(
                { error: "Payment record not found" },
                { status: 404 }
            );
        }

        // Update Payment and Contract based on status
        if (status === "Completed") {
            // Update the payment status and transaction code in the database
            await Payment.updateOne(
                { transactionId: purchase_order_id },
                {
                    status: "completed",
                    transactionCode: transaction_id,
                }
            );

            // Update the contract status to completed
            await Contract.updateOne(
                { _id: payment.contractId },
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

            // Perform direct redirect
            const redirectUrl = new URL(
                `/paymentBilling/success/${payment.contractId}/${payment.freelancerId}`,
                process.env.NEXT_PUBLIC_BASE_URL
            );
            redirectUrl.searchParams.set("method", "khalti");
            redirectUrl.searchParams.set("amount", amount);
            redirectUrl.searchParams.set("total_amount", total_amount);
            redirectUrl.searchParams.set("status", status);
            redirectUrl.searchParams.set("mobile", mobile);
            redirectUrl.searchParams.set("tidx", tidx);
            redirectUrl.searchParams.set("purchase_order_id", purchase_order_id);
            redirectUrl.searchParams.set("purchase_order_name", purchase_order_name);
            redirectUrl.searchParams.set("transaction_id", transaction_id);

            console.log("Redirecting to:", redirectUrl.toString());
            return NextResponse.redirect(redirectUrl.toString(), 302);

        } else if (status !== "Completed") {
            // Update the payment status to failed
            await Payment.updateOne(
                { transactionId: purchase_order_id },
                {
                    status: "failed",
                    transactionCode: transaction_id || "N/A",
                }
            );

            const redirectUrl = new URL(
                `/paymentBilling/failure/${payment.contractId}/${payment.freelancerId}`,
                process.env.NEXT_PUBLIC_BASE_URL
            );
            redirectUrl.searchParams.set("method", "khalti");

            redirectUrl.searchParams.set("amount", amount);
            redirectUrl.searchParams.set("total_amount", total_amount);
            redirectUrl.searchParams.set("status", status);
            redirectUrl.searchParams.set("mobile", mobile);
            redirectUrl.searchParams.set("tidx", tidx);
            redirectUrl.searchParams.set("purchase_order_id", purchase_order_id);
            redirectUrl.searchParams.set("purchase_order_name", purchase_order_name);
            redirectUrl.searchParams.set("transaction_id", transaction_id);

            console.log("Redirecting to:", redirectUrl.toString());
            return NextResponse.redirect(redirectUrl.toString(), 302);

        } else {
            return NextResponse.json(
                { error: `Unknown payment status: ${status}` },
                { status: 400 }
            );
        }
    } catch (err) {
        console.error("Callback error:", err);
        return NextResponse.json(
            {
                error: "Error processing callback",
                details: err instanceof Error ? err.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}