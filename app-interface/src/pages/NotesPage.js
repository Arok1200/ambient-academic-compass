import React, { useState } from 'react';
import { NOTE_COLORS } from '../constants/colors';
import AddButton from '../components/AddButton';
import { NoteModal } from '../components/modals';

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const handleSubmitNote = (formData) => {
    if (editingNote) {
      setNotes(notes.map(n => 
        n.id === editingNote.id 
          ? { ...n, content: formData.text, colorIndex: formData.colorIndex }
          : n
      ));
      setEditingNote(null);
    } else {
      const newNote = {
        id: Date.now(),
        content: formData.text,
        author: 'Anonymous',
        colorIndex: formData.colorIndex
      };
      setNotes([...notes, newNote]);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowModal(true);
  };

  const handleDeleteNote = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  const getNoteColor = (colorIndex) => {
    return NOTE_COLORS[colorIndex % NOTE_COLORS.length];
  };

  return (
    <div className="notes-page-container">
      <div className="notes-content">
        {notes.length === 0 && (
          <p className="notes-empty-message">
            No notes yet. Click "Add Note +" below to create your first note!
          </p>
        )}
        
        {notes.length > 0 && (
          <div className="notes-grid">
            {notes.map(note => (
              <div 
                key={note.id} 
                className="note-card"
                style={{ backgroundColor: getNoteColor(note.colorIndex) }}
              >
                <div className="note-content-text">
                  {note.content}
                </div>
                
                <div className="note-footer">
                  <div className="note-author">{note.author}</div>
                  <div className="note-actions">
                    <button 
                      className="note-action-btn"
                      onClick={() => handleEditNote(note)}
                      title="Edit note"
                    >
                      ✏️
                    </button>
                    <button 
                      className="note-action-btn"
                      onClick={() => handleDeleteNote(note.id)}
                      title="Delete note"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <AddButton label="Add Note +" onClick={() => { setEditingNote(null); setShowModal(true); }} />

      <NoteModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingNote(null); }}
        onSubmit={handleSubmitNote}
        initialData={editingNote ? { text: editingNote.content, colorIndex: editingNote.colorIndex } : null}
      />
    </div>
  );
}

export default NotesPage;
