
# Fix Email Verification Branding and Redirect URL

## Overview
Configure the signup flow so that:
1. **Email branding** shows "SoudFlex" instead of "Cinestream Connect"
2. **Email redirect** goes to `https://soudflex.pages.dev/` after verification

## Changes Required

### Part 1: Code Change - Add Email Redirect URL
**File:** `src/components/AuthModal.tsx`

Update the `signUp` call to include the `emailRedirectTo` option pointing to your Cloudflare deployment:

```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: 'https://soudflex.pages.dev/'
  }
});
```

This ensures when users click "Verify Email", they're redirected to your Cloudflare-hosted domain.

---

### Part 2: Backend Configuration - Email Template Branding
The email template text (showing "Cinestream Connect") is configured in Lovable Cloud's auth settings. You'll need to update this in the Cloud dashboard.

**Steps:**
1. Open the Cloud dashboard (button provided below)
2. Navigate to **Auth Settings** → **Email Templates**
3. Look for the email confirmation template
4. Change instances of "Cinestream Connect" to "SoudFlex"
5. Update any other branding (logo, links) as needed

---

### Part 3: Redirect URL Whitelist
The redirect URL `https://soudflex.pages.dev/` must be added to the allowed redirect URLs in the auth settings.

**In Cloud dashboard:**
1. Go to **Auth Settings** → **URL Configuration**
2. Add `https://soudflex.pages.dev/` to the **Redirect URLs** list
3. Save changes

---

## Summary of Changes

| Component | Change |
|-----------|--------|
| `AuthModal.tsx` | Add `emailRedirectTo: 'https://soudflex.pages.dev/'` to signUp options |
| Cloud Dashboard | Update email templates to say "SoudFlex" |
| Cloud Dashboard | Add `https://soudflex.pages.dev/` to allowed redirect URLs |

## After Implementation
1. Republish the site on Lovable
2. Test by signing up with a new email
3. Verify the email shows "SoudFlex" branding
4. Confirm clicking "Verify Email" redirects to soudflex.pages.dev
