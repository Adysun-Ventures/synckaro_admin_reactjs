# SyncKaro Platform - AI Agent Context Guide

> **Last Updated:** October 30, 2025  
> **Version:** 1.0.0  
> **Purpose:** This document provides comprehensive context for AI agents working on the SyncKaro platform. Read this thoroughly before making any changes.

---

## 🎯 Project Overview

**SyncKaro** is a **Copy Trading / Social Trading Platform** that enables teachers (experienced traders) to share their trades with students (follower traders) in real-time. The platform consists of three separate applications serving different user roles.

### Platform Purpose
- Teachers execute trades that are automatically copied to their students' accounts
- Admins monitor all activity, trades, and statistics across the platform
- Students follow teachers, manage their profiles, and view their trading performance

---

## 🏗️ Architecture

### Three-App Ecosystem

```
SyncKaro/
├── synckaro_admin_nextjs/        # Admin Dashboard (Web)
├── synckaro_teacher_nextjs/      # Teacher Dashboard (Web)
└── synckaro_student_reactnative/ # Student App (Mobile)
```

### Tech Stack

| Module | Framework | Styling | State Management |
|--------|-----------|---------|------------------|
| **Admin** | Next.js 14+ (App Router) | TailwindCSS + Headless UI* | Local Storage (for now) |
| **Teacher** | Next.js 14+ (App Router) | TailwindCSS + Headless UI* | Local Storage (for now) |
| **Student** | React Native Expo | Nativewind | Local Storage (for now) |

**Note:** Headless UI will be tested in Admin first. May switch to other library or custom components if needed.

### Key Technologies
- **TypeScript**: Strictly typed across all apps
- **Axios**: HTTP client with interceptors for API calls
- **localStorage**: Client-side storage for local-first approach
- **Headless UI**: Accessible, unstyled components (trial phase)
- **Heroicons**: Icon library from Tailwind creators (includes Rupee icons for India)
- **TailwindCSS**: Utility-first CSS framework

### State Management (Future Implementation)
- **TanStack Query** or **Zustand** will be evaluated and implemented during actual API integration
- Pros/cons will be assessed when backend integration begins
- For now, use localStorage for all data persistence

### Backend Architecture
- **Backend already exists** - Focus on frontend development only
- **Local-first approach**: Start with localStorage, migrate to API later
- Axios client with interceptors ready for future API integration
- Authentication currently handled via localStorage

---

## 👥 Module Requirements

### 1️⃣ Admin Module

**Purpose:** Read-only dashboard for platform oversight and monitoring

#### Access Rights
- ✅ **CAN DO:**
  - View all teachers and their details
  - View all students associated with any teacher
  - View stats for any teacher or student
  - View activity logs
  - Delete teachers (with confirmation)
  - See all trades across the platform

- ❌ **CANNOT DO:**
  - Create or update teachers (teachers self-onboard via signup)
  - Modify any trading settings
  - Execute trades

#### UI Components

**Teacher List Page (Gmail-style UI)**
```
┌─────────────────────────────────────────────────────────────────┐
│ [☐] Bulk Actions ▼                              🔍 Search       │
├─────────────────────────────────────────────────────────────────┤
│ [☐] John Doe        john@example.com   15   243  Active  [⋮]   │
│ [☐] Jane Smith      jane@example.com   28   567  Active  [⋮]   │
│ [☐] Mike Johnson    mike@example.com    8   128  Inactive [⋮]  │
└─────────────────────────────────────────────────────────────────┘
     │        │              │            │    │      │      │
     │        │              │            │    │      │      └─ Actions Menu
     │        │              │            │    │      └──────── Status
     │        │              │            │    └───────────── Total Trades
     │        │              │            └────────────────── Total Students
     │        │              └─────────────────────────────── Email
     │        └────────────────────────────────────────────── Name
     └─────────────────────────────────────────────────────── Bulk Selection
```

**Table Columns:**
- **Bulk Selection Checkbox** (left-most)
- **Name** - Teacher's full name
- **Email** - Teacher's email address
- **Total Students** - Count of associated students
- **Total Trades** - Total number of trades executed
- **Status** - Active/Inactive badge
- **Actions** (right-most) - Dropdown menu with:
  - 👁️ View (Teacher details page)
  - 📊 Stats (Statistics dashboard)
  - 📝 Logs (Activity logs)
  - 🗑️ Delete (with confirmation modal)

