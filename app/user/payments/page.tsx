import React, { Suspense } from "react";
import { Payment } from "../../ui/payment";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

const PaymentsPage: React.FC = () => {
  return (
    <PageShell
      title="Payment Gateways"
      description="Choose your preferred payment method and complete transactions securely"
    >
      <PageCard>
        <div className="flex justify-center">
          <Suspense fallback={<div>Loading...</div>}>
            <Payment contractId={"7777"} userId={"88"} />
          </Suspense>
        </div>
      </PageCard>
    </PageShell>
  );
};

export default PaymentsPage;
