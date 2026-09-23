from fastapi import APIRouter, HTTPException
from pymongo.errors import DuplicateKeyError

from app.config.connection import db
from app.models.group import create_group_document, group_helper
from app.schemas.group import GroupCreate, GroupResponse


router = APIRouter(
    prefix="/groups",
    tags=["Groups"]
)


groups_collection = db["groups"]

@router.get("/", response_model=list[GroupResponse])
def get_groups():

    groups = groups_collection.find().sort("created_at", -1)

    return [
        group_helper(group)
        for group in groups
    ]


@router.post("/", response_model=GroupResponse)
def create_group(group: GroupCreate):

    existing_group = groups_collection.find_one({
        "name": group.name
    })

    if existing_group:
        raise HTTPException(
            status_code=400,
            detail="Group already exists"
        )

    group_data = create_group_document(
        group.model_dump()
    )

    try:
        groups_collection.insert_one(group_data)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail="Group already exists"
        )

    return group_helper(group_data)