**Bulk Actions:**
- Delete selected teachers (with confirmation)
- Export selected teachers data
- More actions as needed

#### Pages Structure
```
app/
├── page.tsx                      # Dashboard overview
├── teachers/
│   ├── page.tsx                  # Teacher list (Gmail-style)
│   └── [id]/
│       ├── page.tsx              # Teacher details + associated students
│       ├── stats/page.tsx        # Teacher statistics
│       └── logs/page.tsx         # Activity logs
└── settings/page.tsx             # Admin settings
```

---

### 2️⃣ Teacher Module

**Purpose:** Trading dashboard for teachers to manage students, execute trades, and manage broker connections

#### Platform Restrictions
- ⚠️ **Desktop/Tablet ONLY** - Minimum width: 768px (tablet breakpoint)
- On screens < 768px width: Show full-screen blocking overlay
- Block message: "Teacher dashboard requires desktop or tablet screen. Please use a larger device."
- Reference: Similar to mobile blocking implementations on trading platforms

#### Access Rights
- ✅ **CAN DO:**
  - Create, update, delete students
  - Bulk upload students via CSV
  - Bulk operations on students (activate, deactivate, delete)
  - Add/update broker credentials (own + students)
  - Send connection requests to zombie students
  - Accept/reject student connection requests
  - Execute trades (automatically copied to students)
  - Use panic button to close all trades
  - View own statistics and performance

- ❌ **CANNOT DO:**
  - Send connection requests to students already associated with another teacher
  - View other teachers' data

#### Student Management

**Create Student Form Fields:**
```typescript
interface StudentFormData {
  // Personal Information
  name: string;           // Full name
  email: string;          // Email address (unique)
  phone: string;          // Phone number with country code
  
  // Broker Configuration
  brokerName: string;     // Broker provider (dropdown)
  brokerApiKey: string;   // API key from broker
  brokerApiSecret: string; // API secret from broker
  
  // Trading Configuration
  initialCapital: number; // Starting capital amount
  riskPercentage: number; // Risk per trade (0-100)
  strategy: string;       // Trading strategy (dropdown or text)
  
  // Status
  isActive: boolean;      // Active/Inactive status
}
```

**Student List View (Gmail-style):**
```
┌─────────────────────────────────────────────────────────────────────┐
│ [☐] Bulk Actions ▼   [+ Add Student] [📤 Bulk Upload]   🔍 Search  │
├─────────────────────────────────────────────────────────────────────┤
│ [☐] Alice Brown    alice@email.com   ₹50,000  [⚪Active]  [⋮]      │
│ [☐] Bob Wilson     bob@email.com     ₹75,000  [⚪Active]  [⋮]      │
│ [☐] Carol Davis    carol@email.com   ₹30,000  [⚫Inactive] [⋮]     │
└─────────────────────────────────────────────────────────────────────┘
```

**Toggle Button for Status:**
- Each student row has a toggle switch: `[⚪ Active]` / `[⚫ Inactive]`
- Clicking toggles student's trading status immediately
- Show confirmation if trade is currently active

**Bulk Operations:**
- Activate selected students
- Deactivate selected students
- Delete selected students (with confirmation)
- Update broker settings for selected students

**Bulk CSV Upload:**
- CSV format with headers matching StudentFormData
- Validation before import
- Show preview of data to be imported
- Error handling for invalid rows
- Success/failure report after import

#### Connection Request Management

**Two Types of Requests:**

1. **Incoming Requests (from students):**
   - Student sends request to teacher
   - Teacher can Accept or Reject
   - Show student's profile info before accepting
   
2. **Outgoing Requests (to zombie students):**
   - Teacher can browse zombie students (not associated with any teacher)
   - Teacher sends connection request
   - Student can Accept or Reject
   - Cannot send request to students already with another teacher

**Connection Rules:**
- ✅ Student can leave teacher anytime (no approval needed)
- ✅ Teacher can send request to zombie students only
- ✅ Student needs teacher approval to join
- ❌ Teacher cannot send request to already-associated students
- ❌ Student cannot be associated with multiple teachers simultaneously

