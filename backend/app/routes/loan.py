from datetime import datetime, timezone

from bson import ObjectId

from fastapi import APIRouter, HTTPException

from app.config.connection import db

from app.models.loan import (
    create_loan_document,
    loan_helper,
)

from app.schemas.loan import (
    LoanCreate,
    LoanResponse,
)


router = APIRouter(
    prefix="/loans",
    tags=["Loans"]
)


loans_collection = db["loans"]
members_collection = db["members"]
groups_collection = db["groups"]
subgroups_collection = db["subgroups"]


# =========================================================
# GET ALL LOANS
# =========================================================

@router.get(
    "/",
    response_model=list[LoanResponse]
)
def get_all_loans():

    loans = loans_collection.find().sort(
        "created_at",
        -1
    )

    return [
        loan_helper(loan)
        for loan in loans
    ]


# =========================================================
# GET LOAN DASHBOARD
# =========================================================

@router.get("/dashboard")
def get_loan_dashboard():

    loans = loans_collection.find()

    # =====================================================
    # OVERALL TOTALS
    # =====================================================

    total_loan_amount = 0
    total_outstanding = 0
    total_interest = 0
    total_service_charge = 0
    active_loans = 0

    # =====================================================
    # SUBGROUP TOTALS
    # =====================================================

    subgroup_data = {}

    for loan in loans:

        subgroup_id = loan.get(
            "subgroup_id"
        )

        # A loan should normally belong to a subgroup.
        # Skip it if no subgroup is attached.

        if not subgroup_id:
            continue

        subgroup_key = str(
            subgroup_id
        )

        # -------------------------------------------------
        # Overall totals
        # -------------------------------------------------

        principal_amount = loan.get(
            "principal_amount",
            0
        )

        principal_balance = loan.get(
            "principal_balance",
            0
        )

        interest_charged = loan.get(
            "total_interest_charged",
            0
        )

        service_charge = loan.get(
            "service_charge",
            0
        )

        total_loan_amount += principal_amount
        total_outstanding += principal_balance
        total_interest += interest_charged
        total_service_charge += service_charge

        if loan.get("status") == "active":
            active_loans += 1

        # -------------------------------------------------
        # Create subgroup entry
        # -------------------------------------------------

        if subgroup_key not in subgroup_data:

            subgroup = subgroups_collection.find_one({
                "_id": subgroup_id
            })

            group = None

            if subgroup:
                group = groups_collection.find_one({
                    "_id": subgroup["group_id"]
                })

            subgroup_data[subgroup_key] = {

                "subgroup_id":
                    subgroup_key,

                "subgroup_name":
                    subgroup["name"]
                    if subgroup
                    else "Unknown Subgroup",

                "group_id":
                    str(subgroup["group_id"])
                    if subgroup
                    else None,

                "group_name":
                    group["name"]
                    if group
                    else "Unknown Group",

                "total_loan":
                    0,

                "total_outstanding":
                    0,

                "total_interest":
                    0,

                "total_service_charge":
                    0
            }

        # -------------------------------------------------
        # Add loan values to subgroup
        # -------------------------------------------------

        subgroup_data[subgroup_key][
            "total_loan"
        ] += principal_amount

        subgroup_data[subgroup_key][
            "total_outstanding"
        ] += principal_balance

        subgroup_data[subgroup_key][
            "total_interest"
        ] += interest_charged

        subgroup_data[subgroup_key][
            "total_service_charge"
        ] += service_charge

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        "total_loan_amount":
            total_loan_amount,

        "total_outstanding":
            total_outstanding,

        "total_interest":
            total_interest,

        "total_service_charge":
            total_service_charge,

        "active_loans":
            active_loans,

        "subgroups":
            list(subgroup_data.values())
    }


# =========================================================
# GET LOANS FOR A SUBGROUP
# =========================================================

