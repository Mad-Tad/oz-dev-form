# Form Recovery Test Guide

## 🧪 Testing Form Auto-Save and Recovery

### Test Scenario 1: Basic Auto-Save
1. **Start the application**: `npm run dev`
2. **Sign in with Google**
3. **Navigate to the form** (`/form`)
4. **Fill in some fields** (e.g., Project Name, Tagline)
5. **Wait 2 seconds** - you should see "Saving..." indicator
6. **Check the database** - verify a draft record was created

### Test Scenario 2: Form Recovery
1. **Fill in some form fields**
2. **Wait for auto-save** (2 seconds)
3. **Close the browser tab**
4. **Open a new tab** and go to the application
5. **Sign in with the same Google account**
6. **Navigate to the form** (`/form`)
7. **Verify**: Your previous form data should be loaded automatically
8. **Check for notification**: "Your form progress has been restored!"

### Test Scenario 3: Multiple Drafts
1. **Create a draft** by filling some fields
2. **Go to dashboard** (`/dashboard`)
3. **Start a new project** - this should create a new draft
4. **Verify**: Dashboard shows both projects

### Test Scenario 4: Cross-Device Recovery
1. **Fill form on one device**
2. **Sign in on another device** with same Google account
3. **Navigate to form** - should see your progress

## 🔍 Debugging Information

### Check Database Records
```sql
-- View all drafts for a user
SELECT * FROM oz_projects 
WHERE submitted_by_email = 'your-email@example.com' 
AND submission_status = 'draft'
ORDER BY created_at DESC;

-- View all projects for a user
SELECT project_id, project_name, submission_status, created_at, updated_at 
FROM oz_projects 
WHERE submitted_by_email = 'your-email@example.com'
ORDER BY created_at DESC;
```

### Console Logs to Watch For
- "Form data recovered from previous session" - when form is loaded
- "Error auto-saving" - if save fails
- "Error loading form data" - if load fails

## ✅ Expected Behavior

1. **Auto-Save**: Every 2 seconds of inactivity
2. **Visual Indicator**: "Saving..." appears during save
3. **Form Recovery**: Previous data loads automatically
4. **Notification**: Green notification when data is recovered
5. **Dashboard**: Shows all user's projects
6. **Draft vs Submitted**: Clear status distinction

## 🐛 Common Issues

1. **No auto-save**: Check if user is authenticated
2. **No recovery**: Check if draft exists in database
3. **Save errors**: Check database permissions
4. **Load errors**: Check if user email matches

## 🚀 Database Requirements

Make sure you've run the SQL script:
```sql
-- Run database-updates.sql in Supabase SQL Editor
```

The form should now properly save progress and recover it when users return! 