from fastapi import APIRouter, HTTPException

from bson import ObjectId

from app.config.connection import db

from app.models.installment import (
    create_installment_document,
    installment_helper
)

from app.schemas.installment import (
    InstallmentCreate,
    InstallmentResponse
)


router = APIRouter(
    prefix="/installments",
    tags=["Installments"]
)


installments_collection = db["installments"]
loans_collection = db["loans"]
members_collection = db["members"]
groups_collection = db["groups"]
subgroups_collection = db["subgroups"]


# =========================================================
# GET ALL INSTALLMENTS
# =========================================================

@router.get(
    "/",
    response_model=list[InstallmentResponse]
)
def get_installments():

    installments = installments_collection.find().sort(
        "created_at",
        -1
    )

    return [
        installment_helper(installment)
        for installment in installments
    ]

# =========================================================
# INSTALLMENT DASHBOARD
# =========================================================

@router.get("/dashboard")
def get_installment_dashboard():

    subgroups = subgroups_collection.find().sort(
        "created_at",
        -1
    )

    result = []

    total_principal_paid = 0
    total_interest_paid = 0
    total_amount_collected = 0
    total_installments = 0

    for subgroup in subgroups:

        group = groups_collection.find_one({
            "_id": subgroup["group_id"]
        })

        group_name = (
            group["name"]
            if group
            else "Unknown Group"
        )

        # ---------------------------------------------
        # Calculate subgroup installment totals
        # ---------------------------------------------

        aggregation = installments_collection.aggregate([
            {
                "$match": {
                    "subgroup_id": subgroup["_id"]
                }
            },
            {
                "$group": {
                    "_id": None,

                    "principal_paid": {
                        "$sum": "$principal_amount"
                    },

                    "interest_paid": {
                        "$sum": "$interest_amount"
                    },

                    "total_collected": {
                        "$sum": "$total_amount"
                    },

                    "installment_count": {
                        "$sum": 1
                    }
                }
            }
        ])

        aggregation = list(aggregation)

        if aggregation:

            subgroup_principal = aggregation[0].get(
                "principal_paid",
                0
            )

            subgroup_interest = aggregation[0].get(
                "interest_paid",
                0
            )

            subgroup_total = aggregation[0].get(
                "total_collected",
                0
            )

            subgroup_installments = aggregation[0].get(
                "installment_count",
                0
            )

        else:

            subgroup_principal = 0
            subgroup_interest = 0
            subgroup_total = 0
            subgroup_installments = 0

        # ---------------------------------------------
        # Add to overall totals
        # ---------------------------------------------

        total_principal_paid += subgroup_principal
        total_interest_paid += subgroup_interest
        total_amount_collected += subgroup_total
        total_installments += subgroup_installments

        # ---------------------------------------------
        # Add subgroup result
        # ---------------------------------------------

        result.append({
            "subgroup_id": str(
                subgroup["_id"]
            ),

            "subgroup_name": subgroup["name"],

            "group_id": str(
                subgroup["group_id"]
            ),

            "group_name": group_name,

            "principal_paid": round(
                subgroup_principal,
                2
            ),

            "interest_paid": round(
                subgroup_interest,
                2
            ),

            "total_collected": round(
                subgroup_total,
                2
            ),

            "installment_count": (
                subgroup_installments
            )
        })

    return {
        "total_principal_paid": round(
            total_principal_paid,
            2
        ),

        "total_interest_paid": round(
            total_interest_paid,
            2
        ),

        "total_amount_collected": round(
            total_amount_collected,
            2
        ),

        "total_installments": total_installments,

        "subgroups": result
    }

# =========================================================
# SUBGROUP INSTALLMENT DETAILS
# =========================================================

