from __future__ import annotations

from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    id: int
    username: str
    displayName: Optional[str] = None
    avatarUrl: Optional[str] = None
    email: Optional[str] = None
    createdAt: str
    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    token: str
    user: UserResponse


class ReviewCreate(BaseModel):
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    userId: int
    username: str
    modelId: str
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    createdAt: str


class FavoriteResponse(BaseModel):
    modelId: str
    createdAt: str


class SavedComparisonCreate(BaseModel):
    name: str
    modelIds: list[str]
    notes: Optional[str] = None


class SavedComparisonResponse(BaseModel):
    id: int
    name: str
    modelIds: list[str]
    notes: Optional[str] = None
    createdAt: str
