import { useEffect, useState } from "react";
import { createSubgroup } from "../services/subgroupService";
import { getGroups } from "../../groups/services/groupService";

function SubgroupForm({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState("");

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load groups.");
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupId) {
      setError("Please select a group.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const newSubgroup = await createSubgroup({
        name,
        description: description || null,
        group_id: groupId,
      });

      onCreated(newSubgroup);
      onClose();
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.detail || "Failed to create subgroup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <h2>Add Subgroup</h2>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group</label>

            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
              disabled={loadingGroups}
            >
              <option value="">
                {loadingGroups ? "Loading groups..." : "Select a group"}
              </option>

              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Subgroup Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter subgroup name"
              required
              minLength={2}
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>

            <button type="submit" disabled={loading || loadingGroups}>
              {loading ? "Creating..." : "Create Subgroup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubgroupForm;
