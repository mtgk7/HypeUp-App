from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.models.schemas import RegisterRequest, LoginRequest, TokenResponse, UserOut
from app.database import get_supabase
from app.utils.auth import hash_password, verify_password, create_token, get_current_user
from app.config import get_settings
from app.routers.notifications import create_notification
import secrets


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest):
    db = get_supabase()
    s = get_settings()

    existing = db.table("users").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Bu e-posta zaten kayıtlı")

    # Referans kodu kontrol
    referrer_id = None
    if body.ref_code:
        ref_result = db.table("users").select("id").eq("referral_code", body.ref_code).limit(1).execute()
        if ref_result.data:
            referrer_id = ref_result.data[0]["id"]

    new_ref_code = secrets.token_hex(4)  # 8 karakter benzersiz kod

    new_user = db.table("users").insert({
        "email": body.email,
        "password_hash": hash_password(body.password),
        "referral_code": new_ref_code,
        "referred_by": referrer_id,
    }).execute()

    user = new_user.data[0]
    current_balance = float(user["balance"])

    # Referans bonusu
    if referrer_id:
        bonus = s.REFERRAL_BONUS_TL
        # Yeni kullanıcıya bonus
        current_balance = round(current_balance + bonus, 2)
        db.table("users").update({"balance": current_balance}).eq("id", user["id"]).execute()
        # Referans verene bonus
        ref_user = db.table("users").select("balance").eq("id", referrer_id).limit(1).execute()
        if ref_user.data:
            new_ref_balance = round(float(ref_user.data[0]["balance"]) + bonus, 2)
            db.table("users").update({"balance": new_ref_balance}).eq("id", referrer_id).execute()
            create_notification(
                referrer_id,
                "Referans Bonusu 🎉",
                f"Davet ettiğin kişi kayıt oldu! ₺{bonus:.0f} bonus hesabına eklendi.",
                "success",
            )

    token = create_token(user["id"], user["role"])
    return TokenResponse(
        access_token=token,
        user_id=user["id"],
        role=user["role"],
        balance=current_balance,
        referral_code=new_ref_code,
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    db = get_supabase()

    result = db.table("users").select("*").eq("email", body.email).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Geçersiz e-posta veya şifre")

    user = result.data[0]

    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Geçersiz e-posta veya şifre")

    if not user.get("is_active"):
        raise HTTPException(status_code=403, detail="Hesabınız devre dışı bırakıldı")

    token = create_token(user["id"], user["role"])

    return TokenResponse(
        access_token=token,
        user_id=user["id"],
        role=user["role"],
        balance=float(user["balance"]),
    )


@router.patch("/change-password")
async def change_password(body: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    db = get_supabase()
    if not verify_password(body.old_password, current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı")
    new_hash = hash_password(body.new_password)
    db.table("users").update({"password_hash": new_hash}).eq("id", current_user["id"]).execute()
    return {"ok": True}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Giriş yapan kullanıcının güncel profili (bakiye dahil)."""
    return UserOut(
        id=current_user["id"],
        email=current_user["email"],
        balance=float(current_user["balance"]),
        role=current_user["role"],
        is_active=current_user["is_active"],
        created_at=current_user["created_at"],
    )
