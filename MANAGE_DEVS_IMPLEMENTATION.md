# Manage Developers - Frontend Implementation

## Overview
Created a complete developer management system for clients to search, view, and connect with developers.

---

## Backend API Requirements

### 1. Get Connected Developers
**Endpoint**: `GET /clients/connected-devs`

**Query Parameters**:
```typescript
{
  page?: number;      // Default: 1
  limit?: number;     // Default: 20
}
```

**Response**:
```typescript
{
  success: true,
  message: "Connected developers fetched successfully",
  data: {
    developers: Developer[],
    pagination: {
      currentPage: number,
      totalPages: number,
      totalCount: number,
      limit: number,
      hasNextPage: boolean,
      hasPrevPage: boolean
    }
  }
}
```

---

### 2. Search Developers
**Endpoint**: `GET /clients/search-dev`

**Query Parameters**:
```typescript
{
  page?: number;              // Default: 1
  limit?: number;             // Default: 20
  search?: string;            // Search by name, email, or skills
  availability?: "available" | "offline" | "busy";
  experienceLevel?: "junior" | "mid" | "senior";
}
```

**Backend Logic**:
- **search**: Match against `name`, `email`, or `skills` array
- **experienceLevel**:
  - `junior`: 0-2 years
  - `mid`: 3-5 years  
  - `senior`: 6+ years

**Response**: Same structure as connected-devs endpoint

---

### 3. Get Developer Profile (Public)
**Endpoint**: `GET /profile/:devId`

**Parameters**:
- `devId`: Developer's MongoDB ObjectId

**Response**:
```typescript
{
  success: true,
  message: "Developer profile fetched successfully",
  data: {
    developer: Developer
  }
}
```

**Important**: 
- Do NOT send `password`, `keys`, `isVerified`, `instantProjectsEnabled` fields
- This endpoint should be **public** (no authentication required)

---

## Developer Type Definition

```typescript
interface Developer {
  _id: string;
  name: string;
  email: string;
  profileImg?: string;
  phone?: string;
  company?: string;
  address?: string;
  skills?: string[];
  experience?: number;                    // Years of experience
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  media?: MediaType[];
  projectsCompleted?: string[];           // Array of project IDs
  reviews?: ReviewType[];
  hourlyRate?: number;
  availability?: "available" | "offline" | "busy";
}

interface MediaType {
  url: string;
  type: string;                          // MIME type: "image/png", "application/pdf", etc.
}

interface ReviewType {
  _id: string;
  clientId: string;
  rating: number;                        // 1-5
  comment: string;
  createdAt: string;                     // ISO date string
}
```

---

## Features Implemented

### ManageDevs Page
- **Two Tabs**: Connected Developers & Search Developers
- **Pagination**: 20 developers per page
- **Search**: By name, email, or skills
- **Filters**: 
  - Availability (Available/Busy/Offline)
  - Experience Level (Junior/Mid/Senior)

### Developer Card
Displays:
- Avatar/Profile Image
- Name & Company
- Availability badge
- Skills (top 4)
- Experience, Hourly Rate, Rating
- Location
- "Message" button → redirects to `/chat/:devId`
- Click anywhere → navigates to `/profile/:devId`

### Developer Profile Page
Public route at `/profile/:devId`

Sections:
1. **Header**: Avatar, name, availability, experience, rating, projects count
2. **About**: Location information
3. **Skills**: All skills as badges
4. **Portfolio**: Links (portfolio/GitHub/LinkedIn) + work samples gallery
5. **Reviews**: Client reviews with ratings and comments
6. **Contact Sidebar**: Hourly rate, email, phone, message button, quick stats

---

## Example API Calls

### 1. Get Connected Developers (Page 1)
```
GET /clients/connected-devs?page=1&limit=20
```

### 2. Search "React developers, available, senior level"
```
GET /clients/search-dev?search=react&availability=available&experienceLevel=senior&page=1&limit=20
```

### 3. Get Developer Profile
```
GET /profile/507f1f77bcf86cd799439011
```

---

## Notes
- All endpoints use standard pagination structure
- Connected developers should only show devs the client has worked with (based on project history)
- Search endpoint should return all developers (not just connected ones)
- Profile endpoint is public - any user can view any developer's profile
- `keys` field should NEVER be sent in these endpoints (only in messaging/authentication contexts)
