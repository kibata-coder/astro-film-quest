

## Feature Suggestions for Your Streaming Platform

Based on the current codebase, here are high-impact features you could add next:

### 1. User Profiles & Avatars
Let users customize their profile with a display name and avatar. You already have auth and a profiles table — extend it with avatar upload via storage and a profile settings page.

### 2. Ratings & Reviews
Allow users to rate and review movies/TV shows. Add a `reviews` table and display ratings on movie/TV modals. Could also use ratings to improve the "For You" recommendations.

### 3. Multiple Watch Lists (Collections)
Currently there's a single "My List." Let users create named collections like "Weekend Binge," "Watch with Friends," etc.

### 4. Friends & Social Features
Let users follow each other, see what friends are watching, and share recommendations. Adds a social layer that increases engagement.

### 5. Advanced Filtering & Sorting
Add filters on the Movies/TV pages — sort by year, rating, popularity; filter by multiple genres, language, and runtime.

### 6. Notification System
Notify users when new episodes drop for shows in their list, or when new content matches their preferences.

### 7. Dark/Light Theme Toggle
You have `next-themes` installed but may not be using it fully. Add a visible theme switcher in the header.

### 8. PWA Support
Make the app installable on mobile with offline caching for the UI shell. You already have a `site.webmanifest` — extend it with a service worker.

### 9. Watch Party / Share Links
Generate shareable links for specific movies/shows so users can send them to friends.

### 10. Admin Dashboard
A simple admin page to view user stats, popular content, and manage the platform.

