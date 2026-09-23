import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SavingsEntryPage.css";

function SavingsEntryPage() {
  const navigate = useNavigate();

  const API_URL = "http://127.0.0.1:8000";

  const [groups, setGroups] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [members, setMembers] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubgroup, setSelectedSubgroup] = useState("");

  const [savingDate, setSavingDate] = useState("");

  const [commonAmount, setCommonAmount] = useState("");
  const [savingAmounts, setSavingAmounts] = useState({});

  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingSubgroups, setLoadingSubgroups] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load groups when page opens
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      setError("");

      const response = await fetch(`${API_URL}/groups/`);

      if (!response.ok) {
        throw new Error("Failed to load groups");
      }

      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load groups.");
    } finally {
      setLoadingGroups(false);
    }
  };

  // Load subgroups whenever group changes
  const handleGroupChange = async (groupId) => {
    setSelectedGroup(groupId);

    setSelectedSubgroup("");
    setSubgroups([]);
    setMembers([]);
    setSavingAmounts({});
    setCommonAmount("");

    if (!groupId) {
      return;
    }

    try {
      setLoadingSubgroups(true);
      setError("");

      const response = await fetch(`${API_URL}/subgroups/group/${groupId}`);

      if (!response.ok) {
        throw new Error("Failed to load subgroups");
      }

      const data = await response.json();
      setSubgroups(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load subgroups.");
    } finally {
      setLoadingSubgroups(false);
    }
  };

  // Load members whenever subgroup changes
  const handleSubgroupChange = async (subgroupId) => {
    setSelectedSubgroup(subgroupId);

    setMembers([]);
    setSavingAmounts({});
    setCommonAmount("");

    if (!subgroupId) {
      return;
    }

    try {
      setLoadingMembers(true);
      setError("");

      const response = await fetch(`${API_URL}/members/`);

      if (!response.ok) {
        throw new Error("Failed to load members");
      }

      const data = await response.json();

      const subgroupMembers = data
        .filter(
          (member) =>
            member.subgroup_id === subgroupId && member.status === "active",
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      setMembers(subgroupMembers);

      // Start all members with empty saving amount
      const initialAmounts = {};

      subgroupMembers.forEach((member) => {
        initialAmounts[member.id] = "";
      });

      setSavingAmounts(initialAmounts);
    } catch (error) {
      console.error(error);
      setError("Unable to load members.");
    } finally {
      setLoadingMembers(false);
    }
  };

  // Apply common amount to every member
  const handleApplyToAll = () => {
    if (commonAmount === "") {
      return;
    }

    const updatedAmounts = {};

    members.forEach((member) => {
      updatedAmounts[member.id] = commonAmount;
    });

    setSavingAmounts(updatedAmounts);
  };

  // Change one member's amount
  const handleAmountChange = (memberId, value) => {
    setSavingAmounts((previous) => ({
      ...previous,
      [memberId]: value,
    }));
  };

  // Calculate total
  const totalSaving = members.reduce((total, member) => {
    const amount = Number(savingAmounts[member.id]) || 0;
    return total + amount;
  }, 0);

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-IN").format(amount || 0);

  // Save savings
  const handleSaveSavings = async () => {
    setError("");
    setSuccess("");

    if (!selectedGroup) {
      setError("Please select a group.");
      return;
    }

    if (!selectedSubgroup) {
      setError("Please select a subgroup.");
      return;
    }

    if (!savingDate) {
      setError("Please select the saving date.");
      return;
    }

    if (members.length === 0) {
      setError("No active members found.");
      return;
    }

    const hasEmptyAmount = members.some(
      (member) =>
        savingAmounts[member.id] === "" ||
        savingAmounts[member.id] === undefined,
    );

    if (hasEmptyAmount) {
      setError("Please enter saving amount for every member.");
      return;
    }

    const hasInvalidAmount = members.some(
      (member) =>
        Number(savingAmounts[member.id]) < 0 ||
        Number.isNaN(Number(savingAmounts[member.id])),
    );

    if (hasInvalidAmount) {
      setError("Saving amount cannot be negative.");
      return;
    }

    const [year, month, day] = savingDate.split("-");

    try {
      setSaving(true);

      /*
       * The backend bulk endpoint currently accepts
       * one common amount for the whole subgroup.
       *
       * So if every member has the same amount,
       * we can use the bulk endpoint directly.
       */

      const amounts = members.map((member) => Number(savingAmounts[member.id]));

      const allSameAmount = amounts.every((amount) => amount === amounts[0]);

      if (!allSameAmount) {
        setError(
          "Different individual amounts are not supported yet. Please use the same amount for all members.",
        );
        setSaving(false);
        return;
      }

      const response = await fetch(`${API_URL}/savings/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subgroup_id: selectedSubgroup,
          amount: amounts[0],
          date: savingDate,
          month: Number(month),
          year: Number(year),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save savings");
      }

      setSuccess(
        `Savings saved successfully. Total: Rs. ${formatAmount(
          data.total_amount,
        )}`,
      );

      // Clear form after successful entry
      setSavingAmounts((previous) => {
        const cleared = {};

        members.forEach((member) => {
          cleared[member.id] = "";
        });

        return cleared;
      });

      setCommonAmount("");

      setTimeout(() => {
        navigate("/savings");
      }, 1200);
    } catch (error) {
      console.error(error);
      setError(error.message || "Unable to save savings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="savings-entry-page">
      {/* Header */}
      <div className="entry-header">
        <div>
          <h1>Savings Entry</h1>

          <p>Enter monthly savings for a subgroup.</p>
        </div>

        <button className="entry-back-btn" onClick={() => navigate("/savings")}>
          ← Back
        </button>
      </div>

      {/* Messages */}
      {error && <div className="entry-error">{error}</div>}

      {success && <div className="entry-success">{success}</div>}

      {/* Selection Card */}
      <div className="entry-card">
        <div className="entry-card-header">
          <div>
            <h2>Entry Information</h2>
            <p>Select the group, subgroup and saving month.</p>
          </div>
        </div>

        <div className="entry-form">
          {/* Group */}
          <div className="form-group">
            <label>
              Group <span>*</span>
            </label>

            <select
              value={selectedGroup}
              onChange={(e) => handleGroupChange(e.target.value)}
              disabled={loadingGroups}
            >
              <option value="">
                {loadingGroups ? "Loading groups..." : "Select Group"}
              </option>

              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subgroup */}
          <div className="form-group">
            <label>
              Subgroup <span>*</span>
            </label>

            <select
              value={selectedSubgroup}
              onChange={(e) => handleSubgroupChange(e.target.value)}
              disabled={!selectedGroup || loadingSubgroups}
            >
              <option value="">
                {loadingSubgroups ? "Loading subgroups..." : "Select Subgroup"}
              </option>

              {subgroups.map((subgroup) => (
                <option key={subgroup.id} value={subgroup.id}>
                  {subgroup.name}
                </option>
              ))}
            </select>
          </div>

          {/* Entry date */}
          <div className="form-group">
            <label>
              Saving Date <span>*</span>
            </label>

            <input
              type="date"
              value={savingDate}
              onChange={(e) => setSavingDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Common Amount */}
      {selectedSubgroup && members.length > 0 && (
        <div className="entry-card">
          <div className="entry-card-header">
            <div>
              <h2>Common Saving Amount</h2>

              <p>Enter one amount and apply it to all members.</p>
            </div>
          </div>

          <div className="common-amount-section">
            <div className="common-amount-input">
              <label>Amount per Member</label>

              <div className="amount-input-wrapper">
                <span>Rs.</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="300"
                  value={commonAmount}
                  onChange={(e) => setCommonAmount(e.target.value)}
                />
              </div>
            </div>

            <button className="apply-all-btn" onClick={handleApplyToAll}>
              Apply to All
            </button>
          </div>
        </div>
      )}

      {/* Members */}
      {selectedSubgroup && (
        <div className="entry-card">
          <div className="entry-card-header">
            <div>
              <h2>Member Savings</h2>

              <p>
                {loadingMembers
                  ? "Loading members..."
                  : `${members.length} active member${
                      members.length !== 1 ? "s" : ""
                    }`}
              </p>
            </div>
          </div>

          {loadingMembers ? (
            <div className="entry-loading">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="entry-empty">
              No active members found in this subgroup.
            </div>
          ) : (
            <>
              <div className="entry-table-wrapper">
                <table className="entry-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Member</th>
                      <th>Account No.</th>
                      <th>Saving Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {members.map((member, index) => (
                      <tr key={member.id}>
                        <td>{index + 1}</td>

                        <td>
                          <strong>{member.name}</strong>
                        </td>

                        <td>{member.account_no}</td>

                        <td>
                          <div className="member-amount-input">
                            <span>Rs.</span>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={savingAmounts[member.id] ?? ""}
                              onChange={(e) =>
                                handleAmountChange(member.id, e.target.value)
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td colSpan="3">
                        <strong>Total Saving</strong>
                      </td>

                      <td>
                        <strong className="entry-total">
                          Rs. {formatAmount(totalSaving)}
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Bottom Actions */}
              <div className="entry-actions">
                <button
                  className="cancel-entry-btn"
                  onClick={() => navigate("/savings")}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="save-savings-btn"
                  onClick={handleSaveSavings}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Savings"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SavingsEntryPage;
