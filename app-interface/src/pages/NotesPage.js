import React, { useState, useEffect } from 'react';
import { NOTE_COLORS } from '../constants/colors';
import AddButton from '../components/AddButton';
import { NoteModal, DeleteNoteModal } from '../components/modals';

const API_URL = 'http://localhost:8080/api/notes';


const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingNote, setDeletingNote] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (formData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: formData.text,
          author: 'Anonymous',
          colorIndex: formData.colorIndex
        })
      });
      const newNote = await response.json();
      setNotes([...notes, newNote]);
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleNoteChange = (id, newContent) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content: newContent } : n));
  };

  const handleNoteBlur = async (note) => {
    try {
      await fetch(`${API_URL}/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: note.content,
          author: note.author,
          colorIndex: note.colorIndex
        })
      });
    } catch (error) {
      console.error('Failed to update note:', error);
      alert('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = (note) => {
    setDeletingNote(note);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingNote) return;
    try {
      await fetch(`${API_URL}/${deletingNote.id}`, { method: 'DELETE' });
      setNotes(notes.filter(n => n.id !== deletingNote.id));
      setDeleteModalOpen(false);
      setDeletingNote(null);
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const getNoteColor = (colorIndex) => {
    return NOTE_COLORS[colorIndex % NOTE_COLORS.length];
  };

  return (
    <div className="notes-page-container">
      <div className="notes-content">
        {loading && (
          <p className="notes-empty-message">Loading notes...</p>
        )}
        
        {!loading && notes.length === 0 && (
          <p className="notes-empty-message">
            No notes yet. Click "Add Note +" below to create your first note!
          </p>
        )}
        
        {!loading && notes.length > 0 && (
          <div className="notes-grid">
            {notes.map(note => (
              <div 
                key={note.id} 
                className="note-card"
                style={{ backgroundColor: getNoteColor(note.colorIndex) }}
              >
                <textarea
                  className="note-content-editable"
                  value={note.content}
                  onChange={(e) => handleNoteChange(note.id, e.target.value)}
                  onBlur={() => handleNoteBlur(note)}
                  placeholder="Type your note here..."
                />
                
                <div className="note-footer">
                  <div className="note-author">{note.author}</div>
                  <div className="note-actions">
                    <button 
                      className="note-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note);
                      }}
                      title="Delete note"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <AddButton label="Add Note +" onClick={() => setShowModal(true)} />

      <NoteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddNote}
        initialData={null}
      />

      <DeleteNoteModal
        note={deletingNote}
        onClose={() => { setDeleteModalOpen(false); setDeletingNote(null); }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default NotesPage;
