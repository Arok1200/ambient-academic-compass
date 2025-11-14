
export const GOOGLE_CONFIG = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'your-google-api-key',
  discoveryDocs: [
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'
  ],
  scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/tasks.readonly',
};

export const NOTION_CONFIG = {
  clientId: process.env.REACT_APP_NOTION_CLIENT_ID || 'your-notion-client-id',
  clientSecret: process.env.REACT_APP_NOTION_CLIENT_SECRET || 'your-notion-client-secret',
  redirectUri: process.env.REACT_APP_NOTION_REDIRECT_URI || 'http://localhost:3000/oauth/notion/callback',
};

export const IOS_CALENDAR_NOTE = 'iOS Calendar integration is only available on iOS devices through native Calendar app. Please use Google Calendar or Notion for web-based sync.';
