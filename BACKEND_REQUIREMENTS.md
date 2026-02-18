# Backend API Requirements & Fixes

This document outlines the required backend changes to ensure the frontend works correctly.

## 🚨 CRITICAL FIXES REQUIRED

### 1. **Add Missing User IDs to API Responses**

#### Farmer Listings (`GET /marketplace/farmer/getAllListing`)
**Current Issue:** Listings don't include `farmerId`

**Required Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "listing123",
      "farmerId": "farmer456",  // ← ADD THIS
      "cropId": "crop789",
      "marketId": "market012",
      "quantity": 100,
      "unit": "kg",
      "pricePerUnit": 50,
      "status": "available",
      "images": ["url1", "url2"]
    }
  ]
}
```

#### Buyer Demands (`GET /marketplace/buyer/all`)
**Current Issue:** Demands don't include `buyerId`

**Required Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "demand123",
      "buyerId": "buyer456",  // ← ADD THIS
      "cropId": "crop789",
      "marketId": "market012",
      "quantity": 100,
      "unit": "kg",
      "expectedPrice": 50,
      "Status": "active"
    }
  ]
}
```

---

### 2. **Ensure Demand IDs are Returned**

**Issue:** Some demands don't have `_id` field in responses

**Fix:** Ensure ALL demand documents include `_id` in responses

---

### 3. **Implement Missing Notification Endpoints**

#### Mark Notification as Read
```
PATCH /notifications/read/:notificationId
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### Mark All Notifications as Read
```
PATCH /notifications/read-all/:userId
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### Delete Notification
```
DELETE /notifications/:notificationId
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

### 4. **Add Missing Connection Endpoints**

#### Get User's Established Connections
```
GET /connections/user/:userId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "connection123",
      "user1Id": "user456",
      "user1": { "_id": "user456", "name": "John Doe", "role": "farmer" },
      "user2Id": "user789",
      "user2": { "_id": "user789", "name": "Jane Smith", "role": "buyer" },
      "connectedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Remove/Delete Connection
```
DELETE /connections/:connectionId
```

**Response:**
```json
{
  "success": true,
  "message": "Connection removed"
}
```

---

### 5. **Fix Connection Request Endpoint**

**Current Endpoint:** `POST /connections/send`

**Expected Request Body:**
```json
{
  "recipientId": "user123",
  "recipientRole": "farmer",  // or "buyer"
  "message": "I'd like to connect with you",
  "relatedTo": {
    "type": "listing",  // or "demand"
    "id": "listing123"
  }
}
```

**Notes:**
- Should auto-populate `senderId` from authenticated user
- Should auto-populate `senderRole` from user's role

---

### 6. **Standardize API Response Format**

All endpoints should return consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

Or for errors:

```json
{
  "success": false,
  "error": "Error message",
  "message": "User-friendly error message"
}
```

---

### 7. **Populate Related Data in Responses**

#### Farmer Listings
Populate `cropId` and `marketId`:
```json
{
  "cropId": {
    "_id": "crop123",
    "cropName": "Wheat",
    "category": "Grain"
  },
  "marketId": {
    "_id": "market456",
    "marketName": "Delhi Mandi",
    "city": "Delhi"
  }
}
```

#### Connection Requests
Populate `sender` and `recipient`:
```json
{
  "senderId": "user123",
  "sender": {
    "_id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "recipientId": "user456",
  "recipient": {
    "_id": "user456",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9876543211"
  }
}
```

---

## 📋 NICE TO HAVE (Future Enhancements)

### 1. **Pagination Support**

Add pagination to all list endpoints:

```
GET /marketplace/farmer/getAllListing?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 2. **Email Verification Flow**

- Implement email verification after signup
- Add endpoint to resend verification email
- Add endpoint to verify email token

### 3. **Token Refresh Mechanism**

- Implement refresh tokens
- Add endpoint to refresh access token
- Handle token expiration gracefully

### 4. **Search and Filter Endpoints**

```
GET /marketplace/farmer/search?crop=wheat&location=delhi&minPrice=40&maxPrice=60
```

### 5. **Analytics Endpoints**

```
GET /farmer/analytics/:farmerId
```

**Response:**
```json
{
  "totalListings": 15,
  "activeListings": 10,
  "soldListings": 5,
  "totalRevenue": 125000,
  "popularCrops": ["Wheat", "Rice"],
  "monthlyStats": [...]
}
```

---

## 🔧 FIELD NAMING CONVENTIONS

**Recommendation:** Use consistent naming across all endpoints

### Option 1: camelCase (Recommended)
```json
{
  "farmerId": "...",
  "cropId": "...",
  "expectedPrice": 50
}
```

### Option 2: PascalCase (Current inconsistent usage)
```json
{
  "FarmerId": "...",
  "CropId": "...",
  "ExpectedPrice": 50
}
```

**Choose one convention and apply it consistently across ALL endpoints.**

---

## 📝 Testing Checklist

After implementing fixes, test:

- [ ] Farmer listings include `farmerId`
- [ ] Buyer demands include `buyerId`
- [ ] All demands have `_id` field
- [ ] Notification mark as read works
- [ ] Notification delete works
- [ ] Connection requests properly populate sender/recipient
- [ ] Get connections list works
- [ ] Image upload returns URL and publicId
- [ ] All responses follow standard format

---

## 🎯 Priority Order

1. **Immediate (Week 1)**
   - Add `farmerId` to farmer listings
   - Add `buyerId` to buyer demands
   - Ensure all demands have `_id`
   - Fix connection request endpoint

2. **High Priority (Week 2)**
   - Implement notification CRUD operations
   - Add connections list endpoint
   - Standardize response formats

3. **Medium Priority (Week 3-4)**
   - Add pagination
   - Implement search/filter
   - Add data population

4. **Future Enhancements**
   - Email verification
   - Token refresh
   - Analytics endpoints