@router.get(
    "/subgroup/{subgroup_id}/details"
)
def get_subgroup_installment_details(
    subgroup_id: str
):

    if not ObjectId.is_valid(subgroup_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid subgroup ID"
        )

    subgroup_object_id = ObjectId(
        subgroup_id
    )

    subgroup = subgroups_collection.find_one({
        "_id": subgroup_object_id
    })

    if not subgroup:
        raise HTTPException(
            status_code=404,
            detail="Subgroup not found"
        )

    group = groups_collection.find_one({
        "_id": subgroup["group_id"]
    })

    group_name = (
        group["name"]
        if group
        else "Unknown Group"
    )

    # -----------------------------------------------------
    # Get members of this subgroup
    # -----------------------------------------------------

    members = members_collection.find({
        "subgroup_id": subgroup_object_id,
        "status": "active"
    }).sort(
        "name",
        1
    )

    member_details = []

    total_principal_paid = 0
    total_interest_paid = 0
    total_collected = 0

    for member in members:

        # -------------------------------------------------
        # Find active loan for member
        # -------------------------------------------------

        loan = loans_collection.find_one({
            "member_id": member["_id"],
            "status": {
                "$in": ["active", "paid"]
            }
        })

        if not loan:
            continue

        # -------------------------------------------------
        # Get installment totals
        # -------------------------------------------------

        aggregation = installments_collection.aggregate([
            {
                "$match": {
                    "loan_id": loan["_id"]
                }
            },
            {
                "$group": {
                    "_id": None,

                    "principal_paid": {
                        "$sum": "$principal_amount"
                    },

                    "interest_paid": {
                        "$sum": "$interest_amount"
                    },

                    "total_paid": {
                        "$sum": "$total_amount"
                    },

                    "installment_count": {
                        "$sum": 1
                    }
                }
            }
        ])

        aggregation = list(
            aggregation
        )

        if aggregation:

            principal_paid = aggregation[0].get(
                "principal_paid",
                0
            )

            interest_paid = aggregation[0].get(
                "interest_paid",
                0
            )

            total_paid = aggregation[0].get(
                "total_paid",
                0
            )

            installment_count = aggregation[0].get(
                "installment_count",
                0
            )

        else:

            principal_paid = 0
            interest_paid = 0
            total_paid = 0
            installment_count = 0

        # -------------------------------------------------
        # Overall totals
        # -------------------------------------------------

        total_principal_paid += principal_paid

        total_interest_paid += interest_paid

        total_collected += total_paid

        # -------------------------------------------------
        # Member result
        # -------------------------------------------------

        member_details.append({

            "member_id": str(
                member["_id"]
            ),

            "member_name": member["name"],

            "account_no": member["account_no"],

            "loan_id": str(
                loan["_id"]
            ),

            "original_loan": loan.get(
                "principal_amount",
                0
            ),

            "remaining_balance": loan.get(
                "principal_balance",
                0
            ),

            "principal_paid": round(
                principal_paid,
                2
            ),

            "interest_paid": round(
                interest_paid,
                2
            ),

            "total_paid": round(
                total_paid,
                2
            ),

            "installment_count": (
                installment_count
            ),

            "status": loan.get(
                "status",
                "active"
            )
        })

    return {

        "subgroup_id": str(
            subgroup["_id"]
        ),

        "subgroup_name": subgroup["name"],

        "group_id": str(
            subgroup["group_id"]
        ),

        "group_name": group_name,

        "total_principal_paid": round(
            total_principal_paid,
            2
        ),

        "total_interest_paid": round(
            total_interest_paid,
            2
        ),

        "total_collected": round(
            total_collected,
            2
        ),

        "members": member_details
    }

# =========================================================
# GET SINGLE INSTALLMENT
# =========================================================

@router.get(
    "/{installment_id}",
    response_model=InstallmentResponse
)
def get_installment(installment_id: str):

    if not ObjectId.is_valid(installment_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid installment ID"
        )

    installment = installments_collection.find_one({
        "_id": ObjectId(installment_id)
    })

    if not installment:
        raise HTTPException(
            status_code=404,
            detail="Installment not found"
        )

    return installment_helper(installment)


# =========================================================
# GET INSTALLMENTS FOR A LOAN
# =========================================================

@router.get(
    "/loan/{loan_id}"
)
def get_loan_installments(loan_id: str):

    if not ObjectId.is_valid(loan_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid loan ID"
        )

    loan_object_id = ObjectId(loan_id)

    loan = loans_collection.find_one({
        "_id": loan_object_id
    })

    if not loan:
        raise HTTPException(
            status_code=404,
            detail="Loan not found"
        )

    member = members_collection.find_one({
        "_id": loan["member_id"]
    })

    group = groups_collection.find_one({
        "_id": loan["group_id"]
    })

    subgroup = None

    if loan.get("subgroup_id"):
        subgroup = subgroups_collection.find_one({
            "_id": loan["subgroup_id"]
        })

    installments = installments_collection.find({
        "loan_id": loan_object_id
    }).sort(
        "created_at",
        1
    )

    installment_list = [
        installment_helper(installment)
        for installment in installments
    ]

    total_principal_paid = sum(
        installment["principal_amount"]
        for installment in installment_list
    )

    total_interest_paid = sum(
        installment["interest_amount"]
        for installment in installment_list
    )

    total_paid = sum(
        installment["total_amount"]
        for installment in installment_list
    )

    return {
        "loan_id": str(loan["_id"]),

        "member_id": str(loan["member_id"]),

        "member_name": (
            member["name"]
            if member
            else "Unknown Member"
        ),

        "account_no": (
            member.get("account_no", "")
            if member
            else ""
        ),

        "group_id": str(loan["group_id"]),

        "group_name": (
            group["name"]
            if group
            else "Unknown Group"
        ),

        "subgroup_id": (
            str(loan["subgroup_id"])
            if loan.get("subgroup_id")
            else None
        ),

        "subgroup_name": (
            subgroup["name"]
            if subgroup
            else "Unknown Subgroup"
        ),

        "principal_amount": loan.get(
            "principal_amount",
            0
        ),

        "principal_balance": loan.get(
            "principal_balance",
            0
        ),

        "interest_rate": loan.get(
            "interest_rate",
            0
        ),

        "total_interest_charged": loan.get(
            "total_interest_charged",
            0
        ),

        "service_charge": loan.get(
            "service_charge",
            0
        ),

        "loan_date": loan.get(
            "loan_date"
        ),

        "status": loan.get(
            "status",
            "active"
        ),

        "total_principal_paid": total_principal_paid,

        "total_interest_paid": total_interest_paid,

        "total_paid": total_paid,

        "installments": installment_list
    }


