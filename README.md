# 🏛️ Gram Parivar — Village Family Heritage Directory

> A premium Indian cultural mobile app for managing village family directories, built with Expo React Native.

---

## ✨ Features

- 🏘️ **Multi-village management** with beautiful temple-inspired UI
- 👨‍👩‍👧‍👦 **Family & member directory** with rich profiles
- 📚 **Smart education tracking** with auto class promotion every June
- 🔐 **Role-based auth** — Super Admin & Village Admin
- 📷 **Cloudinary image uploads** for family head photos
- 🔍 **Full-text search** across families, members, gotras
- 📴 **Offline-first** with session persistence
- 🎨 **Premium Indian UI** — Maroon, Gold, Saffron, Cream palette

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo React Native (SDK 51) |
| Language | TypeScript |
| Navigation | Expo Router v3 |
| State | Zustand |
| Server State | React Query (TanStack) |
| Styling | NativeWind + TailwindCSS |
| Animation | React Native Reanimated |
| List | FlashList |
| Backend | Appwrite Cloud |
| Images | Cloudinary |
| Storage | Expo Secure Store |

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repo>
cd village-directory
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in your Appwrite and Cloudinary credentials.

### 3. Set Up Appwrite

Log in to [Appwrite Cloud](https://cloud.appwrite.io) and:

**Create a Project**, then set up this **Database** with 4 collections:

---

#### 📁 Collection: `villages`

| Attribute | Type | Required |
|-----------|------|----------|
| name | String (255) | ✅ |
| description | String (1000) | ❌ |
| coverImageUrl | URL (2000) | ❌ |
| totalFamilies | Integer | ✅ (default: 0) |
| totalMembers | Integer | ✅ (default: 0) |

---

#### 📁 Collection: `families`

| Attribute | Type | Required |
|-----------|------|----------|
| villageId | String (255) | ✅ |
| villageName | String (255) | ✅ |
| headName | String (255) | ✅ |
| fatherName | String (255) | ❌ |
| mobile | String (15) | ✅ |
| altMobile | String (15) | ❌ |
| gotra | String (100) | ✅ |
| address | String (500) | ✅ |
| headImageUrl | URL (2000) | ❌ |
| totalMembers | Integer | ✅ (default: 0) |

**Indexes:**
- `villageId` (key) — for filtering by village
- `headName` (fulltext) — for search
- `mobile` (fulltext) — for search
- `gotra` (key) — for filtering

---

#### 📁 Collection: `members`

| Attribute | Type | Required |
|-----------|------|----------|
| familyId | String (255) | ✅ |
| name | String (255) | ✅ |
| relation | Enum (see RelationType) | ✅ |
| gender | Enum: MALE, FEMALE, OTHER | ✅ |
| dateOfBirth | String (10) | ✅ |
| mobile | String (15) | ❌ |
| occupation | String (255) | ❌ |
| educationType | Enum: SCHOOL,COLLEGE,GRADUATED,WORKING,BUSINESS,OTHER | ✅ |
| educationStatus | Enum: STUDYING,COMPLETED,DROPPED | ❌ |
| currentStandard | Integer | ❌ |
| academicYear | Integer | ❌ |
| schoolOrCollegeName | String (255) | ❌ |
| degree | String (255) | ❌ |

**Indexes:**
- `familyId` (key) — for filtering by family
- `name` (fulltext) — for search
- `educationType` + `educationStatus` (key) — for auto-promotion query
- `academicYear` (key) — for auto-promotion

---

#### 📁 Collection: `admins`

| Attribute | Type | Required |
|-----------|------|----------|
| userId | String (255) | ✅ |
| name | String (255) | ✅ |
| email | String (255) | ✅ |
| mobile | String (15) | ✅ |
| role | Enum: SUPER_ADMIN, VILLAGE_ADMIN | ✅ |
| assignedVillageId | String (255) | ❌ |
| assignedVillageName | String (255) | ❌ |
| isActive | Boolean | ✅ (default: true) |

**Indexes:**
- `userId` (key) — for fetching admin by auth user
- `role` (key) — for filtering by role

---

#### 🔒 Appwrite Permissions

For all collections, set:
- **Read**: `any` (for public browsing) OR `users` (for authenticated only)
- **Create/Update/Delete**: `users`

> For production, use Appwrite's attribute-level rules to enforce village-admin isolation.

---

### 4. Set Up Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to **Settings → Upload → Upload Presets**
3. Create an **Unsigned** upload preset named `gram_parivar_unsigned`
4. Copy your **Cloud Name**

### 5. Create First Super Admin

In Appwrite Console:
1. Go to **Auth → Users** → Create user with email/password
2. In your **admins** collection, create a document:
   ```json
   {
     "userId": "<user_id_from_step_1>",
     "name": "Super Admin",
     "email": "superadmin@gramparivar.com",
     "mobile": "7742261445",
     "role": "SUPER_ADMIN",
     "isActive": true
   }
   ```

### 6. Run the App

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Expo Go (scan QR)
npm start
```

---

## 📂 Project Structure

```
village-directory/
├── app/                        # Expo Router screens
│   ├── index.tsx               # Splash / redirect
│   ├── _layout.tsx             # Root layout
│   ├── auth/login.tsx          # Login screen
│   ├── tabs/                   # Bottom tab screens
│   │   ├── index.tsx           # Home
│   │   ├── villages.tsx        # Village list
│   │   ├── search.tsx          # Search
│   │   └── profile.tsx         # Profile
│   ├── village/
│   │   ├── [id].tsx            # Families in a village
│   │   └── family/
│   │       ├── [id].tsx        # Family details + members
│   │       └── add.tsx         # Multi-step add/edit form
│   └── admin/
│       ├── super/              # Super admin screens
│       └── village/            # Village admin screens
├── components/                 # Reusable UI components
│   ├── ui/                     # Base components
│   ├── village/                # Village-specific
│   ├── family/                 # Family-specific
│   └── shared/                 # Shared components
├── services/                   # API services
├── hooks/                      # React Query hooks
├── store/                      # Zustand stores
├── constants/                  # Colors, config, themes
├── utils/                      # Helper functions
└── types/                      # TypeScript types
```

---

## 🎓 Auto Class Promotion

Students are automatically promoted to the next class every June:

```
Before (stored):  currentStandard=9, academicYear=2025
After June 2026:  currentStandard=10, academicYear=2026 (computed client-side)
```

- Client-side: computed dynamically in `utils/helpers.ts → getEffectiveStandard()`
- Server-side: run `memberService.runAnnualPromotion()` via an Appwrite Function scheduled for June

---

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Temple Maroon | `#3D0C11` | Primary, headers |
| Deep Maroon | `#8B1A1A` | Buttons, accents |
| Sacred Gold | `#D4A017` | Highlights, CTAs |
| Golden Light | `#F5D06E` | Text on dark |
| Sacred Saffron | `#FF7D00` | Badges, alerts |
| Cream | `#FEFDF8` | Card backgrounds |
| Sandal | `#DEC58A` | Borders, dividers |

---

## 📱 Screens

| Screen | Route |
|--------|-------|
| Splash | `/` |
| Login | `/auth/login` |
| Home | `/(tabs)/` |
| Villages | `/(tabs)/villages` |
| Search | `/(tabs)/search` |
| Profile | `/(tabs)/profile` |
| Village Families | `/village/[id]` |
| Family Details | `/village/family/[id]` |
| Add/Edit Family | `/village/family/add` |
| Super Admin Dashboard | `/admin/super` |
| Add Village | `/admin/super/add-village` |
| Add Admin | `/admin/super/add-admin` |
| Village Admin Dashboard | `/admin/village` |

---

## 🙏 Built with Love

> "Connecting villages, preserving heritage, one family at a time."
> 
> ग्राम परिवार — Gram Parivar