#### Broker Management

**Broker Form Fields:**
```typescript
interface BrokerConfig {
  brokerProvider: string;     // e.g., Zerodha, Upstox, Angel One
  apiKey: string;             // API key from broker
  apiSecret: string;          // API secret key
  accessToken?: string;       // OAuth access token (if applicable)
  additionalCredentials?: {   // Provider-specific fields
    [key: string]: string;
  };
}
```

**Features:**
- Configure own broker as teacher
- Configure broker for each student individually
- Test broker connection (live verification button)
- Update broker credentials
- Show connection status: Connected ✅ / Disconnected ❌

#### Trading Interface

**Trade Execution Form:**
```typescript
interface TradeFormData {
  stock: string;          // Stock symbol (with autocomplete search)
  quantity: number;       // Number of shares
  exchange: 'NSE' | 'BSE'; // Stock exchange selection
  orderType: 'BUY' | 'SELL'; // Order type
  price?: number;         // Price (optional for market orders)
}
```

**Stock Search:**
- Autocomplete input
- Search by symbol or company name
- Show stock details on selection (current price, change %)

**Exchange Selection:**
- Radio buttons or dropdown: NSE / BSE
- Some stocks may be on both exchanges

**🚨 Panic Button:**
- Prominent red button (always visible during trading hours)
- Confirmation modal: "Are you sure you want to close ALL trades?"
- Closes all open positions for:
  - Teacher's own trades
  - All associated students' trades
- Emergency feature for market panic situations
- Show confirmation with list of trades to be closed

#### Pages Structure
```
app/
├── page.tsx                      # Dashboard overview
├── students/
│   ├── page.tsx                  # Student list (Gmail-style)
│   ├── create/page.tsx           # Create student form
│   ├── bulk-upload/page.tsx      # CSV bulk upload
│   └── [id]/
│       ├── page.tsx              # Student details
│       └── edit/page.tsx         # Edit student
├── connections/
│   ├── incoming/page.tsx         # Incoming requests from students
│   ├── outgoing/page.tsx         # Outgoing requests to zombies
│   └── search/page.tsx           # Search zombie students
├── broker/
│   ├── page.tsx                  # Own broker configuration
│   └── students/[id]/page.tsx    # Student broker config
├── trading/
│   ├── page.tsx                  # Trading interface
│   └── history/page.tsx          # Trade history
└── settings/page.tsx             # Teacher settings
```

---

### 3️⃣ Student Module (React Native Expo)

**Purpose:** Mobile app for students to follow teachers, manage profile, and view trading performance

#### Zombie Mode
**Zombie Student = Student NOT associated with any teacher**

