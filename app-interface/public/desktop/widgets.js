const widgets = document.querySelectorAll('.widget');
let activePill = null;
let popup = null;
let success = null;

widgets.forEach(widget => {
  widget.addEventListener('click', (e) => {
    e.stopPropagation();

    document.querySelectorAll('.task-pill, .popup, .success').forEach(el => el.remove());
    activePill = null;

    const pill = document.createElement('div');
    pill.className = 'task-pill show';
    pill.style.border = `2px solid ${widget.dataset.color}`;
    pill.innerHTML = `
      <input type="checkbox" />
      <span>${widget.dataset.task}</span>
      <span class="edit">✏️</span>
    `;
    widget.appendChild(pill);
    activePill = pill;

    const checkbox = pill.querySelector('input');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) showConfirm(widget, pill);
    });
  });
});

function showConfirm(widget, pill) {
  popup = document.createElement('div');
  popup.className = 'popup show';
  popup.innerHTML = `
    <p style="margin:0; font-weight:bold;">Mark as done?</p>
    <div>
      <button class="yes">Yes</button>
      <button class="no">No</button>
    </div>
  `;
  widget.appendChild(popup);

  popup.querySelector('.yes').onclick = () => {
    popup.remove();
    showSuccess(widget);
    pill.remove();
  };

  popup.querySelector('.no').onclick = () => {
    popup.remove();
    pill.remove();
  };
}

function showSuccess(widget) {
  success = document.createElement('div');
  success.className = 'success show';
  success.innerHTML = `<p>Marked as done 😊</p>`;
  widget.appendChild(success);
  setTimeout(() => success.remove(), 3000);
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.widget')) {
    document.querySelectorAll('.task-pill, .popup, .success').forEach(el => el.remove());
  }
});

console.log("Widgets interactive — click to mark tasks done.");
