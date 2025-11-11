# API Integration Setup Guide

## Overview
This guide will help you set up the necessary API credentials for Google Calendar and Notion integration.

## Google Calendar & Tasks API Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Ambient Academic Campus" and click "Create"

### Step 2: Enable Required APIs
1. In your project, go to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - **Google Calendar API**
   - **Google Tasks API**

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Ambient Academic Campus
   - User support email: your email
   - Developer contact: your email
   - Save and continue through the scopes and test users sections
4. Back to "Create OAuth client ID":
   - Application type: Web application
   - Name: Ambient Academic Campus Web Client
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000`
   - Click "Create"
5. **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### Step 4: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API key"
3. **Copy the API Key**
4. (Optional) Click "Restrict Key" and limit to Google Calendar API and Google Tasks API

### Step 5: Add to .env File
```bash
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=your-api-key
```

---

## Notion API Setup

### Step 1: Create a Notion Integration
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "+ New integration"
3. Fill in the details:
   - Name: Ambient Academic Campus
   - Associated workspace: Select your workspace
   - Type: Public integration
   - Capabilities: Check "Read content", "Update content", "Insert content"
4. Click "Submit"

### Step 2: Get OAuth Credentials
1. After creating the integration, you'll see:
   - **OAuth Client ID**: Copy this
   - **OAuth Client Secret**: Copy this
2. Set the Redirect URI to: `http://localhost:3000/oauth/notion/callback`

### Step 3: Add to .env File
```bash
REACT_APP_NOTION_CLIENT_ID=your-notion-client-id
REACT_APP_NOTION_CLIENT_SECRET=your-notion-client-secret
REACT_APP_NOTION_REDIRECT_URI=http://localhost:3000/oauth/notion/callback
```

### Step 4: Share Your Notion Databases
1. In Notion, open the database/page you want to sync
2. Click "Share" in the top right
3. Invite your integration ("Ambient Academic Campus")
4. The integration now has access to read/write that database

---

## iOS Calendar Note

iOS Calendar integration requires native iOS Calendar access and is not available for web applications. Users can:
- Use Google Calendar on their iOS device and sync via Google Calendar API
- Use Notion on their iOS device and sync via Notion API
- Manually add events/deadlines through the web interface

---

## Final Setup

1. Create a `.env` file in the `app-interface` folder (copy from `.env.example`)
2. Add all the credentials you collected:

```bash
# Backend API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080

# Google Calendar API
REACT_APP_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=your-google-api-key

# Notion API
REACT_APP_NOTION_CLIENT_ID=your-notion-client-id
REACT_APP_NOTION_CLIENT_SECRET=your-notion-client-secret
REACT_APP_NOTION_REDIRECT_URI=http://localhost:3000/oauth/notion/callback
```

3. Restart your development server:
```bash
cd app-interface
npm start
```

---

## Testing the Integration

### Google Calendar:
1. Click the "Sync" button in the app header
2. Select "Google Calendar"
3. Click "Confirm"
4. Sign in with your Google account when prompted
5. Grant permissions to access Calendar and Tasks
6. Your events and tasks will be imported!

### Notion:
1. Click the "Sync" button
2. Select "Notion"
3. Click "Confirm"
4. You'll be redirected to Notion to authorize
5. Select your workspace and click "Select pages"
6. Choose which pages/databases to share
7. Click "Allow access"
8. You'll be redirected back to the app
9. Click "Sync" again and select "Notion" to import your data

---

## Troubleshooting

### Google Calendar Issues:
- **"Error initializing Google API client"**: Check your API key and Client ID
- **"Access blocked"**: Make sure you added `http://localhost:3000` to authorized origins
- **"Invalid scope"**: Ensure Calendar and Tasks APIs are enabled

### Notion Issues:
- **"Failed to connect to Notion"**: Check your Client ID and Secret
- **"No databases found"**: Make sure you shared at least one database with your integration
- **CORS errors**: Notion API calls might need a backend proxy for production

### General:
- Clear browser cache and localStorage if you encounter auth issues
- Check browser console for detailed error messages
- Ensure .env file is in the correct location (`app-interface/.env`)
- Restart the dev server after changing .env variables

---

## Security Notes

- **Never commit `.env` file** to version control (it's in `.gitignore`)
- For production, use environment variables in your hosting platform
- Rotate API keys and secrets if they're ever exposed
- Use HTTPS in production for OAuth redirects

---

## Next Steps

Once you have the APIs set up and working, you can:
1. Customize which Notion databases to sync
2. Add filtering options (date ranges, specific calendars)
3. Implement two-way sync (create events in the app → sync to Google/Notion)
4. Add periodic auto-sync (every hour, every day, etc.)
5. Show sync status and last sync time in the UI