- New students start as zombies after signup
- Can browse and search for teachers
- Can send connection requests to any teacher
- Cannot execute manual trades (only follow teacher's trades)

#### Student Capabilities

**Profile Management:**
```typescript
interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  
  // Trading Preferences
  riskTolerance: 'Low' | 'Medium' | 'High';
  tradingGoals: string;
  investmentHorizon: string;
}
```

**Broker Configuration:**
- Add/update broker credentials
- Similar to teacher broker config
- Test connection feature
- View connection status

**Teacher Connection Flow:**

1. **Search Teachers:**
   - Search by name, email, or specialty
   - Filter by performance metrics
   - View teacher profile before connecting

2. **Teacher Profile View:**
   - Teacher's trading statistics
   - Win/loss ratio
   - Number of students
   - Average returns
   - Trading style/strategy
   - Reviews/ratings (if applicable)

3. **Send Connection Request:**
   - Button: "Request to Join"
   - Optional message to teacher
   - Wait for teacher approval

4. **Leave Teacher:**
   - Button: "Leave Teacher"
   - Confirmation modal
   - No approval needed
   - Become zombie student again

**Trade Performance:**
- View own trading history
- P&L (Profit & Loss) summary
- Charts and graphs
- Trade-by-trade breakdown
- Compare with teacher's performance

#### Pages/Screens Structure
```
screens/
├── auth/
│   ├── Login.tsx
│   └── Signup.tsx
├── home/
│   ├── Dashboard.tsx             # Overview
│   └── TradeHistory.tsx          # Trade list
├── profile/
│   ├── ProfileView.tsx
│   └── ProfileEdit.tsx
├── broker/
│   ├── BrokerConfig.tsx
│   └── BrokerTest.tsx
├── teachers/
│   ├── TeacherSearch.tsx
│   ├── TeacherProfile.tsx
│   └── ConnectionRequests.tsx    # Sent requests status
└── performance/
    ├── Statistics.tsx
    └── CompareWithTeacher.tsx
```

#### Mobile-First Considerations
- Use existing Expo boilerplate (separate directory)
- Update `app.json`: slug → "synckaro-student", identifier
- Nativewind already configured
- Basic layout: Header, Footer, Sidebar
- Focus on touch-friendly UI (minimum 44px touch targets)

---

## 🎨 UI/UX Guidelines

### Design Principles
1. **Consistency**: Admin and Teacher apps must have identical UI patterns
2. **Gmail-style Lists**: Bulk selection, action menus, clean layout
3. **Responsive**: Desktop-first for Admin/Teacher, Mobile-first for Student
4. **Accessibility**: Use Headless UI for accessible components
5. **Modern & Clean**: Professional trading dashboard aesthetic

### Component Library Strategy

**Headless UI Components (Trial Phase - Admin First):**
- **Dialog/Modal**: For confirmations, forms, details
- **Menu/Dropdown**: For action menus, filters
- **Listbox/Select**: For dropdowns in forms
- **Switch/Toggle**: For active/inactive status
- **Combobox**: For stock search autocomplete
- **Tab**: For navigation between sections
- **Disclosure**: For expandable sections

**Note:** Headless UI is being tested. If not suitable, will switch to alternative library or build custom components.

**Build Custom When:**
- Specific table layouts (teacher/student lists)
- Bulk selection checkboxes
- Trading interface elements
- Charts and graphs (use recharts or similar)

### Figma Design Reference
- **Client has provided UI designs in Figma**
- Screenshots will be placed in admin folder: `synckaro_admin_nextjs/design-reference/`
- Use Figma for layout positions and component placement
- Implement using TailwindCSS + Headless UI (or chosen library)
- Follow designer's UI/UX patterns and best practices
- Maintain layout structure from Figma to meet client expectations

### Color Scheme (Suggestion - Modify as Needed)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary (Blue)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Success (Green)
        success: {
          500: '#10b981',
          600: '#059669',
        },
        // Danger (Red)
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
        // Warning (Yellow)
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        // Neutral (Gray)
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          500: '#6b7280',
          900: '#111827',
        },
      },
    },
  },
};
```

### Component Patterns

**Action Menu (Headless UI Menu):**
```tsx
<Menu as="div" className="relative">
  <Menu.Button>
    <EllipsisVerticalIcon className="h-5 w-5" />
  </Menu.Button>
  <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg">
    <Menu.Item>
      {({ active }) => (
        <button className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} ...`}>
          View Details
        </button>
      )}
    </Menu.Item>
    {/* More items */}
  </Menu.Items>
</Menu>
```

**Status Toggle:**
```tsx
<Switch
  checked={isActive}
  onChange={handleToggle}
  className={`${isActive ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full`}
>
  <span className={`${isActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
</Switch>
```

**Bulk Selection Checkbox:**
```tsx
<input
  type="checkbox"
  checked={isSelected}
  onChange={handleSelect}
  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
/>
```

---

## 🔧 State Management (Current Approach)

### Local Storage (Phase 1 - Current Implementation)

**Purpose:** Client-side data persistence for local-first approach

**Storage Keys Convention:**
- `syncKaro_auth` - Authentication data (user, token, role)
- `syncKaro_teachers` - Teachers list
- `syncKaro_students` - Students list
- `syncKaro_trades` - Trades data
- `syncKaro_connections` - Connection requests

**Example Implementation:**
```typescript
// lib/storage.ts
export const storage = {
  // Auth
  setAuth: (data: AuthData) => localStorage.setItem('syncKaro_auth', JSON.stringify(data)),
  getAuth: (): AuthData | null => {
    const data = localStorage.getItem('syncKaro_auth');
    return data ? JSON.parse(data) : null;
  },
  clearAuth: () => localStorage.removeItem('syncKaro_auth'),
  
  // Generic CRUD
  setItem: (key: string, value: any) => localStorage.setItem(`syncKaro_${key}`, JSON.stringify(value)),
  getItem: (key: string) => {
    const data = localStorage.getItem(`syncKaro_${key}`);
    return data ? JSON.parse(data) : null;
  },
  removeItem: (key: string) => localStorage.removeItem(`syncKaro_${key}`),
};
```

### Future State Management (Phase 2 - API Integration)

**To Be Decided:** TanStack Query vs Zustand vs Redux
- Pros/cons will be evaluated during API implementation
- Decision based on:
  - Caching requirements
  - Real-time update needs
  - Team familiarity
  - Performance considerations

**For Now:**
- ❌ **DO NOT** implement TanStack Query
- ❌ **DO NOT** implement Zustand
- ✅ **USE** localStorage for all data operations
- ✅ **PREPARE** axios client with interceptors (for future API integration)

---

## 📁 Project Structure

### Admin & Teacher Apps (Next.js)

```
synckaro_admin_nextjs/  (or synckaro_teacher_nextjs/)
├── app/
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home/Dashboard
│   ├── teachers/                   # Teacher pages
│   ├── students/                   # Student pages (teacher only)
│   ├── trading/                    # Trading pages (teacher only)
│   └── api/                        # API routes (if needed)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── teachers/
│   │   ├── TeacherTable.tsx
│   │   ├── TeacherRow.tsx
│   │   └── TeacherStats.tsx
│   ├── students/
│   │   ├── StudentTable.tsx
│   │   ├── StudentRow.tsx
│   │   └── StudentForm.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── BulkActions.tsx
│   │   ├── ActionMenu.tsx
│   │   └── StatusBadge.tsx
│   └── forms/
│       ├── StudentForm.tsx
│       └── BrokerForm.tsx
├── hooks/
│   ├── useLocalStorage.ts          # localStorage hook
│   └── useDebounce.ts
├── lib/
│   ├── api.ts                      # Axios client with interceptors
│   ├── storage.ts                  # localStorage utilities
│   └── utils.ts                    # Utility functions
├── services/
│   ├── authService.ts              # Auth with localStorage
│   ├── teacherService.ts           # Teacher CRUD with localStorage
│   └── studentService.ts           # Student CRUD with localStorage
├── design-reference/               # Figma screenshots folder
│   ├── admin-dashboard.png
│   ├── teacher-list.png
│   └── ... (other design screenshots)
├── types/
│   └── index.ts                    # TypeScript interfaces
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── AGENTS.md                       # This file
└── README.md
```

### Student App (React Native Expo)

```
synckaro_student_reactnative/
├── app/                            # Expo Router (if using)
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── profile/
│   │   ├── broker/
│   │   ├── teachers/
│   │   └── performance/
│   ├── components/
│   │   ├── common/
│   │   ├── teachers/
│   │   └── trades/
│   ├── hooks/
│   │   └── api/
│   ├── stores/
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   ├── utils/
│   └── navigation/
├── assets/
├── app.json                        # Update slug and identifier
├── tailwind.config.js
├── package.json
├── AGENTS.md                       # Copy from admin
└── README.md
```

---

## 🔌 API Integration (Future - Phase 2)

### Axios Client Setup (Prepare but don't use yet)

```typescript
// lib/api.ts
import axios from 'axios';
import { storage } from './storage';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
api.interceptors.request.use((config) => {
  const auth = storage.getAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      storage.clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Note:** This is prepared but not used yet. All operations currently use localStorage.

### API Endpoints (Best Practices Structure - For Future)

**Authentication:**
- `POST /api/auth/signup` - Signup with mobile + OTP
- `POST /api/auth/verify-otp` - Verify OTP during signup
- `POST /api/auth/login` - Login with mobile + OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/logout` - Logout

**Teachers:**
- `GET /api/teachers` - List teachers (with pagination, search)
- `GET /api/teachers/:id` - Get teacher details
- `GET /api/teachers/:id/students` - Get teacher's students
- `GET /api/teachers/:id/stats` - Get teacher statistics
- `GET /api/teachers/:id/logs` - Get teacher activity logs
- `DELETE /api/teachers/:id` - Delete teacher

**Students:**
- `GET /api/students` - List students
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/bulk-upload` - Bulk create via CSV
- `PATCH /api/students/:id/status` - Toggle active/inactive

**Broker:**
- `GET /api/broker/:userId` - Get broker config
- `POST /api/broker/:userId` - Create broker config
- `PUT /api/broker/:userId` - Update broker config
- `POST /api/broker/:userId/test` - Test broker connection

**Trades:**
- `GET /api/trades` - List trades
- `GET /api/trades/:id` - Get trade details
- `POST /api/trades` - Create trade
- `POST /api/trades/panic` - Close all trades (panic button)

**Connection Requests:**
- `GET /api/connections/incoming` - Teacher's incoming requests
- `GET /api/connections/outgoing` - Teacher's outgoing requests
- `POST /api/connections/send` - Send connection request
- `POST /api/connections/:id/accept` - Accept request
- `POST /api/connections/:id/reject` - Reject request
- `DELETE /api/connections/:id` - Student leaves teacher

**Note:** These endpoints follow REST best practices. Adjust based on actual backend structure.

---

## 🔐 Authentication

### Auth Flow

1. **Teacher Signup:**
   - Enter mobile number
   - Receive OTP (6-digit code)
   - Verify OTP to complete signup
   - After successful signup → automatically appear in Admin dashboard
   - No admin approval required

2. **Student Signup:**
   - Enter mobile number
   - Receive OTP
   - Verify OTP to complete signup
   - Start as "zombie students" (no teacher association)
   - Can immediately search for teachers

3. **Admin Login:**
   - **Dummy Admin Credentials:**
     - Mobile: `9999999999`
     - OTP: `1234`
   - Single admin account (no CRUD for now)
   - May add admin CRUD later based on client requirements

### Auth Types

```typescript
// types/auth.ts
interface AuthData {
  user: {
    id: string;
    name: string;
    mobile: string;
    role: 'admin' | 'teacher' | 'student';
    email?: string;
  };
  token: string;
  isAuthenticated: boolean;
}

interface SignupData {
  name: string;
  mobile: string;
  email?: string;
  role: 'teacher' | 'student';
}

interface OTPVerifyData {
  mobile: string;
  otp: string;
}
```

### Auth with localStorage

```typescript
// services/authService.ts
import { storage } from '@/lib/storage';

export const authService = {
  // Signup
  signup: (data: SignupData) => {
    // Store in localStorage
    // In production, this will be API call
  },
  
  // Verify OTP
  verifyOTP: (data: OTPVerifyData) => {
    // For admin: check if mobile is 9999999999 and OTP is 1234
    // For others: verify OTP (dummy implementation for now)
    if (data.mobile === '9999999999' && data.otp === '1234') {
      const authData: AuthData = {
        user: {
          id: 'admin-1',
          name: 'Admin',
          mobile: '9999999999',
          role: 'admin',
        },
        token: 'dummy-admin-token',
        isAuthenticated: true,
      };
      storage.setAuth(authData);
      return authData;
    }
    // Handle other users...
  },
  
  // Logout
  logout: () => {
    storage.clearAuth();
  },
  
  // Check if authenticated
  isAuthenticated: () => {
    const auth = storage.getAuth();
    return auth?.isAuthenticated || false;
  },
};
```

### Protected Routes (Industry Standard)

```typescript
// components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storage } from '@/lib/storage';

export function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'student')[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = storage.getAuth();
    
    // Not authenticated
    if (!auth?.isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    
    // Check role-based access
    if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
      router.push('/unauthorized');
      return;
    }
  }, [pathname, router, allowedRoles]);

  const auth = storage.getAuth();
  
  if (!auth?.isAuthenticated) return null;
  if (allowedRoles && !allowedRoles.includes(auth.user.role)) return null;
  
  return <>{children}</>;
}
```

### Usage in Layout

```typescript
// app/layout.tsx or specific page
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}
```

---

## ✅ Development Workflow

### Phase 1: Admin App (Current Priority)
1. ✅ Initialize Next.js app with TypeScript, TailwindCSS
2. ✅ Setup Headless UI (trial phase), Heroicons
3. ✅ Setup Axios client with interceptors (prepared for future)
4. ✅ Create localStorage utilities and services
5. ✅ Create Figma design reference folder
6. ✅ Build authentication (mobile + OTP) with localStorage
7. ✅ Implement protected routes (industry standard)
8. ✅ Create layout components (Sidebar, Header) - reference Figma
9. ✅ Build Teacher list page (Gmail-style UI) - reference Figma
10. ✅ Implement Teacher details page
11. ✅ Create Stats page (assumed fields - not discussed with client)
12. ✅ Create Logs page (dummy trade history data)
13. ✅ Test all features thoroughly
14. ✅ Ensure dummy admin login works (9999999999 / 1234)

### Phase 2: Teacher App
1. Copy entire Admin app to `synckaro_teacher_nextjs/`
2. Remove admin-specific pages
3. Update navigation and branding
4. Add mobile blocking UI component
5. Build student management pages
6. Implement broker configuration
7. Create trading interface with panic button
8. Add connection request management

### Phase 3: Student App
1. Use existing Expo boilerplate (from separate directory)
2. Update `app.json` (slug, identifier)
3. Build authentication screens
4. Implement profile management
5. Create broker configuration screens
6. Build teacher search and profile view
7. Add connection request flow
8. Implement trade performance dashboard

---

## 🧪 Testing Strategy

### Manual Testing Checklist

**Admin:**
- [ ] Teacher list loads with correct data
- [ ] Bulk selection works correctly
- [ ] Action menu items work (View, Stats, Logs, Delete)
- [ ] Delete confirmation modal appears
- [ ] Teacher deletion works and updates list
- [ ] Teacher details page shows correct data
- [ ] Associated students list loads
- [ ] Stats page displays charts and metrics
- [ ] Logs page shows activity feed
- [ ] Search and pagination work

**Teacher:**
- [ ] Mobile blocking works on small screens
- [ ] Student CRUD operations work correctly
- [ ] Bulk CSV upload validates and imports data
- [ ] Bulk actions (activate, deactivate, delete) work
- [ ] Toggle status button updates immediately
- [ ] Broker configuration saves correctly
- [ ] Broker connection test works
- [ ] Stock search autocomplete functions
- [ ] Trade execution submits correctly
- [ ] Panic button shows confirmation and closes trades
- [ ] Connection requests send successfully
- [ ] Incoming requests accept/reject correctly

**Student:**
- [ ] Signup creates zombie student
- [ ] Profile updates save correctly
- [ ] Broker configuration works
- [ ] Teacher search returns results
- [ ] Teacher profile displays correctly
- [ ] Connection request sends successfully
- [ ] Leave teacher works without approval
- [ ] Trade history loads correctly
- [ ] Performance metrics display accurately

### Error Handling
- Show user-friendly error messages
- Network errors: "Unable to connect. Please try again."
- Validation errors: Show field-specific errors
- Server errors: "Something went wrong. Please contact support."
- Use toast notifications for success/error messages

---

## 🚀 Performance Optimization

### TanStack Query Configuration
```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 minutes
      cacheTime: 10 * 60 * 1000,      // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Code Splitting
- Use dynamic imports for heavy components
- Lazy load pages not immediately needed
```typescript
import dynamic from 'next/dynamic';

const TeacherStats = dynamic(() => import('@/components/teachers/TeacherStats'), {
  loading: () => <Spinner />,
});
```

### Image Optimization
- Use Next.js `<Image>` component
- Optimize images before upload
- Use appropriate formats (WebP when possible)

---

## 📝 Code Conventions

### Naming Conventions
- **Components**: PascalCase (e.g., `TeacherTable.tsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Hooks**: camelCase with "use" prefix (e.g., `useTeachers.ts`)
- **Stores**: camelCase with "use" prefix (e.g., `useAuthStore.ts`)
- **Types/Interfaces**: PascalCase (e.g., `Teacher`, `StudentFormData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### File Organization
- One component per file
- Co-locate related files (e.g., `TeacherTable.tsx` and `TeacherTable.test.tsx`)
- Group by feature, not by type
- **No file size restrictions** - keep code logical and readable

### TypeScript
- Strictly typed - no `any` types
- Define interfaces for all data structures
- Use type inference where appropriate
- Export types from `types/index.ts`

### CSS/Styling
- Use TailwindCSS utility classes
- Keep custom CSS minimal
- Use `clsx` or `cn` utility for conditional classes
```typescript
import { clsx } from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded',
  isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
)}>
```

### Comments
- Use JSDoc for functions
- Comment complex logic
- Avoid obvious comments
```typescript
/**
 * Fetches teacher data with pagination and optional search
 * @param page - Page number (1-indexed)
 * @param search - Optional search query
 * @returns Paginated teacher data
 */
export async function getTeachers(page: number, search?: string) {
  // Implementation
}
```

---

## 🎯 Key Features Priority

### High Priority (MVP)
1. **Admin**: Teacher list, details, basic stats
2. **Teacher**: Student CRUD, basic trading interface
3. **Student**: Profile, teacher search, connection requests
4. **All**: Authentication and authorization

### Medium Priority
1. **Admin**: Advanced stats, detailed logs
2. **Teacher**: Bulk operations, CSV upload, connection management
3. **Student**: Trade history, performance metrics

### Low Priority (Future Enhancements)
1. Real-time trade updates (WebSockets)
2. Advanced analytics and reporting
3. Email notifications
4. In-app messaging between teacher and students
5. Mobile app for Teacher (currently blocked)
6. Multi-language support
7. Dark mode

---

## 🛠️ Troubleshooting

### Common Issues

**TanStack Query not refetching:**
- Check `staleTime` configuration
- Use `queryClient.invalidateQueries()` after mutations
- Verify query keys are consistent

**Headless UI components not styled:**
- Headless UI provides zero styling - add TailwindCSS classes
- Check component examples in Headless UI docs

**Bulk selection not working:**
- Verify checkbox state management in parent component
- Use Zustand store for selected items
- Ensure unique IDs for each item

**API calls failing:**
- Check API base URL in `.env.local`
- Verify auth token is included in headers
- Check network tab for error responses
- Ensure backend is running

**Mobile blocking not working:**
- Check media queries in CSS
- Verify screen width detection
- Test in browser responsive mode

---

## 📚 Resources

### Documentation Links
- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Headless UI](https://headlessui.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Native Expo](https://docs.expo.dev/)
- [Nativewind](https://www.nativewind.dev/)

### Design Inspiration
- **Figma designs from client** (primary reference - screenshots in design-reference folder)
- Gmail inbox UI (for list views and bulk actions)
- https://dhanhq.co/ (for reference - mobile blocking concept)
- Modern trading dashboards
- Clean admin panels
- Follow Figma layout positions while using TailwindCSS + Headless UI for implementation

---

## 🔄 Version History

### v1.0.0 (October 30, 2025)
- Initial documentation
- Defined all three modules (Admin, Teacher, Student)
- Established tech stack and architecture
- Created UI/UX guidelines
- Defined API structure
- Set development priorities

---

## 📧 Contact & Support

**Project Owner:** Viraj Kadam Sir  
**Developer:** Sugatraj  
**Last Updated:** October 30, 2025

---

## ⚠️ Important Notes for AI Agents

1. **Always read this file first** before making any changes
2. **Admin app is top priority** - start here
3. **Local-first approach** - use localStorage, NO TanStack Query or Zustand yet
4. **Figma designs are primary reference** - follow layout positions
5. **Authentication is mobile + OTP** - admin dummy: 9999999999 / 1234
6. **Protected routes** - implement with industry best practices
7. **Teachers self-onboard** - admin cannot create teachers
8. **Teacher app is desktop/tablet only** - implement mobile blocking
9. **Zombie students** are unassociated - important concept
10. **Headless UI on trial** - may switch to other library or custom components
11. **Gmail-style UI** - bulk selection, clean lists, action menus
12. **Stats page** - create UI with assumed fields (not discussed with client)
13. **Logs page** - show dummy trade history data
14. **Panic button** - critical safety feature for teachers
15. **Connection requests** - complex logic, follow rules carefully
16. **Axios client ready** - prepared with interceptors but use localStorage for now
17. **No file size limits** - keep code logical and readable
18. **Heroicons** - use for all icons (includes Rupee icons)
19. **No emojis in production code** - keep it professional
20. **TypeScript strictly** - no `any` types
21. **Test thoroughly** - especially bulk operations and trading features

---

**END OF AGENTS.MD**

