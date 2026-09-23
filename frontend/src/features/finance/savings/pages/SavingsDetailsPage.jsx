import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SavingsDetailsPage.css";

function SavingsDetailsPage() {
  const { subgroupId } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchDetails();
  }, [subgroupId]);

  const fetchDetails = async (month = null, year = null) => {
    try {
      setLoading(true);
      setError("");

      let url = `${API_URL}/savings/subgroup/${subgroupId}/details`;

      // Add month/year only when selected
      if (month && year) {
        url += `?month=${month}&year=${year}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to load saving details");
      }

      const data = await response.json();

      setDetails(data);

      // Set the picker to the month returned by backend
      setSelectedMonth(data.month);
      setSelectedYear(data.year);
    } catch (error) {
      console.error(error);
      setError("Unable to load saving details.");
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (value) => {
    if (!value) return;

    const [year, month] = value.split("-");

    const numericYear = Number(year);
    const numericMonth = Number(month);

    setSelectedYear(numericYear);
    setSelectedMonth(numericMonth);

    // Actually request the selected month from backend
    fetchDetails(numericMonth, numericYear);
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

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-IN").format(amount || 0);

  if (loading) {
    return (
      <div className="savings-details-page">
        <div className="details-loading">Loading saving details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="savings-details-page">
        <div className="details-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="savings-details-page">
      {/* Header */}
      <div className="details-header">
        <div className="details-header-left">
          <h1>{details.subgroup_name}</h1>

          <p>
            {details.group_name} ·{" "}
            <strong>
              {getMonthName(details.month)} {details.year}
            </strong>
          </p>
        </div>

        {/* Month Filter */}
        <div className="details-month-filter">
          <label>Month</label>

          <input
            type="month"
            value={
              selectedYear && selectedMonth
                ? `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
                : ""
            }
            onChange={(e) => handleMonthChange(e.target.value)}
          />
        </div>
        <button className="back-btn" onClick={() => navigate("/savings")}>
          ← Back
        </button>
      </div>

      {/* Summary */}
      <div className="details-summary">
        <div className="summary-card">
          <span>Subgroup</span>
          <strong>{details.subgroup_name}</strong>
        </div>

        <div className="summary-card">
          <span>Total Members</span>
          <strong>{details.members.length}</strong>
        </div>

        <div className="summary-card">
          <span>Total Saving</span>
          <strong>Rs. {formatAmount(details.total_saving)}</strong>
        </div>
      </div>

      {/* Member Savings */}
      <div className="details-card">
        <div className="details-card-header">
          <div>
            <h2>Member Savings</h2>

            <p>
              Individual savings for {getMonthName(details.month)}{" "}
              {details.year}
            </p>
          </div>
        </div>

        <div className="details-table-wrapper">
          <table className="details-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Member</th>
                <th>Account No.</th>
                <th>Saving</th>
              </tr>
            </thead>

            <tbody>
              {details.members.length > 0 ? (
                details.members.map((member, index) => (
                  <tr key={member.member_id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{member.member_name}</strong>
                    </td>

                    <td>{member.account_no}</td>

                    <td>
                      <span className="member-saving">
                        Rs. {formatAmount(member.saving)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-members">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>

            {details.members.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="3">
                    <strong>Total</strong>
                  </td>

                  <td>
                    <strong className="total-saving">
                      Rs. {formatAmount(details.total_saving)}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

export default SavingsDetailsPage;
