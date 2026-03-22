"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import JobDetails from "./jobDetails";
import TimeLine from "./timeLine";

import Requirements from "./Requirements";
import Deliveries from "./deliveries";
import FileSection from "./fileSection";
import ClientInfomation from "./clientInfomation";
import CommunicationSection from "./communicationSection";
import Button from "./contractButton";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";
import ContractDetails from "./contractDetails";
import ReviewForm from "@/app/ui/reviewForm";

type ContractState = {
  _id: string; // Project ID
  jobId: {
    _id: string; // Job ID
    description: string;
    title: string;
  };
  contractId: {
    _id: string;
    paymentType: string;
    price: number;
    deadline: string;
    status: "pending" | "active" | "completed" | "canceled" | "declined";
  };
  freelancerId: string;
  clientId: string;
  project_todo: Array<{
    _id: string;
    task: string;
    deadline: string; // ISO 8601 string
    memo?: string;
    status: "Pending" | "In Progress" | "Completed";
  }>;
  project_files: Array<{
    _id: string;
    file_name: string;
    url: string;
    uploaded_at: string; // ISO 8601 string
  }>;
  deliveries: string[];
  requirements: string[];
  meetings: Array<{
    _id: string;
    meeting_date: string; // ISO 8601 string
    meeting_link: string;
    scheduled_by: "freelancer" | "client";
    notes?: string;
  }>;
  status: "ongoing" | "completed" | "revisions" | "canceled";
  created_at: string; // ISO 8601 string
  updated_at: string; // ISO 8601 string
};

interface Props {
  contractId: string;
  jobId: string;
}

