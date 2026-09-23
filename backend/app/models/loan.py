from datetime import datetime, timezone
from bson import ObjectId


def loan_helper(loan):
    return {
        "id": str(loan["_id"]),
        "member_id": str(loan["member_id"]),
        "group_id": str(loan["group_id"]),

        "subgroup_id": (
            str(loan["subgroup_id"])
            if loan.get("subgroup_id")
            else None
        ),

        "principal_amount": loan["principal_amount"],
        "principal_balance": loan["principal_balance"],

        "interest_rate": loan["interest_rate"],

        "total_interest_charged": loan.get(
            "total_interest_charged",
            0
        ),

        "service_charge": loan.get(
            "service_charge",
            0
        ),

        "loan_date": loan["loan_date"],
        "status": loan["status"],

        "loan_history": loan.get(
            "loan_history",
            []
        ),

        "created_at": loan.get("created_at"),
        "updated_at": loan.get("updated_at"),
    }


def create_loan_document(data):
    now = datetime.now(timezone.utc)

    initial_history = {
        "type": "loan_taken",
        "amount": data["principal_amount"],
        "interest_rate": data["interest_rate"],
        "service_charge": data["service_charge"],
        "loan_date": data["loan_date"],
        "created_at": now,
    }

    return {
        "_id": ObjectId(),

        "member_id": ObjectId(
            data["member_id"]
        ),

        "group_id": ObjectId(
            data["group_id"]
        ),

        "subgroup_id": (
            ObjectId(data["subgroup_id"])
            if data.get("subgroup_id")
            else None
        ),

        "principal_amount": data[
            "principal_amount"
        ],

        "principal_balance": data[
            "principal_amount"
        ],

        "interest_rate": data[
            "interest_rate"
        ],

        "total_interest_charged": 0,

        "service_charge": data[
            "service_charge"
        ],

        "loan_date": data["loan_date"],

        "status": "active",

        "loan_history": [
            initial_history
        ],

        "created_at": now,
        "updated_at": now,
    }