# Ambient Academic Compass

A productivity application for managing events, deadlines, and notes with integrations for Google Calendar and Notion. Provides subtle, ambient awareness of deadlines through desktop visualizations, reducing notification fatigue while maintaining task awareness.

**Team Members:** Kaitlyn Pereira, Arok Khot Bul, & Anum Rehan  
**Course:** ECSE 424 - McGill University

## Project Overview

The Ambient Academic Compass addresses the challenge of maintaining continuous awareness of deadlines without disruptive notifications. Through ambient desktop visualizations, students can stay aware of upcoming tasks while maintaining focus on current work.

## Project Structure

```
ambient-academic-compass/
├── app-interface/          # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Events, Deadlines, Notes pages
│   │   ├── services/      # Google Calendar & Notion API integration
│   │   └── constants/     # Centralized color/icon definitions
│   └── public/
│       └── desktop/       # Desktop display with live sync
├── backend/               # Spring Boot backend
│   └── src/main/java/    # Event & Deadline REST API
└── API_SETUP_GUIDE.md    # Guide for setting up Google Calendar & Notion APIs
```

## initial step

- **Frontend**: Node.js 16+ and npm
- **Backend**: Java 17+ and Maven
- **Optional**: Google Calendar API credentials (for Google Calendar sync)
- **Optional**: Notion API credentials (for Notion sync)

## Quick Start

### 1. Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

The backend will run on `http://localhost:8080`

### 2. Frontend Setup

```bash
cd app-interface
npm install
npm start
```

The frontend will run on `http://localhost:3000`

### 3. Environment Variables

Create a `.env` file in the `app-interface/` directory:

```bash
# Backend API (required)
REACT_APP_API_BASE_URL=http://localhost:8080

# Google Calendar API (optional)
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
REACT_APP_GOOGLE_API_KEY=your_api_key_here

# Notion API (optional)
REACT_APP_NOTION_CLIENT_ID=your_notion_client_id_here
REACT_APP_NOTION_CLIENT_SECRET=your_notion_client_secret_here
REACT_APP_NOTION_REDIRECT_URI=http://localhost:3000/oauth/notion/callback
```

See `.env.example` for a template and `API_SETUP_GUIDE.md` for detailed instructions on obtaining API credentials.

## Features

- **Events Management**: Create, edit, and delete calendar events
- **Deadlines Tracking**: Manage deadlines with color-coded widgets
- **Notes**: Create sticky notes with different colors
- **Desktop View**: Live desktop display with widgets and timeline
- **Google Calendar Sync**: Import events from Google Calendar
- **Notion Sync**: Import tasks from Notion databases

## Technologies

**Frontend:**
- React 18
- React Router
- Axios
- Google Calendar API
- Notion API

**Backend:**
- Java 17
- Spring Boot 3.5.7
- Spring Data JPA
- H2 Database (in-memory)
- Maven

## Development

### Frontend Development
```bash
cd app-interface
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
```

### Backend Development
```bash
cd backend
./mvnw spring-boot:run           # Run application
./mvnw test                      # Run tests
./mvnw clean package             # Build JAR
```
## Demo video

🎥 Video Demo: https://vimeo.com/1139468578?share=copy&fl=sv&fe=ci

## API Endpoints

- `GET /events` - Get all events
- `POST /events` - Create event
- `PUT /events/{id}` - Update event
- `DELETE /events/{id}` - Delete event
- `GET /deadlines` - Get all deadlines
- `POST /deadlines` - Create deadline
- `PUT /deadlines/{id}` - Update deadline
- `DELETE /deadlines/{id}` - Delete deadline




