import Sidebar from "../ui/admin-components/sidebar";
import "../ui/globals.css";
import Charts from "../ui/admin-components/dashboard-charts/dashboard-charts";
import FinancialHighlights from "../ui/admin-components/financial-stats";
import { fetchWithAuth } from "../lib/fetchWIthAuth";
import DashboardCharts from "../ui/admin-components/dashboard-charts/dashboardbelow-charts";
import TurnOverCharts from "../ui/admin-components/dashboard-charts/dashboardbelow-charts";
import DashboardSide from "../ui/admin-components/dashboard-charts/dashboardbelowside-chart";

const Page = () => {
  return (
    <div className="flex flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex p-6 flex-col md:p-10 w-full">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Admin Dashboard
        </h1>

        {/* Charts Section */}

        <div className="grid grid-cols-2  gap-6 mb-8">
          <Charts />
          <FinancialHighlights />
        </div>

        {/* Financial Highlights Component */}

        {/* Additional Components */}
        <div className="grid grid-cols-2 gap-6">
          <TurnOverCharts />
          <DashboardSide />
        </div>
      </div>
    </div>
  );
};

export default Page;
