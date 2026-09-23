function SubgroupCard({ subgroup, onClick }) {
  return (
    <div className="subgroup-card" onClick={() => onClick?.(subgroup)}>
      <div>
        <h3>{subgroup.name}</h3>

        {subgroup.group_name && (
          <span className="subgroup-group-name">{subgroup.group_name}</span>
        )}

        {subgroup.description && <p>{subgroup.description}</p>}
      </div>

      <span>→</span>
    </div>
  );
}

export default SubgroupCard;