@router.get(
    "/subgroup/{subgroup_id}/details"
)
def get_subgroup_loan_details(
    subgroup_id: str
):

    # -----------------------------------------------------
    # Validate subgroup ID
    # -----------------------------------------------------

    if not ObjectId.is_valid(
        subgroup_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid subgroup ID"
        )

    subgroup_object_id = ObjectId(
        subgroup_id
    )

    # -----------------------------------------------------
    # Find subgroup
    # -----------------------------------------------------

    subgroup = subgroups_collection.find_one({
        "_id": subgroup_object_id
    })

    if not subgroup:
        raise HTTPException(
            status_code=404,
            detail="Subgroup not found"
        )

    # -----------------------------------------------------
    # Find parent group
    # -----------------------------------------------------

    group = groups_collection.find_one({
        "_id": subgroup["group_id"]
    })

    # -----------------------------------------------------
    # Find loans belonging to this subgroup
    # -----------------------------------------------------

    loans = loans_collection.find({
        "subgroup_id": subgroup_object_id
    }).sort(
        "created_at",
        -1
    )

    members = []

    # =====================================================
    # SUBGROUP TOTALS
    # =====================================================

    total_loan = 0
    total_outstanding = 0
    total_interest = 0
    total_service_charge = 0

    for loan in loans:

        # -------------------------------------------------
        # Find member
        # -------------------------------------------------

        member = members_collection.find_one({
            "_id": loan["member_id"]
        })

        member_name = (
            member["name"]
            if member
            else "Unknown Member"
        )

        account_no = (
            member["account_no"]
            if member
            else ""
        )

        # -------------------------------------------------
        # Loan values
        # -------------------------------------------------

        principal_amount = loan.get(
            "principal_amount",
            0
        )

        principal_balance = loan.get(
            "principal_balance",
            0
        )

        interest_charged = loan.get(
            "total_interest_charged",
            0
        )

        service_charge = loan.get(
            "service_charge",
            0
        )

        # -------------------------------------------------
        # Add to subgroup totals
        # -------------------------------------------------

        total_loan += principal_amount
        total_outstanding += principal_balance
        total_interest += interest_charged
        total_service_charge += service_charge

        # -------------------------------------------------
        # Member loan details
        # -------------------------------------------------

        members.append({

            "loan_id":
                str(loan["_id"]),

            "member_id":
                str(loan["member_id"]),

            "member_name":
                member_name,

            "account_no":
                account_no,

            "principal_amount":
                principal_amount,

            "principal_balance":
                principal_balance,

            "interest_rate":
                loan.get(
                    "interest_rate",
                    0
                ),

            "total_interest_charged":
                interest_charged,

            "service_charge":
                service_charge,

            "loan_date":
                loan["loan_date"],

            "status":
                loan["status"]
        })

    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "subgroup_id":
            str(subgroup["_id"]),

        "subgroup_name":
            subgroup["name"],

        "group_id":
            str(subgroup["group_id"]),

        "group_name":
            group["name"]
            if group
            else "Unknown Group",

        "total_loan":
            total_loan,

        "total_outstanding":
            total_outstanding,

        "total_interest":
            total_interest,

        "total_service_charge":
            total_service_charge,

        "members":
            members
    }

# =========================================================
# GET LOAN HISTORY
# =========================================================

@router.get("/{loan_id}/history")
def get_loan_history(
    loan_id: str
):

    # -----------------------------------------------------
    # Validate loan ID
    # -----------------------------------------------------

    if not ObjectId.is_valid(loan_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid loan ID"
        )

    loan_object_id = ObjectId(loan_id)

    # -----------------------------------------------------
    # Find loan
    # -----------------------------------------------------

    loan = loans_collection.find_one({
        "_id": loan_object_id
    })

    if not loan:
        raise HTTPException(
            status_code=404,
            detail="Loan not found"
        )

    # -----------------------------------------------------
    # Find member
    # -----------------------------------------------------

    member = members_collection.find_one({
        "_id": loan["member_id"]
    })

    # -----------------------------------------------------
    # Find group
    # -----------------------------------------------------

    group = groups_collection.find_one({
        "_id": loan["group_id"]
    })

    # -----------------------------------------------------
    # Find subgroup
    # -----------------------------------------------------

    subgroup = None

    if loan.get("subgroup_id"):

        subgroup = subgroups_collection.find_one({
            "_id": loan["subgroup_id"]
        })

    # -----------------------------------------------------
    # Get loan history
    # -----------------------------------------------------

    history = loan.get(
        "loan_history",
        []
    )

    # -----------------------------------------------------
    # Return passbook data
    # -----------------------------------------------------

    return {

        "loan_id":
            str(loan["_id"]),

        "member_id":
            str(loan["member_id"]),

        "member_name":
            member["name"]
            if member
            else "Unknown Member",

        "account_no":
            member.get("account_no", "")
            if member
            else "",

        "group_id":
            str(loan["group_id"]),

        "group_name":
            group["name"]
            if group
            else "Unknown Group",

        "subgroup_id":
            str(loan["subgroup_id"])
            if loan.get("subgroup_id")
            else None,

        "subgroup_name":
            subgroup["name"]
            if subgroup
            else "Unknown Subgroup",

        "principal_amount":
            loan.get(
                "principal_amount",
                0
            ),

        "principal_balance":
            loan.get(
                "principal_balance",
                0
            ),

        "interest_rate":
            loan.get(
                "interest_rate",
                0
            ),

        "total_interest_charged":
            loan.get(
                "total_interest_charged",
                0
            ),

        "service_charge":
            loan.get(
                "service_charge",
                0
            ),

        "loan_date":
            loan.get(
                "loan_date"
            ),

        "status":
            loan.get(
                "status",
                "active"
            ),

        "loan_history":
            history
    }
