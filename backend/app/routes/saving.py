from fastapi import APIRouter, HTTPException, Query
from pymongo.errors import DuplicateKeyError
from bson import ObjectId

from app.config.connection import db

from app.models.saving import (
    create_saving_document,
    saving_helper
)

from app.schemas.saving import (
    SavingCreate,
    BulkSavingCreate,
    SavingResponse
)


router = APIRouter(
    prefix="/savings",
    tags=["Savings"]
)


savings_collection = db["savings"]
members_collection = db["members"]
subgroups_collection = db["subgroups"]
groups_collection = db["groups"]


@router.get("/", response_model=list[SavingResponse])
def get_savings():

    savings = savings_collection.find().sort("created_at", -1)

    return [
        saving_helper(saving)
        for saving in savings
    ]


@router.post("/", response_model=SavingResponse)
def create_saving(saving: SavingCreate):

    # Check member ID
    if not ObjectId.is_valid(saving.member_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid member ID"
        )

    # Check group ID
    if not ObjectId.is_valid(saving.group_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid group ID"
        )

    # Check subgroup ID
    if saving.subgroup_id and not ObjectId.is_valid(saving.subgroup_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid subgroup ID"
        )

    # Check if member exists
    member = members_collection.find_one({
        "_id": ObjectId(saving.member_id)
    })

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    # Check if saving already exists for this member and month
    existing_saving = savings_collection.find_one({
        "member_id": ObjectId(saving.member_id),
        "month": saving.month,
        "year": saving.year
    })

    if existing_saving:
        raise HTTPException(
            status_code=400,
            detail="Saving for this member already exists for this month"
        )

    saving_data = create_saving_document(
        saving.model_dump()
    )

    try:
        savings_collection.insert_one(saving_data)

    except DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail="Saving for this member already exists for this month"
        )

    return saving_helper(saving_data)


@router.post("/bulk")
def create_bulk_savings(data: BulkSavingCreate):
    if not ObjectId.is_valid(data.subgroup_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid subgroup ID"
        )

    subgroup_id = ObjectId(data.subgroup_id)

    # Check subgroup
    subgroup = subgroups_collection.find_one({
        "_id": subgroup_id
    })

    if not subgroup:
        raise HTTPException(
            status_code=404,
            detail="Subgroup not found"
        )

    # Find parent group
    group = groups_collection.find_one({
        "_id": subgroup["group_id"]
    })

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Parent group not found"
        )

    # Find active members of this subgroup
    members = list(
        members_collection.find({
            "subgroup_id": subgroup_id,
            "status": "active"
        }).sort("name", 1)
    )

    if not members:
        raise HTTPException(
            status_code=404,
            detail="No active members found in this subgroup"
        )

    created_savings = []
    skipped_members = []

    for member in members:

        # Prevent duplicate saving for the same member
        # in the same month and year
        existing_saving = savings_collection.find_one({
            "member_id": member["_id"],
            "month": data.month,
            "year": data.year
        })

        if existing_saving:
            skipped_members.append({
                "member_id": str(member["_id"]),
                "name": member["name"]
            })
            continue

        saving_data = {
            "_id": ObjectId(),
            "member_id": member["_id"],
            "group_id": subgroup["group_id"],
            "subgroup_id": subgroup_id,
            "amount": data.amount,
            "date": data.date,
            "month": data.month,
            "year": data.year
        }

        from datetime import datetime, timezone

        saving_data["created_at"] = datetime.now(timezone.utc)

        created_savings.append(saving_data)

    # Insert all new savings
    if created_savings:
        try:
            savings_collection.insert_many(created_savings)
        except DuplicateKeyError:
            raise HTTPException(
                status_code=400,
                detail="Some savings already exist for this month"
            )

    return {
        "message": "Bulk savings entry completed",

        "subgroup_id": data.subgroup_id,
        "subgroup_name": subgroup["name"],

        "group_id": str(subgroup["group_id"]),
        "group_name": group["name"],

        "month": data.month,
        "year": data.year,

        "amount_per_member": data.amount,

        "members_found": len(members),

        "entries_created": len(created_savings),
        "entries_skipped": len(skipped_members),

        "skipped_members": skipped_members,

        "total_amount": data.amount * len(created_savings)
    }
