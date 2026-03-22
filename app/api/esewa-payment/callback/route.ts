import { NextRequest, NextResponse } from "next/server";
import Payment from "@/models/payment";
import Contract from "@/models/contract";
// import { generateEsewaSignature } from "@/app/lib/generateEsewaSignature"; // if needed, can be implemented

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const data = searchParams.get("data");

        if (!data) {
            return NextResponse.json(
                { error: "Missing data parameter" },
                { status: 400 }
            );
        }

        // Decode and parse the data
        const decodedData = decodeURIComponent(data);
        const paymentData = JSON.parse(atob(decodedData)) as {
            transaction_code: string;
            status: string;
            total_amount: string;
            transaction_uuid: string;
            product_code: string;
            signed_field_names: string;
            signature: string;
            error_message?: string;
        };

        const {
            transaction_code,
            status,
            total_amount,
            transaction_uuid,
            product_code,
            signed_field_names,
            signature,
            error_message,
        } = paymentData;

        // Validate mandatory fields
        if (!total_amount || !transaction_uuid || !product_code) {
            return NextResponse.json(
                { error: "Missing mandatory fields (total_amount, transaction_uuid, product_code)" },
                { status: 400 }
            );
        }

        // Find Payment record
        const payment = await Payment.findOne({ transactionId: transaction_uuid });
        if (!payment) {
            return NextResponse.json(
                { error: "Payment record not found" },
                { status: 404 }
            );
        }

        // Update Payment and Contract based on status
        if (status === "COMPLETE") {
            // Update the payment status and transaction code in the database
            await Payment.updateOne(
                { transactionId: transaction_uuid },
                {
                    status: "completed",
                    transactionCode: transaction_code,
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
            console.log("contract and payment updated successfully");

            // Perform direct redirect

            const redirectUrl = new URL(
                `/paymentBilling/success/${payment.contractId}/${payment.freelancerId}`,
                process.env.NEXT_PUBLIC_BASE_URL
            );
            redirectUrl.searchParams.set("method", "esewa");
            redirectUrl.searchParams.set("data", data);
            return NextResponse.redirect(redirectUrl.toString(), 302);

        } else if (status === "FAILED") {
            // Update the payment status to failed
            await Payment.updateOne(
                { transactionId: transaction_uuid },
                {
                    status: "failed",
                    transactionCode: transaction_code || "N/A",
                    ...(error_message && { errorMessage: error_message }),
                }
            );

            // Perform direct redirect for failure
            return NextResponse.redirect(`/paymentBilling/failure?data=${data}`, 302);
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
