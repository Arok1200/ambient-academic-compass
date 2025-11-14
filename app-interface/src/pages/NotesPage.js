import React, { useState } from 'react';
import { NOTE_COLORS } from '../constants/colors';
import AddButton from '../components/AddButton';

function NotesPage() {
  const [notes, setNotes] = useState([]);

  const handleAddNote = () => {
    const content = prompt('Enter note content:');
    if (!content) return;
    
    const author = prompt('Enter your name (optional):', 'Anonymous');
    
    const newNote = {
      id: Date.now(),
      content: content.trim(),
      author: author?.trim() || 'Anonymous',
      colorIndex: notes.length % 6 // Cycle through 6 colors
    };
    
    setNotes([...notes, newNote]);
  };

  const handleEditNote = (id) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    const newContent = prompt('Edit note content:', note.content);
    if (newContent === null) return;
    
    const newAuthor = prompt('Edit author name:', note.author);
    
    setNotes(notes.map(n => 
      n.id === id 
        ? { ...n, content: newContent.trim(), author: newAuthor?.trim() || note.author }
        : n
    ));
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
                      onClick={() => handleEditNote(note.id)}
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
      
      <AddButton label="Add Note +" onClick={handleAddNote} />
    </div>
  );
}

export default NotesPage;
