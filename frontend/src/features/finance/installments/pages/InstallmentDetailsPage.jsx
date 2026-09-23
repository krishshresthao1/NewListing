import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

import { getSubgroupInstallmentDetails } from "../services/installmentService";

import "./InstallmentDetailsPage.css";

function InstallmentDetailsPage() {
  const navigate = useNavigate();

  const { subgroupId } = useParams();

  const [details, setDetails] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [subgroupId]);

  const loadDetails = async () => {
    try {
      setLoading(true);

      const data = await getSubgroupInstallmentDetails(subgroupId);

      setDetails(data);
    } catch (error) {
      toast.error(error.message || "Failed to load installment details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="installment-details-page">
        <div className="installment-details-loading">
          Loading installment details...
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="installment-details-page">
        <div className="installment-details-empty">
          Installment details not found.
        </div>
      </div>
    );
  }

  return (
    <div className="installment-details-page">
      {/* =============================================
          HEADER
      ============================================= */}

      <div className="installment-details-header">
        <div>
          <h1>{details.subgroup_name}</h1>

          <p>Group: {details.group_name}</p>
        </div>

        <button className="installment-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back to Installments
        </button>
      </div>

      {/* =============================================
          SUMMARY
      ============================================= */}

      <div className="installment-details-summary">
        <div className="installment-details-card">
          <span>Principal Paid</span>

          <strong>Rs. {details.total_principal_paid.toLocaleString()}</strong>
        </div>

        <div className="installment-details-card">
          <span>Interest Paid</span>

          <strong>Rs. {details.total_interest_paid.toLocaleString()}</strong>
        </div>

        <div className="installment-details-card">
          <span>Total Collected</span>

          <strong>Rs. {details.total_collected.toLocaleString()}</strong>
        </div>
      </div>

      {/* =============================================
          TABLE
      ============================================= */}

      <div className="installment-details-table-card">
        <div className="installment-details-table-header">
          <div>
            <h2>Member Installments</h2>

            <p>View payment details for each member.</p>
          </div>
        </div>

        {details.members.length === 0 ? (
          <div className="installment-details-empty">
            No members with loans found in this subgroup.
          </div>
        ) : (
          <div className="installment-details-table-wrapper">
            <table className="installment-details-table">
              <thead>
                <tr>
                  <th>Member</th>

                  <th>Account No.</th>

                  <th>Original Loan</th>

                  <th>Principal Paid</th>

                  <th>Remaining</th>

                  <th>Interest Paid</th>

                  <th>Status</th>

                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {details.members.map((member) => (
                  <tr key={member.member_id}>
                    <td>{member.member_name}</td>

                    <td>{member.account_no}</td>

                    <td>Rs. {member.original_loan.toLocaleString()}</td>

                    <td>Rs. {member.principal_paid.toLocaleString()}</td>

                    <td>Rs. {member.remaining_balance.toLocaleString()}</td>

                    <td>Rs. {member.interest_paid.toLocaleString()}</td>

                    <td>
                      <span
                        className={`installment-status-badge ${member.status}`}
                      >
                        {member.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="installment-action-btn"
                        onClick={() =>
                          navigate(`/installments/member/${member.loan_id}`)
                        }
                      >
                        <Eye size={16} />
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

export default InstallmentDetailsPage;
