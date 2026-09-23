import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SavingsPage.css";

function SavingsPage() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async (month = selectedMonth, year = selectedYear) => {
    try {
      setLoading(true);
      setError("");

      let url = `${API_URL}/savings/dashboard`;

      if (month && year) {
        url += `?month=${month}&year=${year}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to load savings");
      }

      const data = await response.json();

      setDashboard(data);

      // Set filter to the month returned by backend
      if (!selectedMonth) {
        setSelectedMonth(data.month);
        setSelectedYear(data.year);
      }
    } catch (error) {
      console.error(error);
      setError("Unable to load savings dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return months[month - 1];
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN").format(amount || 0);
  };

  if (loading) {
    return (
      <div className="savings-page">
        <div className="savings-loading">Loading savings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="savings-page">
        <div className="savings-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="savings-page">
      {/* Header */}

      <div className="savings-header">
        <div>
          <h1>Savings</h1>

          <p>
            Savings summary for{" "}
            <strong>
              {getMonthName(dashboard.month)} {dashboard.year}
            </strong>
          </p>
        </div>

        <div className="savings-header-actions">
          <div className="month-filter">

            <div className="month-filter">
              <label>Month</label>

              <input
                type="month"
                value={
                  selectedMonth && selectedYear
                    ? `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
                    : ""
                }
                onChange={(e) => {
                  if (!e.target.value) return;

                  const [year, month] = e.target.value.split("-");

                  setSelectedYear(Number(year));
                  setSelectedMonth(Number(month));

                  fetchDashboard(Number(month), Number(year));
                }}
              />
            </div>
          </div>

          <button
            className="savings-entry-btn"
            onClick={() => navigate("/savings/entry")}
          >
            + Entry
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="savings-card">
        <div className="savings-table-wrapper">
          <table className="savings-table">
            <thead>
              <tr>
                <th>Subgroup</th>
                <th>Group</th>
                <th>Total Saving</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.subgroups && dashboard.subgroups.length > 0 ? (
                dashboard.subgroups.map((subgroup) => (
                  <tr key={subgroup.subgroup_id}>
                    <td>
                      <strong>{subgroup.subgroup_name}</strong>
                    </td>

                    <td>{subgroup.group_name}</td>

                    <td>
                      <span className="saving-amount">
                        Rs. {formatAmount(subgroup.total_saving)}
                      </span>
                    </td>

                    <td>
                      <button
                        className="view-details-btn"
                        onClick={() =>
                          navigate(`/savings/subgroup/${subgroup.subgroup_id}`)
                        }
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-savings">
                    No subgroups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SavingsPage;
