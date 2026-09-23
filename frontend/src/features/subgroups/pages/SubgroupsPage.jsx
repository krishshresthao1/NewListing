import { Eye, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getAllSubgroups,
  getSubgroupsByGroup,
} from "../services/subgroupService";

import SubgroupForm from "../components/SubgroupForm";

import { getMembers } from "../../members/services/memberService";

import "./SubgroupsPage.css";

function SubgroupsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [subgroups, setSubgroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadSubgroups();
  }, [groupId]);

 const loadSubgroups = async () => {
   try {
     setLoading(true);
     setError("");

     const [subgroupsData, membersData] = await Promise.all([
       groupId ? getSubgroupsByGroup(groupId) : getAllSubgroups(),
       getMembers(),
     ]);

     setSubgroups(subgroupsData);
     setMembers(membersData);
   } catch (error) {
     console.error(error);
     setError("Failed to load subgroups.");
   } finally {
     setLoading(false);
   }
 };

  const handleViewMembers = (subgroup) => {
    navigate(`/subgroups/${subgroup.id}/members`);
  };

  return (
    <div className="subgroups-page">
      {/* Header */}
      <div className="subgroups-header">
        <div>
          {groupId && (
            <button className="back-button" onClick={() => navigate("/groups")}>
              ← Back to Groups
            </button>
          )}

        </div>

        <button className="add-subgroup-btn" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Add Subgroup
        </button>
      </div>

      {/* Table */}
      <div className="subgroups-card">
        <div className="subgroups-table-wrapper">
          <table className="subgroups-table">
            <thead>
              <tr>
                <th>Subgroup</th>
                <th>Group</th>
                <th>Description</th>
                <th>Members</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="table-message">
                    Loading subgroups...
                  </td>
                </tr>
              )}

              {error && !loading && (
                <tr>
                  <td colSpan="5" className="table-message error">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && subgroups.length === 0 && (
                <tr>
                  <td colSpan="5" className="table-message">
                    <div className="empty-subgroups">
                      <Users size={28} />

                      <h3>No subgroups yet</h3>

                      <p>
                        Create your first subgroup to organize your members.
                      </p>

                      <button
                        className="empty-add-subgroup-btn"
                        onClick={() => setShowForm(true)}
                      >
                        <Plus size={17} />
                        Add Subgroup
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                subgroups.map((subgroup) => (
                  <tr key={subgroup.id}>
                    <td>
                      <div className="subgroup-name-cell">
                        <strong>{subgroup.name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="subgroup-group">
                        {subgroup.group_name || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="subgroup-description">
                        {subgroup.description || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="member-count">
                        {
                          members.filter(
                            (member) => member.subgroup_id === subgroup.id,
                          ).length
                        }
                      </span>
                    </td>

                    <td>
                      <button
                        className="subgroup-action-btn"
                        onClick={() => handleViewMembers(subgroup)}
                      >
                        <Eye size={15} />
                        View Members
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subgroup Modal */}
      {showForm && (
        <SubgroupForm
          groupId={groupId}
          onClose={() => setShowForm(false)}
          onCreated={(newSubgroup) => {
            setSubgroups((currentSubgroups) => [
              newSubgroup,
              ...currentSubgroups,
            ]);
          }}
        />
      )}
    </div>
  );
}

export default SubgroupsPage;
