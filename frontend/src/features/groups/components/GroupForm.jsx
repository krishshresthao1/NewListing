import { useState } from "react";
import { createGroup } from "../services/groupService";

function GroupForm({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const newGroup = await createGroup({
        name: name.trim(),
        description: description.trim() || null,
      });

      onCreated(newGroup);
      onClose();
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.detail || "Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group-modal-overlay">
      <div className="group-modal">
        <div className="group-modal-header">
          <div>
            <h2>Create Group</h2>
            <p>Create a new savings group.</p>
          </div>

          <button type="button" className="group-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="group-form-field">
            <label>Group Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <div className="group-form-field">
            <label>Description</label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              rows={4}
            />
          </div>

          {error && <p className="group-form-error">{error}</p>}

          <div className="group-form-actions">
            <button
              type="button"
              className="group-cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="group-create-button"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GroupForm;
