import { Users, Wallet, Landmark, ReceiptText } from "lucide-react";

import StatCard from "../../../components/common/StatCard";
import "./DashboardPage.css";

function DashboardPage() {
  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="dashboard-page-header">
        <h1>Dashboard</h1>

        <p>Overview of your Kachuli management system.</p>
      </div>

      {/* Statistics */}
      <div className="dashboard-stats">
        <StatCard title="Total Members" value="0" icon={Users} color="blue" />

        <StatCard
          title="Total Savings"
          value="Rs. 0"
          icon={Wallet}
          color="green"
        />

        <StatCard
          title="Active Loans"
          value="Rs. 0"
          icon={Landmark}
          color="amber"
        />

        <StatCard
          title="Total Expenses"
          value="Rs. 0"
          icon={ReceiptText}
          color="red"
        />
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content-grid">
        {/* Savings Overview */}
        <div className="dashboard-panel savings-panel">
          <div className="dashboard-panel-header">
            <h2>Savings Overview</h2>

            <p>Savings activity will appear here.</p>
          </div>

          <div className="dashboard-empty-state">
            <p>No savings data available</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-panel activity-panel">
          <div className="dashboard-panel-header">
            <h2>Recent Activity</h2>

            <p>Latest system activity</p>
          </div>

          <div className="dashboard-empty-state">
            <p>No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
