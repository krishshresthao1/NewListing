import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getLoanHistory } from "../services/loanService";

import "./LoanPassbookPage.css";

function LoanPassbookPage() {
  const { loanId } = useParams();
  const navigate = useNavigate();

  const [passbook, setPassbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPassbook = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getLoanHistory(loanId);

        setPassbook(data);
      } catch (err) {
        setError(err.message || "Failed to load loan history");
      } finally {
        setLoading(false);
      }
    };

    loadPassbook();
  }, [loanId]);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getHistoryTitle = (type) => {
    if (type === "additional_loan") {
      return "Additional Loan";
    }

    return "Loan Taken";
  };

  if (loading) {
    return (
      <div className="loan-passbook-page">
        <div className="loan-passbook-loading">Loading loan passbook...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loan-passbook-page">
        <div className="loan-passbook-error">{error}</div>
      </div>
    );
  }

  const history = passbook?.loan_history || [];

  return (
    <div className="loan-passbook-page">
      {/* =================================================
          TOP
      ================================================= */}

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="loan-passbook-header">
        <div>
          <h1>Loan Passbook</h1>

          <p>
            Complete loan history for this member.
            
          </p>
        </div>

        <div className="loan-passbook-top">
          <button className="loan-passbook-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>

      {/* =================================================
          MEMBER INFORMATION
      ================================================= */}

      <div className="loan-passbook-member-card">
        <div className="loan-passbook-member-info">
          <div>
            <span>Member</span>
            <strong>{passbook?.member_name}</strong>
          </div>

          <div>
            <span>Account No.</span>
            <strong>{passbook?.account_no || "-"}</strong>
          </div>

          <div>
            <span>Group</span>
            <strong>{passbook?.group_name}</strong>
          </div>

          <div>
            <span>Subgroup</span>
            <strong>{passbook?.subgroup_name}</strong>
          </div>
        </div>
      </div>

      {/* =================================================
          CURRENT BALANCE
      ================================================= */}

      <div className="loan-passbook-balance-card">
        <div>
          <span>Current Loan Balance</span>

          <strong>Rs. {formatMoney(passbook?.principal_balance)}</strong>
        </div>

        <div>
          <span>Total Loan Given</span>

          <strong>Rs. {formatMoney(passbook?.principal_amount)}</strong>
        </div>

        <div>
          <span>Total Interest Charged</span>

          <strong>Rs. {formatMoney(passbook?.total_interest_charged)}</strong>
        </div>

        <div>
          <span>Service Charge</span>

          <strong>Rs. {formatMoney(passbook?.service_charge)}</strong>
        </div>
      </div>

      {/* =================================================
          LOAN HISTORY
      ================================================= */}

      <div className="loan-passbook-history-card">
        <div className="loan-passbook-section-header">
          <div>
            <h2>Loan History</h2>

            <p>Record of loans given to this member.</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="loan-passbook-empty">
            <h3>No loan history available</h3>

            <p>This loan was created before loan history tracking was added.</p>
          </div>
        ) : (
          <div className="loan-passbook-history-list">
            {history.map((item, index) => (
              <div
                className="loan-passbook-history-item"
                key={`${item.created_at || item.loan_date}-${index}`}
              >
                <div className="loan-passbook-history-date">
                  {formatDate(item.loan_date)}
                </div>

                <div className="loan-passbook-history-content">
                  <div className="loan-passbook-history-title">
                    <h3>{getHistoryTitle(item.type)}</h3>
                  </div>

                  <div className="loan-passbook-history-details">
                    <div>
                      <span>Principal</span>

                      <strong>Rs. {formatMoney(item.amount)}</strong>
                    </div>

                    <div>
                      <span>Interest Rate</span>

                      <strong>{item.interest_rate}%</strong>
                    </div>

                    <div>
                      <span>Service Charge</span>

                      <strong>Rs. {formatMoney(item.service_charge)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoanPassbookPage;
