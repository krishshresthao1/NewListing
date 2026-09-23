import { Plus, Users, FolderTree } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getGroups } from "../services/groupService";
import { getAllSubgroups } from "../../subgroups/services/subgroupService";

import GroupForm from "../components/GroupForm";
import "./GroupsPage.css";

function GroupsPage() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
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
      setError("Failed to load groups.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="groups-page">
      <div className="groups-header">
        <button className="add-group-btn" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Add Group
        </button>
      </div>

      <div className="groups-card">
        <div className="groups-table-wrapper">
          <table className="groups-table">
            <thead>
              <tr>
                <th>Group</th>
                <th>Description</th>
                <th>Subgroups</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="table-message">
                    Loading groups...
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

              {!loading && !error && groups.length === 0 && (
                <tr>
                  <td colSpan="5" className="table-message">
                    <div className="empty-groups">
                      <FolderTree size={32} />

                      <h3>No groups yet</h3>

                      <p>
                        Create your first group to start organizing your
                        community.
                      </p>

                      <button
                        className="add-group-btn"
                        onClick={() => setShowForm(true)}
                      >
                        <Plus size={17} />
                        Add Group
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                groups.map((group) => {
                  const groupSubgroups = subgroups.filter(
                    (subgroup) => subgroup.group_id === group.id,
                  );

                  return (
                    <tr key={group.id}>
                      <td>
                        <div className="group-name-cell">
                          <strong>{group.name}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="group-description">
                          {group.description || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="subgroup-count">
                          {groupSubgroups.length}
                        </span>
                      </td>

                      <td>
                        {group.created_at
                          ? new Date(group.created_at).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <button
                          className="group-action-btn"
                          onClick={() => navigate(`/groups/${group.id}/subgroups`)}
                        >
                          <Users size={16} />
                          View Subgroups
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <GroupForm
          onClose={() => setShowForm(false)}
          onCreated={(newGroup) => {
            setGroups((currentGroups) => [newGroup, ...currentGroups]);
          }}
        />
      )}
    </div>
  );
}

export default GroupsPage;
