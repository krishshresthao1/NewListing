import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Wallet,
  PiggyBank,
  CreditCard,
  Receipt,
  BookOpen,
  Eye,
} from "lucide-react";

import { getMemberPassbook } from "../services/memberService";
import "./MemberPassbookPage.css";

function MemberPassbookPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [passbook, setPassbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPassbook = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMemberPassbook(memberId);
        setPassbook(data);
      } catch (err) {
        console.error("Failed to load member passbook:", err);
        setError("Failed to load member passbook.");
      } finally {
        setLoading(false);
      }
    };

    loadPassbook();
  }, [memberId]);

  const formatAmount = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="member-passbook-page">
        <div className="passbook-loading">Loading member passbook...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="member-passbook-page">
        <div className="passbook-error">{error}</div>
      </div>
    );
  }

  if (!passbook) {
    return (
      <div className="member-passbook-page">
        <div className="passbook-error">Member passbook not found.</div>
      </div>
    );
  }

  const { member, summary, savings, loans, installments, transactions } =
    passbook;

  return (
    <div className="member-passbook-page">
      {/* Header */}
      <div className="member-passbook-header">
        <div>
          <h1>Member Passbook</h1>
          <p>Complete financial history of {member.name}</p>
        </div>

        <button className="passbook-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={17} />
          Back
        </button>
      </div>

      {/* Member Information */}
      <section className="passbook-section">
        <div className="section-title">
          <User size={20} />
          <h2>Member Information</h2>
        </div>

        <div className="member-info-card">
          <div className="member-avatar">
            {member.name?.charAt(0)?.toUpperCase()}
          </div>

          <div className="member-info-content">
            <h3>{member.name}</h3>

            <div className="member-info-grid">
              <div>
                <span>Account Number</span>
                <strong>{member.account_no || "-"}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{member.phone || "-"}</strong>
              </div>

              <div>
                <span>Address</span>
                <strong>{member.address || "-"}</strong>
              </div>

              <div>
                <span>Group</span>
                <strong>{member.group_name || "-"}</strong>
              </div>

              <div>
                <span>Subgroup</span>
                <strong>{member.subgroup_name || "-"}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong className="member-status">
                  {member.status || "-"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Summary */}
      <section className="passbook-section">
        <div className="section-title">
          <Wallet size={20} />
          <h2>Financial Summary</h2>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">
              <Wallet size={21} />
            </div>

            <div>
              <span>Opening Balance</span>
              <strong>{formatAmount(summary.opening_balance)}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <PiggyBank size={21} />
            </div>

            <div>
              <span>Current Savings</span>
              <strong>{formatAmount(summary.current_savings)}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <CreditCard size={21} />
            </div>

            <div>
              <span>Total Loan Given</span>
              <strong>{formatAmount(summary.total_loan_given)}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <CreditCard size={21} />
            </div>

            <div>
              <span>Outstanding Loan</span>
              <strong>{formatAmount(summary.outstanding_loan)}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <Receipt size={21} />
            </div>

            <div>
              <span>Total Interest</span>
              <strong>{formatAmount(summary.total_interest_charged)}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <Receipt size={21} />
            </div>

            <div>
              <span>Total Installment Paid</span>
              <strong>{formatAmount(summary.total_installment_paid)}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <Receipt size={21} />
            </div>

            <div>
              <span>Principal Paid</span>
              <strong>{formatAmount(summary.total_principal_paid)}</strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <Receipt size={21} />
            </div>

            <div>
              <span>Service Charge</span>
              <strong>{formatAmount(summary.total_service_charge)}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Savings History */}
      <section className="passbook-section">
        <div className="section-title">
          <PiggyBank size={20} />
          <h2>Savings History</h2>
        </div>

        <div className="passbook-table-wrapper">
          <table className="passbook-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Running Balance</th>
              </tr>
            </thead>

            <tbody>
              {savings.length > 0 ? (
                savings.map((saving) => (
                  <tr key={saving.id}>
                    <td>{saving.date}</td>
                    <td>
                      {saving.month}/{saving.year}
                    </td>
                    <td className="credit-amount">
                      + {formatAmount(saving.amount)}
                    </td>
                    <td>{formatAmount(saving.balance)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-table">
                    No savings records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Loan History */}
      <section className="passbook-section">
        <div className="section-title">
          <CreditCard size={20} />
          <h2>Loan History</h2>
        </div>

        <div className="passbook-table-wrapper">
          <table className="passbook-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Interest Rate</th>
                <th>Service Charge</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loans.length > 0 ? (
                loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.loan_date}</td>

                    <td>
                      <span className="transaction-badge">
                        {loan.type || "Loan"}
                      </span>
                    </td>

                    <td className="debit-amount">
                      - {formatAmount(loan.amount)}
                    </td>

                    <td>{loan.interest_rate || 0}%</td>

                    <td>{formatAmount(loan.service_charge)}</td>

                    <td>
                      <button
                        className="table-action-btn"
                        onClick={() =>
                          navigate(`/loans/member/${loan.loan_id}`)
                        }
                      >
                        <Eye size={15} />
                        View Passbook
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No loan records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Installment History */}
      <section className="passbook-section">
        <div className="section-title">
          <Receipt size={20} />
          <h2>Installment History</h2>
        </div>

        <div className="passbook-table-wrapper">
          <table className="passbook-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Total Paid</th>
                <th>Remaining</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {installments.length > 0 ? (
                installments.map((installment) => (
                  <tr key={installment.id}>
                    <td>{installment.installment_date}</td>

                    <td>{formatAmount(installment.principal_amount)}</td>

                    <td>{formatAmount(installment.interest_amount)}</td>

                    <td className="debit-amount">
                      - {formatAmount(installment.total_amount)}
                    </td>

                    <td>{formatAmount(installment.remaining_balance)}</td>

                    <td>
                      <button
                        className="table-action-btn"
                        onClick={() =>
                          navigate(
                            `/installments/member/${installment.loan_id}`,
                          )
                        }
                      >
                        <Eye size={15} />
                        View Passbook
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No installment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* All Transactions */}
      <section className="passbook-section">
        <div className="section-title">
          <BookOpen size={20} />
          <h2>All Transactions</h2>
        </div>

        <div className="passbook-table-wrapper">
          <table className="passbook-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <tr key={transaction.id || index}>
                    <td>{transaction.date}</td>

                    <td>
                      <span className="transaction-badge">
                        {transaction.type}
                      </span>
                    </td>

                    <td>{transaction.description}</td>

                    <td className="debit-amount">
                      {transaction.debit
                        ? `- ${formatAmount(transaction.debit)}`
                        : "-"}
                    </td>

                    <td className="credit-amount">
                      {transaction.credit
                        ? `+ ${formatAmount(transaction.credit)}`
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-table">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default MemberPassbookPage;
