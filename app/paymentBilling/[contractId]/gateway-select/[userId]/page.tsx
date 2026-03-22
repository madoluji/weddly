import React, { Suspense } from "react";
import { Payment } from "@/app/ui/payment";

const PaymentsPage = ({
  params,
}: {
  params: { contractId: string; userId: string };
}) => {
  const { contractId, userId } = params;
  return (
    <div>
      <h1 className="text-3xl font-semibold mt-5 text-center">
        Payment Gateways
      </h1>
      <div className="flex justify-center mt-10">
        <Suspense fallback={<div>Loading...</div>}>
          <Payment contractId={contractId} userId={userId} />
        </Suspense>
      </div>
    </div>
  );
};

export default PaymentsPage;
