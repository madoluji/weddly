import React, { Suspense } from "react";
import { Payment } from "../../ui/payment";

const PaymentsPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-semibold mt-5 text-center">
        Payment Gateways
      </h1>
      <div className="flex justify-center mt-10">
        <Suspense fallback={<div>Loading...</div>}>
          <Payment contractId={"7777"} userId={"88"} />
        </Suspense>
      </div>
    </div>
  );
};

export default PaymentsPage;
