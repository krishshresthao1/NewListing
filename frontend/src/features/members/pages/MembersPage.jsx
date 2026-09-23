import { Plus, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMembers } from "../services/memberService";
import "./MembersPage.css";

import { getAllSubgroups } from "../../subgroups/services/subgroupService";

function MemberPage() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subgroups, setSubgroups] = useState([]);
  const { subgroupId } = useParams();

  

  useEffect(() => {
    loadMembers();
  }, [subgroupId]);

 const loadMembers = async () => {
   try {
     setLoading(true);
     setError("");

     const [membersData, subgroupsData] = await Promise.all([
       getMembers(),
       getAllSubgroups(),
     ]);

     const filteredMembers = subgroupId
       ? membersData.filter((member) => member.subgroup_id === subgroupId)
       : membersData;

     setMembers(filteredMembers);
     setSubgroups(subgroupsData);
   } catch (error) {
     console.error(error);
     setError("Failed to load members.");
   } finally {
     setLoading(false);
   }
 };

  return (
    <div className="members-page">
      <div className="members-header">
        <div className="members-summary">
          <div className="member-count-card">
            <div className="member-count-icon">
              <Users size={20} />
            </div>

            <div>
              <span>Total Members</span>
              <strong>{members.length}</strong>
            </div>
          </div>
        </div>

        <button
          className="add-member-btn"
          onClick={() => navigate("/members/add")}
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      <div className="members-card">
        <div className="members-toolbar">
          <div className="member-search">
            <Search size={18} />

            <input type="text" placeholder="Search members..." />
          </div>

          <select className="member-status-filter">
            <option value="all">All Members</option>
            <option value="active">Active</option>
            <option value="left">Left</option>
          </select>
        </div>

        <div className="members-table-wrapper">
          <table className="members-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Phone</th>
                <th>Account No.</th>
                <th>Subgroup</th>
                <th>Opening Balance</th>
                <th>Current Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8">Loading members...</td>
                </tr>
              )}

              {error && !loading && (
                <tr>
                  <td colSpan="8">{error}</td>
                </tr>
              )}

              {!loading && !error && members.length === 0 && (
                <tr className="empty-members-row">
                  <td colSpan="8">
                    <div className="empty-members">
                      <div className="empty-members-icon">
                        <Users size={24} />
                      </div>

                      <h3>No members yet</h3>

                      <p>
                        Add your first member to start managing the community.
                      </p>

                      <button
                        className="empty-add-btn"
                        onClick={() => navigate("/members/add")}
                      >
                        <Plus size={17} />
                        Add Member
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                members.map((member) => {
                  const subgroup = subgroups.find(
                    (subgroup) => subgroup.id === member.subgroup_id,
                  );

                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="member-name">
                          <strong>{member.name}</strong>
                        </div>
                      </td>

                      <td>{member.phone || "—"}</td>

                      <td>{member.account_no}</td>

                      <td>{subgroup?.name || "—"}</td>

                      <td>Rs. {member.opening_balance}</td>

                      <td>Rs. {member.current_balance}</td>

                      <td>
                        <span className={`status-badge ${member.status}`}>
                          {member.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="member-action-btn"
                          onClick={() =>
                            navigate(`/members/${member.id}/passbook`)
                          }
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MemberPage;
