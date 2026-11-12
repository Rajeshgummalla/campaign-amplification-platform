# Campaign Amplification Platform — Mobile Prototype

A polished, mobile-first React Native (Expo) prototype and Node.js/Express backend for community-funded message amplification.

---

## 🌟 Product Vision

The **Campaign Amplification Platform** is a community-funded advertising and message-amplification service. Creators, nonprofits, advocacy groups, and individuals build campaigns around messages they want more people to see. Backers pool contributions toward **message distribution costs** (digital ads, social media reach, search networks, etc.).

> **Key Principle:** A contribution funds the **distribution and reach** of a campaign message; it does **not** directly donate to or fund the cause, person, or organization.

---

## 📱 Application Architecture & Features

## 📁 Project Structure

```
CampaignApp/
├── 📁 frontend/             <-- Mobile Application (React Native with Expo)
│   ├── app/                 <-- All screens and Expo Router pages
│   ├── components/          <-- Reusable UI components
│   ├── constants/           <-- Theme, colors, typography
│   ├── stores/              <-- Zustand state management
│   ├── data/                <-- Types and demo seed data
│   ├── app.json             <-- Expo configuration
│   └── package.json         <-- Frontend dependencies
│
├── 📁 backend/              <-- Backend API Server (Node.js + Express + SQLite)
│   ├── src/                 <-- Server and API routes
│   ├── data/                <-- SQLite database
│   └── package.json         <-- Backend dependencies
│
├── package.json             <-- Root scripts to run frontend and backend
└── README.md                <-- Documentation
```

#### 1. Bottom Navigation (5 Destinations)
1. **Home (`/(tabs)/index`)**
   - **Hero Section:** Clear headline on community-funded reach, estimated impact per dollar (~100 people/dollar, clearly labelled as an estimate).
   - **How It Works:** Visual 3-step sequence (**Create → Review → Amplify**).
   - **Featured Campaigns:** High-quality campaign cards with funding goals, progress, and reach indicators.
   - **Platform Overview:** Real-time stats on campaigns, funds raised, backers, and estimated reach.
   - **Category Browse:** Direct category filter navigation.

2. **Explore (`/(tabs)/explore`)**
   - Live search by title, creator, summary, or tags.
   - Category filter pills (Environment, Health, Science, Education, Public Policy, Economic Policy, Community, Arts & Culture, Business, Other).
   - 4-way sorting: Trending, Newest, Most Funded, Ending Soon.
   - Dynamic empty states when no results match.

3. **Create (`/(tabs)/create`)**
   - Dual entry points: **Create Manually** and **Create with Voice** (with Demo Mode indicator).
   - Persistent draft saving and resume capability.
   - Visual 5-step overview indicator.

4. **Activity (`/(tabs)/activity`)**
   - In-app notification center for funding milestones, campaign approvals, contributions, distribution launches, and deadline alerts.
   - Unread badges, read/unread status toggling, and "Mark all read" action.
   - Filterable activity categories (Campaigns, Contributions, Updates).

5. **Profile (`/(tabs)/profile`)**
   - Role management (Audience, Creator, Backer).
   - Overview metrics: Backed count, Created count, Total contributed.
   - Segmented views: **Created Campaigns**, **Backed Campaigns** (with receipt access and reach impact), and **Saved Campaigns**.
   - Account settings, notifications preferences, and secondary destinations.

---

### 5-Step Campaign Creation Flow (`/app/create`)
Follows the required strict order with persistent step indicators, field validation, and draft autosaving:

- **Step 1: Basics (`step1.tsx`)**
  - Campaign title (with 60-char counter and headline usage note).
  - Category selector.
  - Creator or organization identity.
  - Short editorial summary (280-char limit).
  - Optional cover image upload.
  - AI Drafting suggestion trigger.

- **Step 2: Story (`step2.tsx`)**
  - Article-style story composer with headline and introductory text.
  - Modular story sections: Paragraphs, Statistics, and Quotes.
  - **Publicly visible supporting sources** management (title and URL).
  - Suggested audience action callout.

- **Step 3: Campaign & Ad Visuals (`step3.tsx`)**
  - Separation of editorial story from promotional ad assets.
  - Cover image and multi-aspect ad creatives (Square 1:1, Landscape 1.91:1, Story 9:16).
  - Ad headline (90 chars) and description (200 chars).
  - Call-to-action button selector.
  - Interactive multi-placement preview (Social Feed, Stories, Search, Display, YouTube).

- **Step 4: Reach (`step4.tsx`)**
  - Geographic targeting (countries and global scope).
  - Target audience age range and interest tags.
  - Multi-channel allocation (Social Media, Search, Display, YouTube, News).
  - Campaign duration options (7 to 60 days).
  - Dynamic estimated audience size calculator.

- **Step 5: Submit (`step5.tsx`)**
  - Full campaign preview summary.
  - **Creator-defined funding goal** (strictly manual, never overwritten by AI).
  - Transparent fee and budget breakdown: 89% ad distribution, 8% platform fee, 3% processing fee.
  - Dynamic reach estimate at 100% goal.
  - Mandatory policy verification checkbox.
  - Submission confirmation with multi-step review timeline.

---

### Back a Campaign Journey (`/app/back/[id]`)
- **Step 1: Inspect:** Review story, sources, intended audience, and explicit use-of-funds notice.
- **Step 2: Choose Contribution:** Quick preset amounts ($10, $25, $50, $100, $250, $500) or custom amount with real-time calculated reach impact.
- **Step 3: Review Contribution:** Transparent fee calculation, impact summary, and campaign progress preview.
- **Step 4: Simulated Payment:** Clearly labelled mock checkout supporting anonymous backing and guest email receipts.
- **Step 5: Confirmation:** Verified transaction receipt, updated funding progress, and options to track the campaign.

---

### Backend API (`/CampaignApp/backend`)
Built with **Node.js**, **Express**, and **better-sqlite3** (SQLite with WAL mode).

- **Authentication:** JWT with bcrypt password hashing (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
- **Campaigns:** Full CRUD, search, category filtering, sorting, and submission (`/api/campaigns`).
- **Contributions:** Processing, progress tracking, automatic goal-reached transitions (`/api/contributions`).
- **Notifications:** In-app notification delivery and read status management (`/api/notifications`).
- **Admin Review:** Status transitions (`submitted` → `approved` / `changes_requested` / `rejected`), review audit log, and platform-wide statistics (`/api/admin/stats`).

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Start the Backend API Server
```powershell
cd "d:\hackthon assaignment\CampaignApp\backend"
node -e "require('./src/server.ts')"
```
*API will run at `http://localhost:3001` with pre-seeded demo campaigns and users.*

### 2. Start the Mobile App (Frontend)
```powershell
cd "d:\hackthon assaignment\CampaignApp\frontend"
npx expo start
```
- Press `w` to open in your web browser.
- Scan the QR code with **Expo Go** (Android / iOS) to run on your physical device.
- Press `a` to run in an Android Emulator.

### 3. Generate Android APK / Build
```powershell
cd "d:\hackthon assaignment\CampaignApp\frontend"
npx expo export -p android
```
*(Or use `eas build -p android --profile preview` with an Expo account to generate a standalone `.apk`)*

---

## 🧪 Demo Credentials

- **Demo Backer / Creator:** `alex@example.com` / `demo123`
- **Platform Admin / Reviewer:** `admin@campaigns.example` / `admin123`
- **Guest Browsing:** Available immediately without logging in.