export default function ContractDetailsPage({ contractId, jobId }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<ContractState | null>(null);
  const { session } = useAuth();

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `/api/project-details?contractId=${contractId}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch project details");
      }

      const { project } = await response.json();
      setContract(project);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contractId]); // ✅ Dependency: contractId

  useEffect(() => {
    if (contractId) {
      fetchProjectDetails();
    }
  }, [contractId, fetchProjectDetails]); // ✅ Dependency: fetchProjectDetails

  const handleSuccess = () => {
    console.log("Action completed successfully");
    fetchProjectDetails(); // ✅ No more issues!
  };

  const handleError = (error: Error) => {
    console.error("Action failed:", error.message);
    setError(error.message);
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-red-600">
        Error: {error}
      </div>
    );
  }

  // Helper function to get status styling
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const userRole =
    contract?.freelancerId === session?.user.id ? "freelancer" : "client";

  return (
    <div className="container mx-auto py-8 px-4">
      <JobDetails jobId={jobId} />
      <ContractDetails
        contractDetails={contract?.contractId}
        projectStatus={contract?.status}
      />
      {/* Display Project Status */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Project Status</h2>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
            contract?.status
          )}`}
        >
          {contract?.status || "Active"}
        </span>
        {contract?.status === "revisions" && (
          <span
            className={`inline-flex items-center ml-5 rounded-full px-3 py-1 text-sm font-medium text-gray-100 bg-blue-400`}
          >
            {" "}
            {userRole == "client"
              ? "Review the work and mark the project complete to proceed to payment"
              : "The project submited for review for client."}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TimeLine
            contractId={contractId}
            project_todo={contract?.project_todo || []}
            userRole={userRole}
            projectStatus={contract?.status}
          />
          <Requirements
            requirements={contract?.requirements}
            contractId={contractId}
            userRole={userRole}
            projectStatus={contract?.status}
          />
          <Deliveries
            deliverables={contract?.deliveries || []}
            contractId={contractId}
            userRole={userRole}
            projectStatus={"ongoing"}
          />
          <FileSection
            files={contract?.project_files || []}
            contractId={contractId}
            userRole={userRole}
            projectStatus={contract?.status}
          />
        </div>
        <div className="space-y-6">
          {/* <ClientInfomation jobId={jobId} /> */}
          <CommunicationSection
            contractId={contractId}
            meetings={contract?.meetings || []}
            userRole={userRole} // Replace with auth logic
            projectStatus={contract?.status}
          />
          <div className="flex w-full gap-3">
            <ProjectActions
              contractId={contractId}
              userRole={userRole}
              projectStatus={contract?.status}
              onSuccess={handleSuccess}
              onError={handleError}
              clientId={contract?.clientId}
              contractStatus={contract?.contractId.status}
              freelancerId={contract?.freelancerId}
              jobId={jobId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ProjectActions component for button rendering
interface ProjectActionsProps {
  contractId: string;
  userRole: "freelancer" | "client";
  projectStatus?: "ongoing" | "completed" | "revisions" | "canceled";
  clientId?: string;
  contractStatus?: "pending" | "active" | "completed" | "canceled" | "declined";
  freelancerId?: string;
  jobId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({
  contractStatus,
  clientId,
  contractId,
  userRole,
  projectStatus,
  freelancerId,
  jobId,
  onSuccess,
  onError,
}) => {
  const renderButtons = () => {
    const buttons = [];
    const buttonClass = "mr-2";

    if (projectStatus === "completed") {
      {
        if (contractStatus === "active") {
          if (userRole === "client") {
            buttons.push(
              <Link
                key="proceed-to-payment"
                href={`/paymentBilling/${contractId}/gateway-select/${clientId}`}
                className={`${buttonClass} bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600`}
              >
                Proceed to Payment
              </Link>
            );
          } else if (userRole === "freelancer") {
            return (
              <p className="text-yellow-500 italic">
                Payment is pending at client side.
              </p>
            );
          }
          return buttons.length > 0 ? (
            <div className="flex flex-wrap gap-2">{buttons}</div>
          ) : null;
        } else if (contractStatus === "completed") {
          if (userRole === "client") {
            return (
              <ReviewForm
                revieweeId={freelancerId}
                reviewerId={clientId}
                contractId={contractId}
              />
            );
          } else if (userRole === "freelancer") {
            return (
              <ReviewForm
                revieweeId={clientId}
                reviewerId={freelancerId}
                contractId={contractId}
              />
            );
          }
        }
      }
    }

    if (projectStatus === "canceled") {
      return (
        <p className="text-gray-500 italic">
          Project is canceled. No further actions available.
        </p>
      );
    }

    if (userRole === "freelancer") {
      if (projectStatus === "ongoing") {
        buttons.push(
          <Button
            key="revisions"
            action="revisions"
            contractId={contractId}
            userRole={userRole}
            projectStatus={projectStatus}
            onSuccess={onSuccess}
            onError={onError}
            className={buttonClass}
          />
        );
      }
      if (projectStatus === "revisions") {
        buttons.push(
          <Button
            key="withdraw"
            action="withdraw"
            contractId={contractId}
            userRole={userRole}
            projectStatus={projectStatus}
            onSuccess={onSuccess}
            onError={onError}
            className={buttonClass}
          />
        );
      }
      buttons.push(
        <Button
          key="canceled"
          action="canceled"
          contractId={contractId}
          userRole={userRole}
          projectStatus={projectStatus}
          onSuccess={onSuccess}
          onError={onError}
          className={buttonClass}
        />
      );
    }

    if (userRole === "client") {
      buttons.push(
        <Button
          key="completed"
          action="completed"
          contractId={contractId}
          userRole={userRole}
          projectStatus={projectStatus}
          onSuccess={onSuccess}
          onError={onError}
          className={buttonClass}
        />
      );
      buttons.push(
        <Button
          key="canceled"
          action="canceled"
          contractId={contractId}
          userRole={userRole}
          projectStatus={projectStatus}
          onSuccess={onSuccess}
          onError={onError}
          className={buttonClass}
        />
      );
    }

    return buttons.length > 0 ? (
      <div className="flex flex-wrap gap-2">{buttons}</div>
    ) : (
      <p className="text-gray-500 italic">
        No actions available for your role.
      </p>
    );
  };

  return <div className="mt-4 w-full">{renderButtons()}</div>;
};

{
  /* <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
  <div
    className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
    onClick={() => toggleSection("communication")}
  >
    <h2 className="text-lg font-semibold">Communication</h2>
    {expandedSections.communication ? (
      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
    ) : (
      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
    )}
  </div>
  {expandedSections.communication && (
    <div className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 text-blue-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">
                Kickoff Meeting
              </p>
              <p className="text-xs text-gray-500">
                March 16, 2025 • 10:00 AM
              </p>
            </div>
          </div>
        </div>
        <button className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mt-2">
          <PlusIcon className="h-4 w-4 mr-1" />
          Schedule Meeting
        </button>
      </div>
    </div>
  )}
</div> */
}
{
  /* Budget Section */
}
{
  /* <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div
              className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection("budget")}
            >
              <h2 className="text-lg font-semibold">Budget & Payments</h2>
              {expandedSections.budget ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </div>
            {expandedSections.budget && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-xl font-bold">{contract.budget.total}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-xl font-bold text-green-700">
                      {contract.budget.paid}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-xl font-bold text-yellow-700">
                      {contract.budget.pending}
                    </p>
                  </div>
                </div>
                <h3 className="font-medium mb-3">Payment Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Milestone
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Due Date
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contract.budget.schedule.map((payment, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.milestone}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {payment.amount}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {payment.date}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(payment.status)}`}
                            >
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div> */
}
