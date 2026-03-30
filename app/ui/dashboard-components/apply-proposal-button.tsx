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
    // Fetch the actions data when the component mounts
    const fetchActions = async () => {
      try {
        const response = await fetchWithAuth(
          `/api/check-action?jobId=${jobId}&freelancerId=${userId}`
        );
        const data = await response.json();
        console.log("Fetched data:", data);

        // Set the actions state with the returned actions data
        setActions(data?.actions || []);
        setIsEligible(data?.isEligible !== false);
        setMismatchReason(data?.mismatchReason || "");
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false); // Stop loading in case of error
      }
    };

    fetchActions();
  }, [jobId, userId]);

  if (loading)
    return (
      <div className="w-full mt-10 h-12 bg-primary-500 animate-pulse text-white py-3 rounded-lg px-8 "></div>
    ); // Show loading while fetching data

  return (
    <>
      {Array.isArray(actions) && actions.includes("proposal_submitted") ? (
        <>
          <div className="w-full mt-10 bg-primary-900 text-white py-3 rounded-lg px-8 cursor-not-allowed sm:text-center text-center">
            Apply for this Wedding Gig
          </div>
          <div className="mt-10 text-primary-500 sm:text-center text-center">
            {" "}
            You&apos;ve already applied for this wedding gig
            <br />
            <Link className="underline" href={"/user/your-proposal"}>
              View Proposal
            </Link>
          </div>
        </>
      ) : !isEligible ? (
        <>
          <button disabled className="w-full mt-10 bg-gray-400 text-white py-3 rounded-lg px-8 cursor-not-allowed sm:text-center text-center">
            Apply for this Wedding Gig
          </button>
          <div className="mt-4 text-red-500 text-sm sm:text-center text-center px-4 font-medium">
            {mismatchReason || "You do not meet the preferred requirements for this gig."}
          </div>
        </>
      ) : (
        <div className="mt-10">
          {/* Apply Button */}
          <Link
            className="w-full bg-primary-600 text-white py-3 rounded-lg px-8 block sm:text-center text-center hover:bg-primary-700 transition"
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
