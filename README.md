# Smart Bookmark App 🚀

## Overview
A real-time, premium bookmark manager application built with **Next.js 14**, **Supabase**, and **Tailwind CSS**. Designed for speed, security, and a state-of-the-art user experience.

## 🛠 Features
- **Mandatory Google OAuth**: Secure, passwordless login exclusively through Google.
- **Instant Sync (Real-time)**: Bookmarks update across all open tabs instantly using Supabase Postgres Changes.
- **Privacy-First (RLS)**: Each user's "Vault" is private. Row Level Security ensures you never see another user's bookmarks.
- **Optimistic UI**: Deleting and adding bookmarks feels instantaneous.
- **Premium Solid Design**: High-contrast, accessibility-focused UI with smooth micro-animations.

## 🚀 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Backend**: Supabase (Auth, Database, Real-time)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React

---

## 🏗 Setup & Database Configuration

### 1. Table Creation
Run this in your Supabase SQL Editor:
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);
```

### 2. Security (RLS) & Real-time
```sql
-- Enable Real-world magic
ALTER publication supabase_realtime ADD TABLE bookmarks;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Private Access Policies
CREATE POLICY "Users can see their own" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own" ON bookmarks FOR DELETE USING (auth.uid() = user_id);
```

---

## 🧠 Problems Encountered & Solutions

### 1. The "Missing OAuth Secret" Error
**Problem**: Google login failed with a validation error.
**Discovery**: The Google Provider was enabled in Supabase, but the "Client Secret" from Google Cloud Console was missing.
**Solution**: Guided the user to correctly copy-paste the secret and click **Save** in the Supabase Auth settings.

### 2. Database Schema Cache Lag (`PGRST205`)
**Problem**: The app reported that the `bookmarks` table didn't exist even after creation.
**Reason**: Supabase's API (PostgREST) sometimes lags in updating its table cache.
**Solution**: Ran the `NOTIFY pgrst, 'reload schema';` command and performed a hard browser refresh to force a synchronization.

### 3. Navigation & Glassmorphism Visibility
**Problem**: The first design was too transparent, making content hard to read when scrolling.
**Solution**: Refactored the UI from a "Glass" look to a **"Solid Premium"** look. Switched to opaque headers and high-contrast cards to ensure 100% readability.

### 4. Redirect URI Mismatches (Port 3001)
**Problem**: Google OAuth would fail with a `redirect_uri_mismatch` error.
**Discovery**: The local development server was running on port **3001**, but Google Cloud and Supabase were configured for port 3000.
**Solution**: Configured the exact callback URL `http://localhost:3001/auth/callback` in both Google Cloud Console and Supabase Dashboard.

### 5. Real-time Subscription Logic
**Problem**: Ensuring the list updated without a refresh.
**Solution**: Implemented a `useEffect` hook that subscribes to the `bookmarks` table. Integrated a `payload` handler to update the local React state (`setBookmarks`) whenever an `INSERT` or `DELETE` event is detected.

---

## 📈 Deployment
Ready for Vercel deployment. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are added to your Vercel Environment Variables.
