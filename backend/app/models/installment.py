from datetime import datetime, timezone

from bson import ObjectId


def installment_helper(installment):

    return {
        "id": str(installment["_id"]),

        "loan_id": str(installment["loan_id"]),

        "member_id": str(installment["member_id"]),

        "group_id": str(installment["group_id"]),

        "subgroup_id": (
            str(installment["subgroup_id"])
            if installment.get("subgroup_id")
            else None
        ),

        "principal_amount": installment["principal_amount"],

        "interest_amount": installment["interest_amount"],

        "total_amount": installment["total_amount"],

        "remaining_balance": installment["remaining_balance"],

        "installment_date": installment["installment_date"],

        "created_at": installment.get("created_at"),
    }


def create_installment_document(data):

    return {
        "_id": ObjectId(),

        "loan_id": ObjectId(data["loan_id"]),

        "member_id": ObjectId(data["member_id"]),

        "group_id": ObjectId(data["group_id"]),

        "subgroup_id": (
            ObjectId(data["subgroup_id"])
            if data.get("subgroup_id")
            else None
        ),

        "principal_amount": data["principal_amount"],

        "interest_amount": data["interest_amount"],

        "total_amount": data["total_amount"],

        "remaining_balance": data["remaining_balance"],

        "installment_date": data["installment_date"],

        "created_at": datetime.now(timezone.utc),
    }