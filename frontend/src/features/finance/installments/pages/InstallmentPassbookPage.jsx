import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "react-toastify";

import { getLoanInstallments } from "../services/installmentService";

import "./InstallmentPassbookPage.css";

function InstallmentPassbookPage() {
  const { loanId } = useParams();
  const navigate = useNavigate();

  const [loanData, setLoanData] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loanId) {
      toast.error("Loan ID is missing");
      setLoading(false);
      return;
    }

    fetchInstallments();
  }, [loanId]);

  const fetchInstallments = async () => {
    try {
      setLoading(true);

      const data = await getLoanInstallments(loanId);

      console.log("Installment passbook response:", data);

      setLoanData(data);
      setInstallments(
        Array.isArray(data?.installments) ? data.installments : [],
      );
    } catch (error) {
      console.error("Installment passbook error:", error);

      toast.error(error.message || "Failed to load installment history");

      setLoanData(null);
      setInstallments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB");
  };

  const totalPrincipal = Number(loanData?.total_principal_paid || 0);

  const totalInterest = Number(loanData?.total_interest_paid || 0);

  const totalPaid = Number(loanData?.total_paid || 0);

  const currentBalance = Number(loanData?.principal_balance || 0);

  const originalLoan = Number(loanData?.principal_amount || 0);

  return (
    <div className="installment-passbook-page">
      {/* Header */}
      <div className="passbook-header">
        <div>
          <h1>Installment Passbook</h1>

          <p>Complete installment payment history for this loan.</p>
        </div>

        <button className="installment-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={17} />
          Back
        </button>
      </div>

      {loading ? (
        <div className="passbook-table-container">
          <div className="passbook-loading">Loading installment history...</div>
        </div>
      ) : !loanData ? (
        <div className="passbook-table-container">
          <div className="passbook-empty">
            Loan information could not be loaded.
          </div>
        </div>
      ) : (
        <>
          {/* Member Information */}
          <div className="passbook-member-info">
            <div className="member-info-item">
              <span>Member</span>
              <strong>{loanData.member_name || "Unknown Member"}</strong>
            </div>

            <div className="member-info-item">
              <span>Account No.</span>
              <strong>{loanData.account_no || "-"}</strong>
            </div>

            <div className="member-info-item">
              <span>Group</span>
              <strong>{loanData.group_name || "Unknown Group"}</strong>
            </div>

            <div className="member-info-item">
              <span>Subgroup</span>
              <strong>{loanData.subgroup_name || "Unknown Subgroup"}</strong>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="passbook-summary">
            <div className="passbook-summary-card">
              <span>Original Loan</span>

              <strong>{formatAmount(originalLoan)}</strong>
            </div>

            <div className="passbook-summary-card">
              <span>Remaining Balance</span>

              <strong>{formatAmount(currentBalance)}</strong>
            </div>

            <div className="passbook-summary-card">
              <span>Principal Paid</span>

              <strong>{formatAmount(totalPrincipal)}</strong>
            </div>

            <div className="passbook-summary-card">
              <span>Interest Paid</span>

              <strong>{formatAmount(totalInterest)}</strong>
            </div>

            <div className="passbook-summary-card">
              <span>Total Paid</span>

              <strong>{formatAmount(totalPaid)}</strong>
            </div>
          </div>

          {/* Action */}
          <div className="passbook-action-row">
            <button
              className="passbook-add-btn"
              onClick={() => navigate(`/installments/entry?loanId=${loanId}`)}
            >
              <Plus size={17} />
              Add Installment
            </button>
          </div>

          {/* Installment History */}
          <div className="passbook-table-container">
            {installments.length === 0 ? (
              <div className="passbook-empty">
                No installment payments have been recorded yet.
              </div>
            ) : (
              <table className="passbook-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Payment Date</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Total Paid</th>
                    <th>Remaining Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {installments.map((installment, index) => (
                    <tr key={installment.id || index}>
                      <td>{index + 1}</td>

                      <td>{formatDate(installment.installment_date)}</td>

                      <td>{formatAmount(installment.principal_amount)}</td>

                      <td>{formatAmount(installment.interest_amount)}</td>

                      <td>{formatAmount(installment.total_amount)}</td>

                      <td>{formatAmount(installment.remaining_balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default InstallmentPassbookPage;
