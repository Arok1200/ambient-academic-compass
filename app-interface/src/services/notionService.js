
class NotionService {
  constructor() {
    this.accessToken = null;
    this.notionApiUrl = 'https://api.notion.com/v1';
  }

  initiateOAuth(clientId, redirectUri) {
    const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
  }

  async exchangeCodeForToken(code, clientId, clientSecret, redirectUri) {
    const basicAuth = btoa(`${clientId}:${clientSecret}`);
    
    try {
      const response = await fetch('https://api.notion.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
        }),
      });

      const data = await response.json();
      if (data.access_token) {
        this.accessToken = data.access_token;
        localStorage.setItem('notion_access_token', data.access_token);
        return data;
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  loadStoredToken() {
    const token = localStorage.getItem('notion_access_token');
    if (token) {
      this.accessToken = token;
      return true;
    }
    return false;
  }

  clearToken() {
    this.accessToken = null;
    localStorage.removeItem('notion_access_token');
  }

  async searchDatabases() {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Notion');
    }

    try {
      const response = await fetch(`${this.notionApiUrl}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'object',
            value: 'database'
          }
        }),
      });

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching databases:', error);
      throw error;
    }
  }

  async queryDatabase(databaseId) {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Notion');
    }

    try {
      const response = await fetch(`${this.notionApiUrl}/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error querying database:', error);
      throw error;
    }
  }

  extractRichText(richTextArray) {
    if (!richTextArray || !Array.isArray(richTextArray)) return '';
    return richTextArray.map(text => text.plain_text).join('');
  }

  extractDate(dateProperty) {
    if (!dateProperty || !dateProperty.date) return null;
    return dateProperty.date.start;
  }

  transformNotionToAppFormat(notionPages, type = 'auto') {
    return notionPages.map(page => {
      const properties = page.properties;
      
      let title = '';
      let description = '';
      let date = null;
      let completed = false;

      for (const [key, value] of Object.entries(properties)) {
        if (value.type === 'title') {
          title = this.extractRichText(value.title);
        } else if (value.type === 'rich_text' && !description) {
          description = this.extractRichText(value.rich_text);
        } else if (value.type === 'date' && !date) {
          date = this.extractDate(value);
        } else if (value.type === 'checkbox' && key.toLowerCase().includes('done')) {
          completed = value.checkbox;
        }
      }

      const hasTimeRange = date && date.includes('T');
      
      if (type === 'event' || (type === 'auto' && hasTimeRange)) {
        return {
          type: 'event',
          title: title || 'Untitled Event',
          description: description,
          startTime: date || new Date().toISOString(),
          endTime: date || new Date(Date.now() + 60 * 60 * 1000).toISOString(), 
          completed: completed,
          source: 'notion'
        };
      } else {
        return {
          type: 'deadline',
          title: title || 'Untitled Task',
          description: description,
          dueAt: date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed: completed,
          pinned: true,
          source: 'notion'
        };
      }
    });
  }
}

const notionService = new NotionService();
export default notionService;