# =========================================================
# CREATE INSTALLMENT
# =========================================================

@router.post(
    "/",
    response_model=InstallmentResponse
)
def create_installment(
    installment: InstallmentCreate
):

    # -----------------------------------------------------
    # Validate loan ID
    # -----------------------------------------------------

    if not ObjectId.is_valid(installment.loan_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid loan ID"
        )

    loan_object_id = ObjectId(
        installment.loan_id
    )

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
    # Check loan status
    # -----------------------------------------------------

    if loan.get("status") != "active":
        raise HTTPException(
            status_code=400,
            detail="This loan is not active"
        )

    # -----------------------------------------------------
    # Current principal balance
    # -----------------------------------------------------

    current_balance = float(
        loan.get(
            "principal_balance",
            0
        )
    )

    if current_balance <= 0:
        raise HTTPException(
            status_code=400,
            detail="This loan has no remaining principal balance"
        )

    # -----------------------------------------------------
    # Validate principal payment
    # -----------------------------------------------------

    principal_payment = float(
        installment.principal_amount
    )

    if principal_payment > current_balance:
        raise HTTPException(
            status_code=400,
            detail=(
                "Principal payment cannot be greater "
                "than the remaining loan balance"
            )
        )

    # -----------------------------------------------------
    # Get interest rate from the loan
    # -----------------------------------------------------

    interest_rate = float(
        loan.get(
            "interest_rate",
            0
        )
    )

    # -----------------------------------------------------
    # REDUCING BALANCE INTEREST
    #
    # Interest is calculated on the balance BEFORE
    # this installment payment.
    #
    # Example:
    #
    # Current balance = 20,000
    # Interest rate   = 1%
    #
    # Interest = 20,000 × 1 / 100
    #          = 200
    # -----------------------------------------------------

    interest_amount = (
        current_balance
        * interest_rate
        / 100
    )

    # Round money to 2 decimal places
    interest_amount = round(
        interest_amount,
        2
    )

    # -----------------------------------------------------
    # Calculate total payment
    # -----------------------------------------------------

    total_amount = (
        principal_payment
        + interest_amount
    )

    total_amount = round(
        total_amount,
        2
    )

    # -----------------------------------------------------
    # Calculate remaining principal
    # -----------------------------------------------------

    remaining_balance = (
        current_balance
        - principal_payment
    )

    remaining_balance = round(
        remaining_balance,
        2
    )

    # Prevent negative zero
    if remaining_balance < 0:
        remaining_balance = 0

    # -----------------------------------------------------
    # Create installment document
    # -----------------------------------------------------

    installment_data = {
        "loan_id": installment.loan_id,

        "member_id": str(
            loan["member_id"]
        ),

        "group_id": str(
            loan["group_id"]
        ),

        "subgroup_id": (
            str(loan["subgroup_id"])
            if loan.get("subgroup_id")
            else None
        ),

        "principal_amount": principal_payment,

        "interest_amount": interest_amount,

        "total_amount": total_amount,

        "remaining_balance": remaining_balance,

        "installment_date": (
            installment.installment_date
        )
    }

    installment_document = create_installment_document(
        installment_data
    )

    # -----------------------------------------------------
    # Save installment
    # -----------------------------------------------------

    installments_collection.insert_one(
        installment_document
    )

    # -----------------------------------------------------
    # Update loan
    # -----------------------------------------------------

    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)

    new_total_interest = (
        float(
            loan.get(
                "total_interest_charged",
                0
            )
        )
        + interest_amount
    )

    # If principal reaches zero,
    # the loan becomes paid.
    new_status = (
        "paid"
        if remaining_balance == 0
        else "active"
    )

    loans_collection.update_one(
        {
            "_id": loan_object_id
        },
        {
            "$set": {
                "principal_balance": remaining_balance,

                "total_interest_charged": round(
                    new_total_interest,
                    2
                ),

                "status": new_status,

                "updated_at": now
            }
        }
    )

    # -----------------------------------------------------
    # Return created installment
    # -----------------------------------------------------

    return installment_helper(
        installment_document
    )