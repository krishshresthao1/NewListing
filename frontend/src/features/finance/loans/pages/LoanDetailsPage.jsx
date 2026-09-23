import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getSubgroupLoanDetails } from "../services/loanService";

import "./LoanDetailsPage.css";

function LoanDetailsPage() {
  const { subgroupId } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSubgroupLoanDetails(subgroupId);

        setDetails(data);
      } catch (err) {
        setError(err.message || "Failed to load subgroup loan details");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [subgroupId]);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="loan-details-page">
        <div className="loan-details-loading">Loading loan details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loan-details-page">
        <div className="loan-details-error">{error}</div>
      </div>
    );
  }

  const members = details?.members || [];

  return (
    <div className="loan-details-page">
      {/* =================================================
          TOP SECTION
      ================================================= */}

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="loan-details-header">
        <div>
          <h1>{details?.subgroup_name}</h1>

          <p>
            Group: <strong>{details?.group_name}</strong>
          </p>
        </div>
        <div className="loan-details-top">
          <button className="loan-back-button" onClick={() => navigate(-1)}>
            ← Back to loans
          </button>
        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="loan-details-summary">
        <div className="loan-details-card">
          <span>Total Loan</span>

          <strong>Rs. {formatMoney(details?.total_loan)}</strong>
        </div>

        <div className="loan-details-card">
          <span>Outstanding</span>

          <strong>Rs. {formatMoney(details?.total_outstanding)}</strong>
        </div>

        <div className="loan-details-card">
          <span>Total Interest</span>

          <strong>Rs. {formatMoney(details?.total_interest)}</strong>
        </div>

        <div className="loan-details-card">
          <span>Service Charge</span>

          <strong>Rs. {formatMoney(details?.total_service_charge)}</strong>
        </div>
      </div>

      {/* =================================================
          MEMBER LOANS
      ================================================= */}

      <div className="loan-details-table-card">
        <div className="loan-details-table-header">
          <div>
            <h2>Member Loans</h2>

            <p>View loan balance and loan history for each member.</p>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="loan-details-empty">
            <h3>No loans in this subgroup</h3>

            <p>Once a loan is given to a member, it will appear here.</p>

            <button
              className="loan-primary-button"
              onClick={() => navigate("/loans/entry")}
            >
              Give New Loan
            </button>
          </div>
        ) : (
          <div className="loan-details-table-wrapper">
            <table className="loan-details-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Original Loan</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <tr key={member.loan_id}>
                    <td>
                      <strong>{member.member_name}</strong>
                    </td>

                    <td>Rs. {formatMoney(member.principal_amount)}</td>

                    <td>Rs. {formatMoney(member.principal_balance)}</td>

                    <td>
                      <span
                        className={
                          member.status === "active"
                            ? "loan-status-active"
                            : "loan-status-inactive"
                        }
                      >
                        {member.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="loan-view-button"
                        onClick={() =>
                          navigate(`/loans/member/${member.loan_id}`)
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

export default LoanDetailsPage;
