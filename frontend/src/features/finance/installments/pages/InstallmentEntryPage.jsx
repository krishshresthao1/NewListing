import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-toastify";

import { getGroups } from "../../../groups/services/groupService";
import { getAllSubgroups } from "../../../subgroups/services/subgroupService";
import { getMembers } from "../../../members/services/memberService";

import { createInstallment } from "../services/installmentService";

import "./InstallmentEntryPage.css";

function InstallmentEntryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const loanIdFromUrl = searchParams.get("loanId");

  const [groups, setGroups] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [members, setMembers] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubgroup, setSelectedSubgroup] = useState("");
  const [selectedMember, setSelectedMember] = useState("");

  const [loanId, setLoanId] = useState(loanIdFromUrl || "");

  const [principalAmount, setPrincipalAmount] = useState("");

  const [installmentDate, setInstallmentDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  /* --------------------------------------------------
     Load Groups, Subgroups and Members
  -------------------------------------------------- */

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);

      const [groupsData, subgroupsData, membersData] = await Promise.all([
        getGroups(),
        getAllSubgroups(),
        getMembers(),
      ]);

      setGroups(groupsData || []);
      setSubgroups(subgroupsData || []);
      setMembers(membersData || []);
    } catch (error) {
      console.error("Failed to load installment entry data:", error);

      toast.error(error.message || "Failed to load installment entry data");
    } finally {
      setLoadingData(false);
    }
  };

  /* --------------------------------------------------
     Automatically identify member/group/subgroup
     when opened from Passbook
  -------------------------------------------------- */

  useEffect(() => {
    if (
      !loanIdFromUrl ||
      !members.length ||
      !subgroups.length ||
      !groups.length
    ) {
      return;
    }

    /*
      The loanId itself isn't stored in members.

      We therefore cannot determine the member from
      loanId using only these three endpoints.

      The selectors remain available for manual
      selection, while the loanId from the passbook
      remains the actual loan being updated.
    */
  }, [loanIdFromUrl, members, subgroups, groups]);

  /* --------------------------------------------------
     Group change
  -------------------------------------------------- */

  const handleGroupChange = (e) => {
    const groupId = e.target.value;

    setSelectedGroup(groupId);
    setSelectedSubgroup("");
    setSelectedMember("");
  };

  /* --------------------------------------------------
     Subgroup change
  -------------------------------------------------- */

  const handleSubgroupChange = (e) => {
    const subgroupId = e.target.value;

    setSelectedSubgroup(subgroupId);
    setSelectedMember("");
  };

  /* --------------------------------------------------
     Member change
  -------------------------------------------------- */

  const handleMemberChange = (e) => {
    const memberId = e.target.value;

    setSelectedMember(memberId);
  };

  /* --------------------------------------------------
     Filter subgroups
  -------------------------------------------------- */

  const filteredSubgroups = subgroups.filter(
    (subgroup) => String(subgroup.group_id) === String(selectedGroup),
  );

  /* --------------------------------------------------
     Filter members
  -------------------------------------------------- */

  const filteredMembers = members.filter(
    (member) => String(member.subgroup_id) === String(selectedSubgroup),
  );

  /* --------------------------------------------------
     Submit
  -------------------------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loanId) {
      toast.error(
        "Loan ID is missing. Please open installment entry from a loan.",
      );
      return;
    }

    if (!selectedGroup) {
      toast.error("Please select a group.");
      return;
    }

    if (!selectedSubgroup) {
      toast.error("Please select a subgroup.");
      return;
    }

    if (!selectedMember) {
      toast.error("Please select a member.");
      return;
    }

    if (!principalAmount) {
      toast.error("Please enter the principal payment amount.");
      return;
    }

    if (Number(principalAmount) <= 0) {
      toast.error("Principal payment must be greater than 0.");
      return;
    }

    if (!installmentDate) {
      toast.error("Please select the installment date.");
      return;
    }

    try {
      setLoading(true);

      await createInstallment({
        loan_id: loanId,
        principal_amount: Number(principalAmount),
        installment_date: installmentDate,
      });

      toast.success("Installment recorded successfully.");

      navigate(`/installments/member/${loanId}`);
    } catch (error) {
      console.error("Create installment error:", error);

      toast.error(error.message || "Failed to record installment");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------
     Loading
  -------------------------------------------------- */

  if (loadingData) {
    return (
      <div className="installment-entry-page">
        <div className="installment-entry-loading">
          Loading installment entry...
        </div>
      </div>
    );
  }

  return (
    <div className="installment-entry-page">
      {/* Header */}

      <div className="entry-header">
        <div className="entry-header-content">
          <h1>Installment Entry</h1>

          <p>Record a principal payment for a loan.</p>
        </div>

        <button
          className="installment-entry-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          Back
        </button>
      </div>

      {/* Form */}

      <div className="installment-entry-card">
        <form onSubmit={handleSubmit} className="installment-entry-form">
          {/* Group */}

          <div className="entry-form-group">
            <label>Group</label>

            <select value={selectedGroup} onChange={handleGroupChange}>
              <option value="">Select Group</option>

              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subgroup */}

          <div className="entry-form-group">
            <label>Subgroup</label>

            <select
              value={selectedSubgroup}
              onChange={handleSubgroupChange}
              disabled={!selectedGroup}
            >
              <option value="">Select Subgroup</option>

              {filteredSubgroups.map((subgroup) => (
                <option key={subgroup.id} value={subgroup.id}>
                  {subgroup.name}
                </option>
              ))}
            </select>
          </div>

          {/* Member */}

          <div className="entry-form-group">
            <label>Member</label>

            <select
              value={selectedMember}
              onChange={handleMemberChange}
              disabled={!selectedSubgroup}
            >
              <option value="">Select Member</option>

              {filteredMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                  {member.account_no ? ` - ${member.account_no}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Principal */}

          <div className="entry-form-group">
            <label>Principal Payment</label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              placeholder="Enter principal amount"
            />

            <small>
              Interest will be calculated automatically based on the remaining
              loan balance.
            </small>
          </div>

          {/* Date */}

          <div className="entry-form-group">
            <label>Installment Date</label>

            <input
              type="date"
              value={installmentDate}
              onChange={(e) => setInstallmentDate(e.target.value)}
            />
          </div>

          {/* Loan Reference */}

          {loanId && (
            <div className="loan-reference">
              <span>Loan Reference</span>

              <strong>{loanId}</strong>
            </div>
          )}

          {/* Actions */}

          <div className="entry-form-actions">
            <button
              type="button"
              className="installment-entry-cancel-btn"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="installment-entry-save-btn"
              disabled={loading}
            >
              <Save size={17} />

              {loading ? "Saving..." : "Save Installment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InstallmentEntryPage;
