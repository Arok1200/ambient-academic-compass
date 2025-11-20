
const SCOPES = 'https://www.googleapis.com/auth/calendar';

class GoogleCalendarService {
  constructor() {
    this.gapi = null;
    this.isInitialized = false;
  }

  async initClient(apiKey, clientId) {
    return new Promise((resolve, reject) => {
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: apiKey,
            clientId: clientId,
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
            ],
            scope: SCOPES,
          });
          this.gapi = window.gapi;
          this.isInitialized = true;
          resolve();
        } catch (error) {
          console.error('Error initializing Google API client:', error);
          reject(error);
        }
      });
    });
  }

  async signIn() {
    if (!this.isInitialized) {
      throw new Error('Google API client not initialized');
    }
    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      return authInstance.currentUser.get();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  isSignedIn() {
    if (!this.isInitialized) return false;
    const authInstance = this.gapi.auth2.getAuthInstance();
    return authInstance.isSignedIn.get();
  }

  async signOut() {
    if (!this.isInitialized) return;
    const authInstance = this.gapi.auth2.getAuthInstance();
    await authInstance.signOut();
  }

  async getCalendarEvents(timeMin, timeMax) {
    if (!this.isSignedIn()) {
      throw new Error('User not signed in');
    }

    try {
      const response = await this.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  async getTaskLists() {
    if (!this.isSignedIn()) {
      throw new Error('User not signed in');
    }

    try {
      const response = await this.gapi.client.tasks.tasklists.list();
      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching task lists:', error);
      throw error;
    }
  }

  async getTasks(taskListId) {
    if (!this.isSignedIn()) {
      throw new Error('User not signed in');
    }

    try {
      const response = await this.gapi.client.tasks.tasks.list({
        tasklist: taskListId,
        showCompleted: false,
        showHidden: false,
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getAllTasks() {
    const taskLists = await this.getTaskLists();
    const allTasks = [];

    for (const taskList of taskLists) {
      const tasks = await this.getTasks(taskList.id);
      allTasks.push(...tasks.map(task => ({
        ...task,
        taskListTitle: taskList.title
      })));
    }

    return allTasks;
  }

  transformEventsToAppFormat(googleEvents) {
    return googleEvents.map(event => ({
      title: event.summary || 'Untitled Event',
      description: event.description || '',
      startTime: event.start.dateTime || event.start.date,
      endTime: event.end.dateTime || event.end.date,
      completed: false,
      source: 'google_calendar'
    }));
  }

  transformTasksToAppFormat(googleTasks) {
    return googleTasks.map(task => ({
      title: task.title || 'Untitled Task',
      description: task.notes || '',
      dueAt: task.due || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), 
      completed: task.status === 'completed',
      pinned: true,
      source: 'google_tasks'
    }));
  }
}

const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;
