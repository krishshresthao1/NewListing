from datetime import datetime, timezone

from bson import ObjectId


def subgroup_helper(subgroup, group_name=None):
    return {
        "id": str(subgroup["_id"]),
        "name": subgroup["name"],
        "description": subgroup.get("description"),
        "group_id": str(subgroup["group_id"]),
        "group_name": group_name,
        "created_at": subgroup.get("created_at"),
    }


def create_subgroup_document(data):
    return {
        "_id": ObjectId(),
        "name": data["name"],
        "description": data.get("description"),
        "group_id": ObjectId(data["group_id"]),
        "created_at": datetime.now(timezone.utc),
    }
