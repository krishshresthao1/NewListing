import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { toast } from "react-toastify";

import { getInstallmentDashboard } from "../services/installmentService";

import "./InstallmentPage.css";

function InstallmentPage() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const data = await getInstallmentDashboard();

      setDashboard(data);
    } catch (error) {
      toast.error(error.message || "Failed to load installments");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="installment-page">
        <div className="installment-loading">Loading installments...</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="installment-page">
        <div className="installment-empty">No installment data available.</div>
      </div>
    );
  }

  return (
    <div className="installment-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="installment-header">
        <div>
          <h1>Installments</h1>

          <p>Track loan installment payments and collections.</p>
        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="installment-summary-grid">
        <div className="installment-summary-card">
          <span>Total Collected</span>

          <h2>Rs. {dashboard.total_amount_collected.toLocaleString()}</h2>
        </div>

        <div className="installment-summary-card">
          <span>Principal Paid</span>

          <h2>Rs. {dashboard.total_principal_paid.toLocaleString()}</h2>
        </div>

        <div className="installment-summary-card">
          <span>Interest Paid</span>

          <h2>Rs. {dashboard.total_interest_paid.toLocaleString()}</h2>
        </div>

        <div className="installment-summary-card">
          <span>Total Installments</span>

          <h2>{dashboard.total_installments.toLocaleString()}</h2>
        </div>
      </div>

      {/* =================================================
          SUBGROUP TABLE
      ================================================= */}

      <div className="installment-table-card">
        <div className="installment-table-header">
          <div>
            <h2>Subgroup Installments</h2>

            <p>View installment collections by subgroup.</p>
          </div>
        </div>

        {dashboard.subgroups.length === 0 ? (
          <div className="installment-empty">No subgroups found.</div>
        ) : (
          <div className="installment-table-wrapper">
            <table className="installment-table">
              <thead>
                <tr>
                  <th>Group</th>

                  <th>Subgroup</th>

                  <th>Principal Paid</th>

                  <th>Interest Paid</th>

                  <th>Total Collected</th>

                  <th>Installments</th>

                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.subgroups.map((subgroup) => (
                  <tr key={subgroup.subgroup_id}>
                    <td>{subgroup.group_name}</td>

                    <td>{subgroup.subgroup_name}</td>

                    <td>Rs. {subgroup.principal_paid.toLocaleString()}</td>

                    <td>Rs. {subgroup.interest_paid.toLocaleString()}</td>

                    <td>Rs. {subgroup.total_collected.toLocaleString()}</td>

                    <td>{subgroup.installment_count}</td>

                    <td>
                      <button
                        className="installment-action-btn"
                        onClick={() =>
                          navigate(
                            `/installments/subgroup/${subgroup.subgroup_id}`,
                          )
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

export default InstallmentPage;
