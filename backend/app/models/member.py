from datetime import datetime, timezone

from bson import ObjectId


def member_helper(member, current_balance=None):

    return {
        "id": str(member["_id"]),

        "name": member["name"],

        "phone": member.get("phone"),

        "address": member.get("address"),

        "account_no": member["account_no"],

        "opening_balance": member["opening_balance"],

        "current_balance": (
            current_balance
            if current_balance is not None
            else member["opening_balance"]
        ),

        "status": member["status"],

        "subgroup_id": (
            str(member["subgroup_id"])
            if member.get("subgroup_id")
            else None
        ),

        "created_at": member.get("created_at"),
    }


def create_member_document(data):

    return {
        "_id": ObjectId(),

        "name": data["name"],

        "phone": data.get("phone"),

        "address": data.get("address"),

        "account_no": data["account_no"],

        "opening_balance": data["opening_balance"],

        "status": "active",

        "subgroup_id": (
            ObjectId(data["subgroup_id"])
            if data.get("subgroup_id")
            else None
        ),

        "created_at": datetime.now(
            timezone.utc
        ),
    }