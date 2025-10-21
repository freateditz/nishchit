from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'nishchit-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI()

# Create API router
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    aadhaar: Optional[str] = None
    name: str
    phone: str
    role: str  # citizen, dealer, admin
    region: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LoginRequest(BaseModel):
    identifier: str  # email or aadhaar
    
class OTPVerifyRequest(BaseModel):
    identifier: str
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class Entitlement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    citizen_id: str
    ration_card_number: str
    items: Dict[str, float]  # {"rice": 5.0, "wheat": 10.0, "sugar": 2.0, "kerosene": 3.0}
    month: int
    year: int
    status: str  # pending, delivered
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Delivery(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    entitlement_id: str
    dealer_id: str
    citizen_id: str
    delivery_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    proof: Optional[str] = None  # base64 image
    status: str
    remarks: Optional[str] = None

class Complaint(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    citizen_id: str
    subject: str
    description: str
    status: str = "open"  # open, resolved
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    resolved_at: Optional[str] = None

class ComplaintCreate(BaseModel):
    subject: str
    description: str

class DeliveryCreate(BaseModel):
    entitlement_id: str
    proof: Optional[str] = None
    remarks: Optional[str] = None

# Helper Functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# Initialize dummy data
async def init_dummy_data():
    # Check if data already exists
    user_count = await db.users.count_documents({})
    if user_count > 0:
        return
    
    # Create users
    users_data = [
        {"id": "citizen1", "email": "rajesh@example.com", "aadhaar": "123456789012", "name": "Rajesh Kumar", "phone": "9876543210", "role": "citizen", "region": "North Delhi", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "citizen2", "email": "priya@example.com", "aadhaar": "234567890123", "name": "Priya Singh", "phone": "9876543211", "role": "citizen", "region": "South Delhi", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "citizen3", "email": "amit@example.com", "aadhaar": "345678901234", "name": "Amit Sharma", "phone": "9876543212", "role": "citizen", "region": "East Delhi", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "citizen4", "email": "sunita@example.com", "aadhaar": "456789012345", "name": "Sunita Devi", "phone": "9876543213", "role": "citizen", "region": "West Delhi", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "citizen5", "email": "ramesh@example.com", "aadhaar": "567890123456", "name": "Ramesh Yadav", "phone": "9876543214", "role": "citizen", "region": "Central Delhi", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "dealer1", "email": "dealer1@example.com", "aadhaar": "678901234567", "name": "Manoj Verma", "phone": "9876543215", "role": "dealer", "region": "North Delhi", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "dealer2", "email": "dealer2@example.com", "aadhaar": "789012345678", "name": "Sanjay Gupta", "phone": "9876543216", "role": "dealer", "region": "South Delhi", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "admin1", "email": "admin@example.com", "aadhaar": "890123456789", "name": "Admin User", "phone": "9876543217", "role": "admin", "region": "All Delhi", "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.users.insert_many(users_data)
    
    # Create entitlements
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    entitlements_data = [
        {"id": "ent1", "citizen_id": "citizen1", "ration_card_number": "RC001234", "items": {"rice": 5.0, "wheat": 10.0, "sugar": 2.0, "kerosene": 3.0}, "month": current_month, "year": current_year, "status": "delivered", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "ent2", "citizen_id": "citizen2", "ration_card_number": "RC002345", "items": {"rice": 5.0, "wheat": 10.0, "sugar": 2.0, "kerosene": 3.0}, "month": current_month, "year": current_year, "status": "pending", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "ent3", "citizen_id": "citizen3", "ration_card_number": "RC003456", "items": {"rice": 5.0, "wheat": 10.0, "sugar": 2.0, "kerosene": 3.0}, "month": current_month, "year": current_year, "status": "delivered", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "ent4", "citizen_id": "citizen4", "ration_card_number": "RC004567", "items": {"rice": 5.0, "wheat": 10.0, "sugar": 2.0, "kerosene": 3.0}, "month": current_month, "year": current_year, "status": "pending", "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "ent5", "citizen_id": "citizen5", "ration_card_number": "RC005678", "items": {"rice": 5.0, "wheat": 10.0, "sugar": 2.0, "kerosene": 3.0}, "month": current_month, "year": current_year, "status": "delivered", "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.entitlements.insert_many(entitlements_data)
    
    # Create deliveries for delivered entitlements
    deliveries_data = [
        {"id": "del1", "entitlement_id": "ent1", "dealer_id": "dealer1", "citizen_id": "citizen1", "delivery_date": datetime.now(timezone.utc).isoformat(), "proof": None, "status": "delivered", "remarks": "Delivered successfully"},
        {"id": "del2", "entitlement_id": "ent3", "dealer_id": "dealer1", "citizen_id": "citizen3", "delivery_date": datetime.now(timezone.utc).isoformat(), "proof": None, "status": "delivered", "remarks": "Delivered successfully"},
        {"id": "del3", "entitlement_id": "ent5", "dealer_id": "dealer2", "citizen_id": "citizen5", "delivery_date": datetime.now(timezone.utc).isoformat(), "proof": None, "status": "delivered", "remarks": "Delivered successfully"},
    ]
    await db.deliveries.insert_many(deliveries_data)
    
    # Create sample complaints
    complaints_data = [
        {"id": "comp1", "citizen_id": "citizen2", "subject": "Ration not received", "description": "I have not received my ration for this month yet.", "status": "open", "created_at": datetime.now(timezone.utc).isoformat(), "resolved_at": None},
        {"id": "comp2", "citizen_id": "citizen4", "subject": "Quantity mismatch", "description": "Received less quantity than entitled.", "status": "open", "created_at": datetime.now(timezone.utc).isoformat(), "resolved_at": None},
    ]
    await db.complaints.insert_many(complaints_data)

@app.on_event("startup")
async def startup_event():
    await init_dummy_data()
    logger.info("Dummy data initialized")

# Auth Routes
@api_router.post("/auth/login")
async def login(request: LoginRequest):
    """Send OTP (mock - always returns 1234)"""
    # Check if user exists
    user = await db.users.find_one(
        {"$or": [{"email": request.identifier}, {"aadhaar": request.identifier}]},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mock OTP - always 1234
    return {"message": "OTP sent successfully", "otp": "1234", "identifier": request.identifier}

@api_router.post("/auth/verify-otp", response_model=TokenResponse)
async def verify_otp(request: OTPVerifyRequest):
    """Verify OTP and return token"""
    # Mock OTP verification - accept 1234
    if request.otp != "1234":
        raise HTTPException(status_code=401, detail="Invalid OTP")
    
    # Find user
    user = await db.users.find_one(
        {"$or": [{"email": request.identifier}, {"aadhaar": request.identifier}]},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create token
    access_token = create_access_token(data={"sub": user["id"], "role": user["role"]})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=User(**user)
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

# Citizen Routes
@api_router.get("/citizen/entitlement")
async def get_citizen_entitlement(current_user: User = Depends(get_current_user)):
    """Get citizen's current month entitlement"""
    if current_user.role != "citizen":
        raise HTTPException(status_code=403, detail="Access denied")
    
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    entitlement = await db.entitlements.find_one(
        {"citizen_id": current_user.id, "month": current_month, "year": current_year},
        {"_id": 0}
    )
    
    if not entitlement:
        raise HTTPException(status_code=404, detail="No entitlement found for current month")
    
    return entitlement

@api_router.get("/citizen/status")
async def get_citizen_status(current_user: User = Depends(get_current_user)):
    """Get citizen's monthly status and history"""
    if current_user.role != "citizen":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get all entitlements
    entitlements = await db.entitlements.find(
        {"citizen_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Get delivery details for delivered entitlements
    for ent in entitlements:
        if ent["status"] == "delivered":
            delivery = await db.deliveries.find_one(
                {"entitlement_id": ent["id"]},
                {"_id": 0}
            )
            ent["delivery_info"] = delivery
    
    return {"entitlements": entitlements}

@api_router.post("/citizen/complaint")
async def create_complaint(complaint: ComplaintCreate, current_user: User = Depends(get_current_user)):
    """Create a new complaint"""
    if current_user.role != "citizen":
        raise HTTPException(status_code=403, detail="Access denied")
    
    complaint_obj = Complaint(
        citizen_id=current_user.id,
        subject=complaint.subject,
        description=complaint.description
    )
    
    await db.complaints.insert_one(complaint_obj.model_dump())
    return {"message": "Complaint submitted successfully", "complaint": complaint_obj}

@api_router.get("/citizen/complaints")
async def get_citizen_complaints(current_user: User = Depends(get_current_user)):
    """Get all complaints by citizen"""
    if current_user.role != "citizen":
        raise HTTPException(status_code=403, detail="Access denied")
    
    complaints = await db.complaints.find(
        {"citizen_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"complaints": complaints}

# Dealer Routes
@api_router.get("/dealer/assigned-beneficiaries")
async def get_assigned_beneficiaries(current_user: User = Depends(get_current_user)):
    """Get all beneficiaries assigned to dealer"""
    if current_user.role != "dealer":
        raise HTTPException(status_code=403, detail="Access denied")
    
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    # Get entitlements in dealer's region
    citizens = await db.users.find(
        {"role": "citizen", "region": current_user.region},
        {"_id": 0}
    ).to_list(1000)
    
    citizen_ids = [c["id"] for c in citizens]
    
    entitlements = await db.entitlements.find(
        {"citizen_id": {"$in": citizen_ids}, "month": current_month, "year": current_year},
        {"_id": 0}
    ).to_list(1000)
    
    # Add citizen info to each entitlement
    for ent in entitlements:
        citizen = next((c for c in citizens if c["id"] == ent["citizen_id"]), None)
        ent["citizen_info"] = citizen
        
        # Check if delivery exists
        delivery = await db.deliveries.find_one(
            {"entitlement_id": ent["id"]},
            {"_id": 0}
        )
        ent["delivery_info"] = delivery
    
    return {"beneficiaries": entitlements}

@api_router.post("/dealer/mark-delivery")
async def mark_delivery(delivery: DeliveryCreate, current_user: User = Depends(get_current_user)):
    """Mark an entitlement as delivered"""
    if current_user.role != "dealer":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get entitlement
    entitlement = await db.entitlements.find_one(
        {"id": delivery.entitlement_id},
        {"_id": 0}
    )
    
    if not entitlement:
        raise HTTPException(status_code=404, detail="Entitlement not found")
    
    # Check if already delivered
    existing_delivery = await db.deliveries.find_one({"entitlement_id": delivery.entitlement_id})
    if existing_delivery:
        raise HTTPException(status_code=400, detail="Already marked as delivered")
    
    # Create delivery record
    delivery_obj = Delivery(
        entitlement_id=delivery.entitlement_id,
        dealer_id=current_user.id,
        citizen_id=entitlement["citizen_id"],
        proof=delivery.proof,
        status="delivered",
        remarks=delivery.remarks
    )
    
    await db.deliveries.insert_one(delivery_obj.model_dump())
    
    # Update entitlement status
    await db.entitlements.update_one(
        {"id": delivery.entitlement_id},
        {"$set": {"status": "delivered"}}
    )
    
    return {"message": "Delivery marked successfully", "delivery": delivery_obj}

@api_router.get("/dealer/stats")
async def get_dealer_stats(current_user: User = Depends(get_current_user)):
    """Get dealer statistics"""
    if current_user.role != "dealer":
        raise HTTPException(status_code=403, detail="Access denied")
    
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    # Get all entitlements in dealer's region
    citizens = await db.users.find(
        {"role": "citizen", "region": current_user.region},
        {"_id": 0}
    ).to_list(1000)
    
    citizen_ids = [c["id"] for c in citizens]
    
    total_assigned = await db.entitlements.count_documents(
        {"citizen_id": {"$in": citizen_ids}, "month": current_month, "year": current_year}
    )
    
    delivered = await db.entitlements.count_documents(
        {"citizen_id": {"$in": citizen_ids}, "month": current_month, "year": current_year, "status": "delivered"}
    )
    
    pending = total_assigned - delivered
    
    return {
        "total_assigned": total_assigned,
        "delivered": delivered,
        "pending": pending
    }

# Admin Routes
@api_router.get("/admin/analytics")
async def get_admin_analytics(current_user: User = Depends(get_current_user)):
    """Get overall analytics"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    # Total citizens
    total_citizens = await db.users.count_documents({"role": "citizen"})
    
    # Total dealers
    total_dealers = await db.users.count_documents({"role": "dealer"})
    
    # Total entitlements this month
    total_entitlements = await db.entitlements.count_documents(
        {"month": current_month, "year": current_year}
    )
    
    # Delivered this month
    delivered = await db.entitlements.count_documents(
        {"month": current_month, "year": current_year, "status": "delivered"}
    )
    
    # Pending this month
    pending = total_entitlements - delivered
    
    # Open complaints
    open_complaints = await db.complaints.count_documents({"status": "open"})
    
    # Resolved complaints
    resolved_complaints = await db.complaints.count_documents({"status": "resolved"})
    
    return {
        "total_citizens": total_citizens,
        "total_dealers": total_dealers,
        "total_entitlements": total_entitlements,
        "delivered": delivered,
        "pending": pending,
        "open_complaints": open_complaints,
        "resolved_complaints": resolved_complaints,
        "delivery_percentage": round((delivered / total_entitlements * 100) if total_entitlements > 0 else 0, 2)
    }

@api_router.get("/admin/complaints")
async def get_all_complaints(current_user: User = Depends(get_current_user)):
    """Get all complaints"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    complaints = await db.complaints.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Add citizen info
    for complaint in complaints:
        citizen = await db.users.find_one(
            {"id": complaint["citizen_id"]},
            {"_id": 0, "name": 1, "phone": 1, "email": 1}
        )
        complaint["citizen_info"] = citizen
    
    return {"complaints": complaints}

@api_router.get("/admin/region-stats")
async def get_region_stats(current_user: User = Depends(get_current_user)):
    """Get region-wise statistics"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    # Get all regions
    regions = ["North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"]
    
    region_data = []
    for region in regions:
        # Get citizens in region
        citizens = await db.users.find(
            {"role": "citizen", "region": region},
            {"_id": 0}
        ).to_list(1000)
        
        citizen_ids = [c["id"] for c in citizens]
        
        total = await db.entitlements.count_documents(
            {"citizen_id": {"$in": citizen_ids}, "month": current_month, "year": current_year}
        )
        
        delivered = await db.entitlements.count_documents(
            {"citizen_id": {"$in": citizen_ids}, "month": current_month, "year": current_year, "status": "delivered"}
        )
        
        pending = total - delivered
        
        region_data.append({
            "region": region,
            "total": total,
            "delivered": delivered,
            "pending": pending,
            "percentage": round((delivered / total * 100) if total > 0 else 0, 2)
        })
    
    return {"regions": region_data}

@api_router.post("/admin/resolve-complaint/{complaint_id}")
async def resolve_complaint(complaint_id: str, current_user: User = Depends(get_current_user)):
    """Resolve a complaint"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.complaints.update_one(
        {"id": complaint_id},
        {"$set": {"status": "resolved", "resolved_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    return {"message": "Complaint resolved successfully"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()