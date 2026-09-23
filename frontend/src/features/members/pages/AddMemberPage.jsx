import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getGroups } from "../../groups/services/groupService";
import { getAllSubgroups } from "../../subgroups/services/subgroupService";
import { createMember } from "../services/memberService";

import "./AddMemberPage.css";

function AddMemberPage() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [subgroups, setSubgroups] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedSubgroupId, setSelectedSubgroupId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGroupsAndSubgroups();
  }, []);

  const loadGroupsAndSubgroups = async () => {
    try {
      setLoading(true);
      setError("");

      const [groupsData, subgroupsData] = await Promise.all([
        getGroups(),
        getAllSubgroups(),
      ]);

      setGroups(groupsData);
      setSubgroups(subgroupsData);
    } catch (error) {
      console.error(error);
      setError("Failed to load groups and subgroups.");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (e) => {
    const groupId = e.target.value;

    setSelectedGroupId(groupId);

    // Reset subgroup whenever group changes
    setSelectedSubgroupId("");
  };

  const filteredSubgroups = subgroups.filter(
    (subgroup) => subgroup.group_id === selectedGroupId,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!selectedGroupId) {
        setError("Please select a group.");
        return;
      }

      if (!selectedSubgroupId) {
        setError("Please select a subgroup.");
        return;
      }

      const newMember = await createMember({
        name,
        phone: phone || null,
        address: address || null,
        account_no: accountNo,
        opening_balance: Number(openingBalance),
        subgroup_id: selectedSubgroupId,
      });

      console.log("Member created:", newMember);

      navigate("/members");
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.detail || "Failed to create member.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-member-page">
      {/* Page Header */}
      <div className="add-member-header">
        <div>
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/members")}
          >
            <ArrowLeft size={17} />
            Back to Members
          </button>

          <h1>Add Member</h1>

          <p>Add a new member to your Kachuli community.</p>
        </div>
      </div>

      {/* Error */}
      {error && <p className="form-error">{error}</p>}

      {/* Form */}
      <form className="member-form" onSubmit={handleSubmit}>
        {/* Group Information */}
        <section className="member-form-section">
          <div className="form-section-header">
            <h2>Group Information</h2>
            <p>Assign the member to their subgroup.</p>
          </div>

          <div className="form-grid">
            {/* Group */}
            <div className="form-group">
              <label htmlFor="group">
                Group <span>*</span>
              </label>

              <select
                id="group"
                value={selectedGroupId}
                onChange={handleGroupChange}
                required
                disabled={loading}
              >
                <option value="" disabled>
                  {loading ? "Loading groups..." : "Select group"}
                </option>

                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>

              <small>Select the group this member belongs to.</small>
            </div>

            {/* Subgroup */}
            <div className="form-group">
              <label htmlFor="subgroup">
                Subgroup <span>*</span>
              </label>

              <select
                id="subgroup"
                value={selectedSubgroupId}
                onChange={(e) => setSelectedSubgroupId(e.target.value)}
                required
                disabled={!selectedGroupId || loading}
              >
                <option value="" disabled>
                  {!selectedGroupId
                    ? "Select a group first"
                    : filteredSubgroups.length === 0
                      ? "No subgroups available"
                      : "Select subgroup"}
                </option>

                {filteredSubgroups.map((subgroup) => (
                  <option key={subgroup.id} value={subgroup.id}>
                    {subgroup.name}
                  </option>
                ))}
              </select>

              <small>The member will belong to this subgroup.</small>
            </div>
          </div>
        </section>
        {/* Basic Information */}
        <section className="member-form-section">
          <div className="form-section-header">
            <h2>Basic Information</h2>
            <p>Enter the member's personal information.</p>
          </div>

          <div className="form-grid">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">
                Name <span>*</span>
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter member name"
                minLength={2}
                required
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone">Phone</label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            {/* Address */}
            <div className="form-group form-group-full">
              <label htmlFor="address">Address</label>

              <textarea
                id="address"
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter member address"
              />
            </div>
          </div>
        </section>

        {/* Account Information */}
        <section className="member-form-section">
          <div className="form-section-header">
            <h2>Account Information</h2>
            <p>Set up the member's financial account.</p>
          </div>

          <div className="form-grid">
            {/* Account Number */}
            <div className="form-group">
              <label htmlFor="accountNo">
                Account No. <span>*</span>
              </label>

              <input
                id="accountNo"
                type="text"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="Enter account number"
                required
              />
            </div>

            {/* Opening Balance */}
            <div className="form-group">
              <label htmlFor="openingBalance">
                Opening Balance <span>*</span>
              </label>

              <div className="input-with-prefix">
                <span>Rs.</span>

                <input
                  id="openingBalance"
                  type="number"
                  min="0"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <small>Initial amount paid when joining the samuha.</small>
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="member-form-actions">
          <button
            type="button"
            className="cancel-member-btn"
            onClick={() => navigate("/members")}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-member-btn"
            disabled={saving || loading}
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Member"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddMemberPage;
