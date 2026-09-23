function GroupCard({ group, onClick }) {
  return (
    <div onClick={() => onClick(group)} className="group-card">
      <div>
        <h3>{group.name}</h3>

        {group.description && <p>{group.description}</p>}
      </div>

      <span>→</span>
    </div>
  );
}

export default GroupCard;
