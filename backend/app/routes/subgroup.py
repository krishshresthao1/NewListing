from fastapi import APIRouter, HTTPException
from pymongo.errors import DuplicateKeyError
from bson import ObjectId

from app.config.connection import db
from app.models.subgroup import (
    create_subgroup_document,
    subgroup_helper
)
from app.schemas.subgroup import (
    SubgroupCreate,
    SubgroupResponse
)


router = APIRouter(
    prefix="/subgroups",
    tags=["Subgroups"]
)


subgroups_collection = db["subgroups"]
groups_collection = db["groups"]

@router.get("/", response_model=list[SubgroupResponse])
def get_all_subgroups():

    subgroups = subgroups_collection.find().sort("created_at", -1)

    result = []

    for subgroup in subgroups:

        group = groups_collection.find_one({
            "_id": subgroup["group_id"]
        })

        group_name = group["name"] if group else "Unknown Group"

        result.append(
            subgroup_helper(
                subgroup,
                group_name
            )
        )

    return result

@router.get("/group/{group_id}", response_model=list[SubgroupResponse])
def get_subgroups_by_group(group_id: str):

    if not ObjectId.is_valid(group_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid group_id"
        )

    subgroups = subgroups_collection.find({
        "group_id": ObjectId(group_id)
    }).sort("created_at", -1)

    return [
        subgroup_helper(subgroup)
        for subgroup in subgroups
    ]

@router.post("/", response_model=SubgroupResponse)
def create_subgroup(subgroup: SubgroupCreate):

    # Check if group_id is a valid ObjectId
    if not ObjectId.is_valid(subgroup.group_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid group_id"
        )

    # Check if the parent group exists
    existing_group = groups_collection.find_one({
        "_id": ObjectId(subgroup.group_id)
    })

    if not existing_group:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    # Check if subgroup already exists in this group
    existing_subgroup = subgroups_collection.find_one({
        "name": subgroup.name,
        "group_id": ObjectId(subgroup.group_id)
    })

    if existing_subgroup:
        raise HTTPException(
            status_code=400,
            detail="Subgroup already exists in this group"
        )

    subgroup_data = create_subgroup_document(
        subgroup.model_dump()
    )

    try:
        subgroups_collection.insert_one(subgroup_data)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail="Subgroup already exists"
        )

    return subgroup_helper(subgroup_data)