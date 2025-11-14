import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import EventsPage from './pages/EventsPage';
import DeadlinesPage from './pages/DeadlinesPage';
import NotesPage from './pages/NotesPage';
import DesktopDisplayPage from './pages/DesktopDisplayPage';
import NotionCallback from './components/NotionCallback';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<EventsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/deadlines" element={<DeadlinesPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/desktop" element={<DesktopDisplayPage />} />
            <Route path="/oauth/notion/callback" element={<NotionCallback />} />
          </Routes>
        </MainLayout>
      </Router>
    </DataProvider>
  );
}

export default App;
