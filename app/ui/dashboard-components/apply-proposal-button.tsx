import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

interface Props {
  jobId?: string;
  userId?: string;
}

const ApplyProposalButton = ({ jobId, userId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<string[] | null>(null);
  const [isEligible, setIsEligible] = useState<boolean>(true);
  const [mismatchReason, setMismatchReason] = useState<string>("");

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const response = await fetchWithAuth(
          `/api/check-action?jobId=${jobId}&freelancerId=${userId}`
        );
        const data = await response.json();
        console.log("Fetched data:", data);
        setActions(data?.actions || []);
        setIsEligible(data?.isEligible !== false);
        setMismatchReason(data?.mismatchReason || "");
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };

    fetchActions();
  }, [jobId, userId]);

  if (loading)
    return (
      <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-slate-200" />
    );

  return (
    <>
      {Array.isArray(actions) && actions.includes("proposal_submitted") ? (
        <>
          <div className="mt-6 w-full cursor-not-allowed rounded-xl bg-slate-900 px-6 py-3.5 text-center text-sm font-semibold text-white">
            Apply for this Wedding Gig
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm leading-6 text-slate-600">
            You&apos;ve already applied for this wedding gig.
            <br />
            <Link
              className="font-semibold text-primary-700 underline"
              href={"/user/your-proposals"}
            >
              View Proposal
            </Link>
          </div>
        </>
      ) : !isEligible ? (
        <>
          <button
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-xl bg-slate-400 px-6 py-3.5 text-center text-sm font-semibold text-white"
          >
            Apply for this Wedding Gig
          </button>
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-center text-sm font-medium leading-6 text-red-600">
            {mismatchReason ||
              "You do not meet the preferred requirements for this gig."}
          </div>
        </>
      ) : (
        <div className="mt-6">
          <Link
            className="block w-full rounded-xl bg-primary-700 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-primary-800"
            href={`/user/proposal/${jobId}`}
          >
            Apply for this Wedding Gig
          </Link>
        </div>
      )}
    </>
  );
};

export default ApplyProposalButton;