# =========================================================
# GET SINGLE LOAN
# =========================================================

@router.get(
    "/{loan_id}",
    response_model=LoanResponse
)
def get_loan(
    loan_id: str
):

    if not ObjectId.is_valid(
        loan_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid loan ID"
        )

    loan = loans_collection.find_one({
        "_id": ObjectId(loan_id)
    })

    if not loan:
        raise HTTPException(
            status_code=404,
            detail="Loan not found"
        )

    return loan_helper(loan)


# =========================================================
# CREATE / ADD LOAN
# =========================================================

@router.post(
    "/",
    response_model=LoanResponse
)
def create_loan(
    loan: LoanCreate
):

    # -----------------------------------------------------
    # Validate member
    # -----------------------------------------------------

    if not ObjectId.is_valid(
        loan.member_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid member ID"
        )

    member_id = ObjectId(
        loan.member_id
    )

    member = members_collection.find_one({
        "_id": member_id
    })

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    # -----------------------------------------------------
    # Validate group
    # -----------------------------------------------------

    if not ObjectId.is_valid(
        loan.group_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid group ID"
        )

    group_id = ObjectId(
        loan.group_id
    )

    group = groups_collection.find_one({
        "_id": group_id
    })

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    # -----------------------------------------------------
    # Validate subgroup
    # -----------------------------------------------------

    subgroup_id = None

    if loan.subgroup_id:

        if not ObjectId.is_valid(
            loan.subgroup_id
        ):
            raise HTTPException(
                status_code=400,
                detail="Invalid subgroup ID"
            )

        subgroup_id = ObjectId(
            loan.subgroup_id
        )

        subgroup = subgroups_collection.find_one({
            "_id": subgroup_id
        })

        if not subgroup:
            raise HTTPException(
                status_code=404,
                detail="Subgroup not found"
            )

        if subgroup["group_id"] != group_id:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Subgroup does not belong "
                    "to the selected group"
                )
            )

    # -----------------------------------------------------
    # Make sure member belongs to subgroup
    # -----------------------------------------------------

    if subgroup_id:

        if member.get(
            "subgroup_id"
        ) != subgroup_id:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Member does not belong "
                    "to the selected subgroup"
                )
            )

    # -----------------------------------------------------
    # Check existing active loan
    # -----------------------------------------------------

    existing_loan = loans_collection.find_one({
        "member_id": member_id,
        "status": "active"
    })

    # =====================================================
    # EXISTING ACTIVE LOAN
    # =====================================================

    if existing_loan:

        current_balance = existing_loan[
            "principal_balance"
        ]

        new_balance = (
            current_balance
            + loan.principal_amount
        )

        now = datetime.now(
            timezone.utc
        )

        # -------------------------------------------------
        # Create additional loan history record
        # -------------------------------------------------

        additional_history = {

            "type":
                "additional_loan",

            "amount":
                loan.principal_amount,

            "interest_rate":
                loan.interest_rate,

            "service_charge":
                loan.service_charge,

            "loan_date":
                loan.loan_date,

            "created_at":
                now
        }

        # -------------------------------------------------
        # Update existing loan
        # -------------------------------------------------

        updated_loan = {

            "$set": {

                "principal_balance":
                    new_balance,

                "interest_rate":
                    loan.interest_rate,

                "updated_at":
                    now
            },

            "$inc": {

                # Total principal given
                "principal_amount":
                    loan.principal_amount,

                # New service charge
                "service_charge":
                    loan.service_charge
            },

            "$push": {

                "loan_history":
                    additional_history
            }
        }

        loans_collection.update_one(
            {
                "_id":
                    existing_loan["_id"]
            },
            updated_loan
        )

        # -------------------------------------------------
        # Get updated loan
        # -------------------------------------------------

        updated = loans_collection.find_one({
            "_id":
                existing_loan["_id"]
        })

        return loan_helper(updated)

    # =====================================================
    # BRAND NEW LOAN
    # =====================================================

    loan_data = create_loan_document(
        loan.model_dump()
    )

    loans_collection.insert_one(
        loan_data
    )

    return loan_helper(
        loan_data
    )