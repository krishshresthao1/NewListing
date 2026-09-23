from fastapi import APIRouter, HTTPException

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.config.connection import db

from app.models.member import (
    create_member_document,
    member_helper
)

from app.schemas.member import (
    MemberCreate,
    MemberResponse
)


router = APIRouter(
    prefix="/members",
    tags=["Members"]
)


members_collection = db["members"]
savings_collection = db["savings"]
loans_collection = db["loans"]
installments_collection = db["installments"]
groups_collection = db["groups"]
subgroups_collection = db["subgroups"]


# =========================================================
# GET ALL MEMBERS
# =========================================================

@router.get(
    "/",
    response_model=list[MemberResponse]
)
def get_members():

    members = members_collection.find().sort(
        "created_at",
        -1
    )

    result = []

    for member in members:

        # ---------------------------------------------
        # Calculate total savings for this member
        # ---------------------------------------------

        saving_result = savings_collection.aggregate([
            {
                "$match": {
                    "member_id": member["_id"]
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_savings": {
                        "$sum": "$amount"
                    }
                }
            }
        ])

        saving_result = list(
            saving_result
        )

        total_savings = (
            saving_result[0]["total_savings"]
            if saving_result
            else 0
        )

        # ---------------------------------------------
        # Calculate current balance
        # ---------------------------------------------

        current_balance = (
            member["opening_balance"]
            + total_savings
        )

        result.append(
            member_helper(
                member,
                current_balance
            )
        )

    return result


# =========================================================
# GET MEMBER PASSBOOK
# =========================================================

