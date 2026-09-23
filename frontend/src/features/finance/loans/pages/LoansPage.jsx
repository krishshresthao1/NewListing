import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getLoanDashboard } from "../services/loanService";

import "./LoanPage.css";

function LoanPage() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getLoanDashboard();

        setDashboard(data);
      } catch (err) {
        setError(err.message || "Failed to load loan dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="loan-page">
        <div className="loan-loading">Loading loan dashboard...</div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="loan-page">
        <div className="loan-error">{error}</div>
      </div>
    );
  }

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // =====================================================
  // DASHBOARD DATA
  // =====================================================

  const subgroups = dashboard?.subgroups || [];

  return (
    <div className="loan-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="loan-page-header">
        <div>
          <h1>Loans</h1>

          <p>
            Manage and track group loans, outstanding balances and interest.
          </p>
        </div>

        <button
          className="loan-primary-button"
          onClick={() => navigate("/loans/entry")}
        >
          + Give New Loan
        </button>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="loan-summary-grid">
        {/* Total Loan Given */}

        <div className="loan-summary-card">
          <div className="loan-card-label">Total Loan Given</div>

          <div className="loan-card-value">
            Rs. {formatMoney(dashboard?.total_loan_amount)}
          </div>
        </div>

        {/* Total Outstanding */}

        <div className="loan-summary-card">
          <div className="loan-card-label">Total Outstanding</div>

          <div className="loan-card-value">
            Rs. {formatMoney(dashboard?.total_outstanding)}
          </div>
        </div>

        {/* Total Interest */}

        <div className="loan-summary-card">
          <div className="loan-card-label">Total Interest</div>

          <div className="loan-card-value">
            Rs. {formatMoney(dashboard?.total_interest)}
          </div>
        </div>

        {/* Service Charge */}

        <div className="loan-summary-card">
          <div className="loan-card-label">Total Service Charge</div>

          <div className="loan-card-value">
            Rs. {formatMoney(dashboard?.total_service_charge)}
          </div>
        </div>

        {/* Active Loans */}

        <div className="loan-summary-card">
          <div className="loan-card-label">Active Loans</div>

          <div className="loan-card-value">{dashboard?.active_loans || 0}</div>
        </div>
      </div>

      {/* =================================================
          SUBGROUP TABLE
      ================================================= */}

      <div className="loan-table-card">
        <div className="loan-table-header">
          <div>
            <h2>Loans by Subgroup</h2>

            <p>View total loans and outstanding amounts for each subgroup.</p>
          </div>
        </div>

        {subgroups.length === 0 ? (
          <div className="loan-empty-state">
            <h3>No loans yet</h3>

            <p>
              Once a loan is given, subgroup loan information will appear here.
            </p>

            <button
              className="loan-primary-button"
              onClick={() => navigate("/loans/entry")}
            >
              Give New Loan
            </button>
          </div>
        ) : (
          <div className="loan-table-wrapper">
            <table className="loan-table">
              <thead>
                <tr>
                  <th>Subgroup</th>

                  <th>Group</th>

                  <th>Total Loan</th>

                  <th>Outstanding</th>

                  <th>Interest</th>

                  <th>Service Charge</th>

                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {subgroups.map((subgroup) => (
                  <tr key={subgroup.subgroup_id}>
                    <td>
                      <strong>{subgroup.subgroup_name}</strong>
                    </td>

                    <td>{subgroup.group_name}</td>

                    <td>Rs. {formatMoney(subgroup.total_loan)}</td>

                    <td>Rs. {formatMoney(subgroup.total_outstanding)}</td>

                    <td>Rs. {formatMoney(subgroup.total_interest)}</td>

                    <td>Rs. {formatMoney(subgroup.total_service_charge)}</td>

                    <td>
                      <button
                        className="loan-view-button"
                        onClick={() =>
                          navigate(`/loans/subgroup/${subgroup.subgroup_id}`)
                        }
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoanPage;
