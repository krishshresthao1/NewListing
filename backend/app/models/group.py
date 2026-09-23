from datetime import datetime, timezone

from bson import ObjectId


def group_helper(group):
    return {
        "id": str(group["_id"]),
        "name": group["name"],
        "description": group.get("description"),
        "created_at": group.get("created_at"),
    }


def create_group_document(data):
    return {
        "_id": ObjectId(),
        "name": data["name"],
        "description": data.get("description"),
        "created_at": datetime.now(timezone.utc),
    }