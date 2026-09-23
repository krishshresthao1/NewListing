from datetime import datetime, timezone

from bson import ObjectId


def saving_helper(saving):
    return {
        "id": str(saving["_id"]),
        "member_id": str(saving["member_id"]),
        "group_id": str(saving["group_id"]),
        "subgroup_id": str(saving["subgroup_id"]) if saving.get("subgroup_id") else None,
        "amount": saving["amount"],
        "date": saving["date"],
        "month": saving["month"],
        "year": saving["year"],
        "created_at": saving.get("created_at"),
    }


def create_saving_document(data):
    return {
        "_id": ObjectId(),
        "member_id": ObjectId(data["member_id"]),
        "group_id": ObjectId(data["group_id"]),
        "subgroup_id": (
            ObjectId(data["subgroup_id"])
            if data.get("subgroup_id")
            else None
        ),
        "amount": data["amount"],
        "date": data["date"],
        "month": data["month"],
        "year": data["year"],
        "created_at": datetime.now(timezone.utc),
    }