from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import RegisterRequest, LoginRequest, TokenResponse, UserOut
from app.database import get_supabase
from app.utils.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest):
    db = get_supabase()

    # Email daha önce alınmış mı?
    existing = db.table("users").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Bu e-posta zaten kayıtlı")

    # Kullanıcı oluştur (DB trigger 50 TL bakiye ekler)
    new_user = db.table("users").insert({
        "email": body.email,
        "password_hash": hash_password(body.password),
    }).execute()

    user = new_user.data[0]
    token = create_token(user["id"], user["role"])

    return TokenResponse(
        access_token=token,
        user_id=user["id"],
        role=user["role"],
        balance=float(user["balance"]),
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
