export default function DeleteDeadlineModal({ deadline, onClose, onConfirm }) {
  if (!deadline) return null; // <- prevents runtime error

  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        <h2>Delete Deadline</h2>
        <p>Are you sure you want to delete "{deadline.title}"?</p>
        <div className="buttons">
          <button className="confirm" onClick={onConfirm}>Yes</button>
          <button className="cancel" onClick={onClose}>No</button>
        </div>
      </div>
    </div>
  );
}