@router.get("/dashboard")
def get_savings_dashboard(
    month: int | None = Query(
        default=None,
        ge=1,
        le=12
    ),
    year: int | None = Query(
        default=None
    )
):
    from datetime import datetime, timezone

    # If month and year are not provided,
    # automatically use previous month.
    if month is None or year is None:

        today = datetime.now(timezone.utc)

        if today.month == 1:
            selected_month = 12
            selected_year = today.year - 1
        else:
            selected_month = today.month - 1
            selected_year = today.year

    else:

        selected_month = month
        selected_year = year

    # Get all subgroups
    subgroups = subgroups_collection.find().sort(
        "created_at",
        -1
    )

    result = []

    for subgroup in subgroups:

        # Find parent group
        group = groups_collection.find_one({
            "_id": subgroup["group_id"]
        })

        group_name = (
            group["name"]
            if group
            else "Unknown Group"
        )

        # Calculate total savings for selected month
        total_result = savings_collection.aggregate([
            {
                "$match": {
                    "subgroup_id": subgroup["_id"],
                    "month": selected_month,
                    "year": selected_year
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total": {
                        "$sum": "$amount"
                    }
                }
            }
        ])

        total_result = list(total_result)

        total_saving = (
            total_result[0]["total"]
            if total_result
            else 0
        )

        result.append({
            "subgroup_id": str(subgroup["_id"]),
            "subgroup_name": subgroup["name"],
            "group_id": str(subgroup["group_id"]),
            "group_name": group_name,
            "total_saving": total_saving
        })

    return {
        "month": selected_month,
        "year": selected_year,
        "subgroups": result
    }

@router.get("/subgroup/{subgroup_id}/details")
def get_subgroup_saving_details(
    subgroup_id: str,
    month: int | None = Query(
        default=None,
        ge=1,
        le=12
    ),
    year: int | None = Query(
        default=None
    )
):

    # Check subgroup ID
    if not ObjectId.is_valid(subgroup_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid subgroup ID"
        )

    subgroup_object_id = ObjectId(subgroup_id)

    # Find subgroup
    subgroup = subgroups_collection.find_one({
        "_id": subgroup_object_id
    })

    if not subgroup:
        raise HTTPException(
            status_code=404,
            detail="Subgroup not found"
        )

    # Find parent group
    group = groups_collection.find_one({
        "_id": subgroup["group_id"]
    })

    group_name = (
        group["name"]
        if group
        else "Unknown Group"
    )

    # If month/year are not provided,
    # use previous month
    from datetime import datetime, timezone

    if month is None or year is None:

        today = datetime.now(timezone.utc)

        if today.month == 1:
            selected_month = 12
            selected_year = today.year - 1
        else:
            selected_month = today.month - 1
            selected_year = today.year

    else:

        selected_month = month
        selected_year = year

    # Find active members
    members = members_collection.find({
        "subgroup_id": subgroup_object_id,
        "status": "active"
    }).sort("name", 1)

    member_details = []

    total_saving = 0

    for member in members:

        saving = savings_collection.find_one({
            "member_id": member["_id"],
            "month": selected_month,
            "year": selected_year
        })

        amount = (
            saving["amount"]
            if saving
            else 0
        )

        total_saving += amount

        member_details.append({
            "member_id": str(member["_id"]),
            "member_name": member["name"],
            "account_no": member["account_no"],
            "saving": amount
        })

    return {
        "subgroup_id": str(subgroup["_id"]),
        "subgroup_name": subgroup["name"],
        "group_id": str(subgroup["group_id"]),
        "group_name": group_name,

        "month": selected_month,
        "year": selected_year,

        "members": member_details,

        "total_saving": total_saving
    }