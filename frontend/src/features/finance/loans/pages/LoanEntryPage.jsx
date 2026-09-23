import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { getGroups } from "../../../groups/services/groupService";
import { getAllSubgroups } from "../../../subgroups/services/subgroupService";
import { getMembers } from "../../../members/services/memberService";

import { createLoan } from "../services/loanService";

import "./LoanEntryPage.css";

function LoanEntryPage() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [members, setMembers] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubgroup, setSelectedSubgroup] = useState("");
  const [selectedMember, setSelectedMember] = useState("");

  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("1");
  const [serviceCharge, setServiceCharge] = useState("0");

  const [loanDate, setLoanDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [groupsData, subgroupsData, membersData] = await Promise.all([
        getGroups(),
        getAllSubgroups(),
        getMembers(),
      ]);

      setGroups(groupsData);
      setSubgroups(subgroupsData);
      setMembers(membersData);
    } catch (error) {
      console.error(error);
      setError("Failed to load loan entry data.");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (e) => {
    const groupId = e.target.value;

    setSelectedGroup(groupId);
    setSelectedSubgroup("");
    setSelectedMember("");
  };

  const handleSubgroupChange = (e) => {
    const subgroupId = e.target.value;

    setSelectedSubgroup(subgroupId);
    setSelectedMember("");
  };

  const filteredSubgroups = subgroups.filter(
    (subgroup) => subgroup.group_id === selectedGroup,
  );

  const filteredMembers = members.filter(
    (member) => member.subgroup_id === selectedSubgroup,
  );

  const monthlyInterest =
    Number(loanAmount || 0) * (Number(interestRate || 0) / 100);

  const handleSubmit = async () => {
    setError("");

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

    if (!loanAmount || Number(loanAmount) <= 0) {
      toast.error("Please enter a valid loan amount.");
      return;
    }

    if (Number(interestRate) < 0) {
      toast.error("Interest rate cannot be negative.");
      return;
    }

    if (Number(serviceCharge) < 0) {
      toast.error("Service charge cannot be negative.");
      return;
    }

    if (!loanDate) {
      toast.error("Please select a loan date.");
      return;
    }

    try {
      setSaving(true);

      const loanData = {
        member_id: selectedMember,
        group_id: selectedGroup,
        subgroup_id: selectedSubgroup,
        principal_amount: Number(loanAmount),
        interest_rate: Number(interestRate),
        service_charge: Number(serviceCharge),
        loan_date: loanDate,
      };

      await createLoan(loanData);

      toast.success("Loan given successfully!");

      setTimeout(() => {
        navigate("/loans");
      }, 800);
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Failed to give loan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loan-entry-page">
        <div className="loan-details-loading">Loading loan entry...</div>
      </div>
    );
  }

  return (
    <div className="loan-entry-page">
      <div className="loan-entry-header">
        <div>
          <h1>Give New Loan</h1>
          <p>Enter the loan details for a member.</p>
        </div>

        <button
          className="loan-entry-back-button"
          onClick={() => navigate("/loans")}
        >
          ← Back to Loans
        </button>
      </div>

      {error && <div className="loan-entry-error">{error}</div>}

      <div className="loan-entry-card">
        <div className="loan-entry-section">
          <h2>Loan Information</h2>

          <p>
            Select the group, subgroup and member, then enter the loan details.
          </p>
        </div>

        <div className="loan-entry-form">
          <div className="loan-entry-field">
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

          <div className="loan-entry-field">
            <label>Subgroup</label>

            <select
              value={selectedSubgroup}
              onChange={handleSubgroupChange}
              disabled={!selectedGroup}
            >
              <option value="">
                {selectedGroup ? "Select Subgroup" : "Select Group First"}
              </option>

              {filteredSubgroups.map((subgroup) => (
                <option key={subgroup.id} value={subgroup.id}>
                  {subgroup.name}
                </option>
              ))}
            </select>
          </div>

          <div className="loan-entry-field">
            <label>Member</label>

            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              disabled={!selectedSubgroup}
            >
              <option value="">
                {selectedSubgroup ? "Select Member" : "Select Subgroup First"}
              </option>

              {filteredMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.account_no}
                </option>
              ))}
            </select>
          </div>

          <div className="loan-entry-field">
            <label>Loan Amount</label>

            <input
              type="number"
              min="0"
              placeholder="Enter loan amount"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
            />
          </div>

          <div className="loan-entry-field">
            <label>Interest Rate (%)</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>

          <div className="loan-entry-field">
            <label>Service Charge</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={serviceCharge}
              onChange={(e) => setServiceCharge(e.target.value)}
            />
          </div>

          <div className="loan-entry-field">
            <label>Loan Date</label>

            <input
              type="date"
              value={loanDate}
              onChange={(e) => setLoanDate(e.target.value)}
            />
          </div>
        </div>

        <div className="loan-entry-preview">
          <h2>Loan Preview</h2>

          <div className="loan-preview-row">
            <span>Loan Amount</span>

            <strong>
              Rs. {Number(loanAmount || 0).toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="loan-preview-row">
            <span>Interest Rate</span>

            <strong>{interestRate || 0}%</strong>
          </div>

          <div className="loan-preview-row">
            <span>Monthly Interest</span>

            <strong>Rs. {monthlyInterest.toLocaleString("en-IN")}</strong>
          </div>

          <div className="loan-preview-row">
            <span>Service Charge</span>

            <strong>
              Rs. {Number(serviceCharge || 0).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="loan-entry-actions">
          <button
            className="loan-entry-cancel-button"
            onClick={() => navigate("/loans")}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="loan-entry-save-button"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Giving Loan..." : "Give Loan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoanEntryPage;