@router.get(
    "/{member_id}/passbook"
)
def get_member_passbook(
    member_id: str
):

    # =====================================================
    # VALIDATE MEMBER ID
    # =====================================================

    if not ObjectId.is_valid(member_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid member ID"
        )

    member_object_id = ObjectId(member_id)

    # =====================================================
    # FIND MEMBER
    # =====================================================

    member = members_collection.find_one({
        "_id": member_object_id
    })

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    # =====================================================
    # FIND GROUP / SUBGROUP
    # =====================================================

    subgroup = None

    if member.get("subgroup_id"):
        subgroup = subgroups_collection.find_one({
            "_id": member["subgroup_id"]
        })

    group = None

    if subgroup:
        group = groups_collection.find_one({
            "_id": subgroup["group_id"]
        })

    # =====================================================
    # MEMBER INFORMATION
    # =====================================================

    member_information = {
        "member_id": str(member["_id"]),

        "name": member.get(
            "name",
            ""
        ),

        "phone": member.get(
            "phone",
            ""
        ),

        "address": member.get(
            "address",
            ""
        ),

        "account_no": member.get(
            "account_no",
            ""
        ),

        "status": member.get(
            "status",
            "active"
        ),

        "opening_balance": member.get(
            "opening_balance",
            0
        ),

        "group_id": (
            str(subgroup["group_id"])
            if subgroup
            else None
        ),

        "group_name": (
            group["name"]
            if group
            else "Unknown Group"
        ),

        "subgroup_id": (
            str(member["subgroup_id"])
            if member.get("subgroup_id")
            else None
        ),

        "subgroup_name": (
            subgroup["name"]
            if subgroup
            else "Unknown Subgroup"
        ),

        "created_at": member.get(
            "created_at"
        )
    }

    # =====================================================
    # SAVINGS
    # =====================================================

    savings_cursor = savings_collection.find({
        "member_id": member_object_id
    }).sort(
        [
            ("year", 1),
            ("month", 1),
            ("date", 1)
        ]
    )

    savings = []

    total_savings = 0

    running_savings_balance = float(
        member.get(
            "opening_balance",
            0
        )
    )

    for saving in savings_cursor:

        amount = float(
            saving.get(
                "amount",
                0
            )
        )

        total_savings += amount

        running_savings_balance += amount

        savings.append({

            "saving_id": str(
                saving["_id"]
            ),

            "date": saving.get(
                "date"
            ),

            "month": saving.get(
                "month"
            ),

            "year": saving.get(
                "year"
            ),

            "amount": round(
                amount,
                2
            ),

            "balance": round(
                running_savings_balance,
                2
            )
        })

    # =====================================================
    # LOANS
    # =====================================================

    loans_cursor = loans_collection.find({
        "member_id": member_object_id
    }).sort(
        "created_at",
        1
    )

    # Actual loan records
    loans = []

    # Flattened loan history
    loan_history_rows = []

    total_loan_given = 0
    total_outstanding = 0
    total_interest_charged = 0
    total_service_charge = 0

    for loan in loans_cursor:

        principal_amount = float(
            loan.get(
                "principal_amount",
                0
            )
        )

        principal_balance = float(
            loan.get(
                "principal_balance",
                0
            )
        )

        interest_charged = float(
            loan.get(
                "total_interest_charged",
                0
            )
        )

        service_charge = float(
            loan.get(
                "service_charge",
                0
            )
        )

        # ---------------------------------------------
        # Financial summary
        # ---------------------------------------------

        total_loan_given += principal_amount

        total_outstanding += principal_balance

        total_interest_charged += interest_charged

        total_service_charge += service_charge

        # ---------------------------------------------
        # Loan history
        # ---------------------------------------------

        history = loan.get(
            "loan_history",
            []
        )

        if history:

            for history_item in history:

                loan_history_rows.append({

                    "id": (
                        str(loan["_id"])
                        + "_"
                        + str(
                            history_item.get(
                                "created_at",
                                ""
                            )
                        )
                    ),

                    "loan_id": str(
                        loan["_id"]
                    ),

                    "type": history_item.get(
                        "type",
                        "loan"
                    ),

                    "amount": round(
                        float(
                            history_item.get(
                                "amount",
                                0
                            )
                        ),
                        2
                    ),

                    "interest_rate": float(
                        history_item.get(
                            "interest_rate",
                            loan.get(
                                "interest_rate",
                                0
                            )
                        )
                    ),

                    "service_charge": round(
                        float(
                            history_item.get(
                                "service_charge",
                                0
                            )
                        ),
                        2
                    ),

                    "loan_date": history_item.get(
                        "loan_date"
                    ),

                    "created_at": history_item.get(
                        "created_at"
                    )
                })

        else:

            # -----------------------------------------
            # Fallback for old loans without history
            # -----------------------------------------

            loan_history_rows.append({

                "id": str(
                    loan["_id"]
                ),

                "loan_id": str(
                    loan["_id"]
                ),

                "type": "loan_taken",

                "amount": round(
                    principal_amount,
                    2
                ),

                "interest_rate": float(
                    loan.get(
                        "interest_rate",
                        0
                    )
                ),

                "service_charge": round(
                    service_charge,
                    2
                ),

                "loan_date": loan.get(
                    "loan_date"
                ),

                "created_at": loan.get(
                    "created_at"
                )
            })

        # ---------------------------------------------
        # Keep actual loan record
        # ---------------------------------------------

        loans.append({

            "loan_id": str(
                loan["_id"]
            ),

            "principal_amount": principal_amount,

            "principal_balance": principal_balance,

            "interest_rate": float(
                loan.get(
                    "interest_rate",
                    0
                )
            ),

            "total_interest_charged": interest_charged,

            "service_charge": service_charge,

            "loan_date": loan.get(
                "loan_date"
            ),

            "status": loan.get(
                "status",
                "active"
            )
        })

    # =====================================================
    # INSTALLMENTS
    # =====================================================

    installments_cursor = installments_collection.find({
        "member_id": member_object_id
    }).sort(
        "created_at",
        1
    )

    installments = []

    total_principal_paid = 0
    total_interest_paid = 0
    total_installment_paid = 0

    for installment in installments_cursor:

        principal_amount = float(
            installment.get(
                "principal_amount",
                0
            )
        )

        interest_amount = float(
            installment.get(
                "interest_amount",
                0
            )
        )

        total_amount = float(
            installment.get(
                "total_amount",
                0
            )
        )

        total_principal_paid += principal_amount

        total_interest_paid += interest_amount

        total_installment_paid += total_amount

        installments.append({

            "installment_id": str(
                installment["_id"]
            ),

            "loan_id": str(
                installment["loan_id"]
            ),

            "principal_amount": round(
                principal_amount,
                2
            ),

            "interest_amount": round(
                interest_amount,
                2
            ),

            "total_amount": round(
                total_amount,
                2
            ),

            "remaining_balance": round(
                float(
                    installment.get(
                        "remaining_balance",
                        0
                    )
                ),
                2
            ),

            "installment_date": installment.get(
                "installment_date"
            ),

            "created_at": installment.get(
                "created_at"
            )
        })

    # =====================================================
    # COMBINED TRANSACTIONS
    # =====================================================

    transactions = []

    # -----------------------------------------------------
    # Savings transactions
    # -----------------------------------------------------

    for saving in savings:

        transactions.append({

            "date": saving.get(
                "date"
            ),

            "type": "saving",

            "description": (
                f"Monthly saving - "
                f"{saving.get('month', '')}/"
                f"{saving.get('year', '')}"
            ),

            "debit": 0,

            "credit": saving["amount"],

            "reference_id": saving[
                "saving_id"
            ]
        })

    # -----------------------------------------------------
    # Loan transactions
    # -----------------------------------------------------

    for loan_history in loan_history_rows:

        loan_type = loan_history.get(
            "type",
            "loan"
        )

        if loan_type == "additional_loan":
            description = "Additional Loan"
        else:
            description = "Loan Taken"

        transactions.append({

            "date": loan_history.get(
                "loan_date"
            ),

            "type": "loan",

            "description": description,

            "debit": round(
                float(
                    loan_history.get(
                        "amount",
                        0
                    )
                ),
                2
            ),

            "credit": 0,

            "reference_id": loan_history.get(
                "loan_id"
            )
        })

    # -----------------------------------------------------
    # Installment transactions
    # -----------------------------------------------------

    for installment in installments:

        transactions.append({

            "date": installment.get(
                "installment_date"
            ),

            "type": "installment",

            "description": "Loan Installment",

            "debit": installment[
                "total_amount"
            ],

            "credit": 0,

            "reference_id": installment[
                "installment_id"
            ]
        })

    # =====================================================
    # SORT ALL TRANSACTIONS
    # =====================================================

    transactions.sort(
        key=lambda transaction: str(
            transaction.get(
                "date",
                ""
            )
        )
    )

    # =====================================================
    # FINANCIAL SUMMARY
    # =====================================================

    current_savings = (
        float(
            member.get(
                "opening_balance",
                0
            )
        )
        + total_savings
    )

    financial_summary = {

        "opening_balance": round(
            float(
                member.get(
                    "opening_balance",
                    0
                )
            ),
            2
        ),

        "total_savings": round(
            total_savings,
            2
        ),

        "current_savings": round(
            current_savings,
            2
        ),

        "total_loan_given": round(
            total_loan_given,
            2
        ),

        "outstanding_loan": round(
            total_outstanding,
            2
        ),

        "total_interest_charged": round(
            total_interest_charged,
            2
        ),

        "total_service_charge": round(
            total_service_charge,
            2
        ),

        "total_principal_paid": round(
            total_principal_paid,
            2
        ),

        "total_interest_paid": round(
            total_interest_paid,
            2
        ),

        "total_installment_paid": round(
            total_installment_paid,
            2
        )
    }

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        "member": member_information,

        "summary": financial_summary,

        "savings": savings,

        "loans": loan_history_rows,

        "installments": installments,

        "transactions": transactions
    }

# =========================================================
# CREATE MEMBER
# =========================================================

@router.post(
    "/",
    response_model=MemberResponse
)
def create_member(
    member: MemberCreate
):

    # Check if account number already exists

    existing_member = members_collection.find_one({
        "account_no": member.account_no
    })

    if existing_member:
        raise HTTPException(
            status_code=400,
            detail="Account number already exists"
        )

    member_data = create_member_document(
        member.model_dump()
    )

    try:

        members_collection.insert_one(
            member_data
        )

    except DuplicateKeyError:

        raise HTTPException(
            status_code=400,
            detail="Account number already exists"
        )

    return member_helper(
        member_data
    )