const API_BASE = window.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const WIDGET_COLOR_DETAILS = [
  { bg: '#F3B1D1', border: '#cc5d97' },
  { bg: '#BDBDBD', border: '#a1a1a1' },
  { bg: '#6FCF97', border: '#5baa52' },
  { bg: '#B298F5', border: '#8b6dc9' },
  { bg: '#9AD1E3', border: '#3aa6b0' },
  { bg: '#FFD54F', border: '#FFA000' },
  { bg: '#81C784', border: '#4CAF50' },
  { bg: '#64B5F6', border: '#2196F3' },
  { bg: '#FF8A65', border: '#FF5722' },
  { bg: '#BA68C8', border: '#9C27B0' }
];

const WIDGET_ICONS = [
  './icons/assignment.svg',
  './icons/quiz.svg',
  './icons/studying.svg',
  './icons/clean.svg',
  './icons/group discussion.svg'
];

let deadlines = [];
let events = [];
let activeWidget = null;

// ---- Electron IPC helpers ----
const isElectron = !!(window && window.electronAPI && typeof window.electronAPI.setOverlayAcceptsMouse === 'function');

function setOverlayAcceptsMouse(accept) {
  if (!isElectron) return;
  try {
    // channel name expected by main.js: 'overlay-accept-events' (update if you used different name)
    window.electronAPI.setOverlayAcceptsMouse(accept);
  } catch (e) {
    console.warn('IPC send failed:', e);
  }
}

// Debounce toggling so we don't spam IPC on small mouse moves
let acceptMouseTimeout = null;
function scheduleAcceptMouse(accept, delay = 50) {
  if (acceptMouseTimeout) {
    clearTimeout(acceptMouseTimeout);
  }
  acceptMouseTimeout = setTimeout(() => {
    setOverlayAcceptsMouse(accept);
    acceptMouseTimeout = null;
  }, delay);
}

// ---- Fetching & rendering ----
async function fetchData() {
  try {
    const [deadlinesRes, eventsRes] = await Promise.all([
      fetch(`${API_BASE}/deadlines`),
      fetch(`${API_BASE}/events`)
    ]);

    deadlines = await deadlinesRes.json();
    events = await eventsRes.json();
    renderWidgets();
    renderTimeline();

    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'none';
  } catch (error) {
    console.error('Failed to fetch data:', error);
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.textContent = 'Failed to load data. Is the backend running?';
  }
}

function renderWidgets() {
  const dock = document.getElementById('widgetDock');
  if (!dock) {
    console.warn('widgetDock not found');
    return;
  }

  const now = new Date();

  const upcomingDeadlines = deadlines
    .filter(d => d.widget && !d.completed && new Date(d.dueAt) > now)
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    .slice(0, 5);

  // Keep track of current widgets by deadlineId
  const existingWidgets = {};
  dock.querySelectorAll('.widget').forEach(widget => {
    const id = widget.dataset.deadlineId;
    if (id) existingWidgets[id] = widget;
  });

  upcomingDeadlines.forEach((deadline, index) => {
    const colorIndex = deadline.colorIndex ?? 0;
    const iconIndex = deadline.iconIndex ?? 0;
    const color = WIDGET_COLOR_DETAILS[colorIndex % WIDGET_COLOR_DETAILS.length];
    const icon = WIDGET_ICONS[iconIndex % WIDGET_ICONS.length];

    let widget = existingWidgets[deadline.id];

    if (!widget) {
      // create new widget only if it doesn't exist
      widget = document.createElement('div');
      widget.className = 'widget clickable';
      widget.dataset.deadlineId = deadline.id;
      widget.dataset.title = `${deadline.title} - due ${new Date(deadline.dueAt).toLocaleString()}`;

      const img = document.createElement('img');
      img.src = icon;
      img.alt = deadline.title;
      widget.appendChild(img);

      widget.addEventListener('click', (e) => handleWidgetClick(e, widget));

      dock.appendChild(widget);
    }

    // update widget colors and title
    widget.style.background = color.bg;
    widget.style.border = `4px solid ${color.border}`;
    widget.dataset.color = color.bg;
    widget.dataset.border = color.border;
    widget.dataset.title = `${deadline.title} - due ${new Date(deadline.dueAt).toLocaleString()}`;

    // update notification/upcoming status
    if (deadline.notificationEnabled) {
      const dueTime = new Date(deadline.dueAt);
      const notifyTime = new Date(dueTime.getTime() - (deadline.notificationMinutesBefore ?? 0) * 60000);
      if (now >= notifyTime && now <= dueTime) {
        widget.classList.add('upcoming');
      } else {
        widget.classList.remove('upcoming');
      }
    } else {
      widget.classList.remove('upcoming');
    }

    // update zIndex / transform
    const scales = [
      { translateY: 0, scale: 1.3, zIndex: 5 },
      { translateY: 4, scale: 1.15, zIndex: 4 },
      { translateY: 8, scale: 1.05, zIndex: 3 },
      { translateY: 10, scale: 0.95, zIndex: 2 },
      { translateY: 12, scale: 0.85, zIndex: 1 }
    ];
    const s = scales[index];
    widget.style.transform = `translateY(${s.translateY}px) scale(${s.scale})`;
    widget.style.zIndex = s.zIndex;
  });
}


function renderTimeline() {
  const timeline = document.getElementById('timeline');
  timeline.querySelectorAll('.event-marker, .event-label').forEach(m => m.remove());

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const todayEvents = events.filter(e => {
    const eventStart = new Date(e.startTime);
    return eventStart >= startOfDay && eventStart <= endOfDay;
  }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  todayEvents.forEach((event, index) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    const isEven = index % 2 === 0;
    
    const startTotalMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
    const endTotalMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes();
    const startPosition = (startTotalMinutes / 1440) * 100;
    const endPosition = (endTotalMinutes / 1440) * 100;
    
    const width = endPosition - startPosition;
    
    const marker = document.createElement('div');
    marker.className = 'event-marker';
    marker.style.left = `${startPosition}%`;
    marker.style.width = `${width}%`;

    const label = document.createElement('div');
    label.className = isEven ? 'event-label label-above' : 'event-label label-below';
    label.style.left = `${startPosition + (width / 2)}%`;
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'event-name';
    nameDiv.textContent = event.title;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'event-time';
    timeDiv.textContent = `${eventStart.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${eventEnd.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;

    label.appendChild(nameDiv);
    label.appendChild(timeDiv);

    timeline.appendChild(marker);
    timeline.appendChild(label);
  });

  updateCurrentTime();
}

function updateCurrentTime() {
  const now = new Date();
  const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const position = (totalSeconds / 86400) * 100;

  const currentTimeMarker = document.getElementById('currentTime');
  currentTimeMarker.style.left = `${position}%`;
  
  const passedEl = document.getElementById('timelinePassed');
  passedEl.style.width = `${position}%`; // overlay extends to current time

  // --- Glow logic for current-time marker ---
  const shouldGlow = events.some(event => {
    if (!event.notificationEnabled) return false;
    const eventStart = new Date(event.startTime);
    const notifyTime = new Date(eventStart.getTime() - (event.notificationMinutesBefore ?? 0) * 60000);
    return now >= notifyTime && now <= eventStart;
  });

  currentTimeMarker.classList.toggle('upcoming', shouldGlow);
}



function handleWidgetClick(e, widget) {
  // Important: If we are in Electron, ensure overlay accepts the click
  // we already request accept on mouseenter via mutation observer; but ensure here too
  if (isElectron) {
    // ensure clicks are captured
    scheduleAcceptMouse(true, 0);
    // release back to forward after a short delay
    setTimeout(() => scheduleAcceptMouse(false, 100), 200);
  }

  e.stopPropagation();

  const widgetPopup = document.getElementById('widgetPopup');
  const popupText = document.getElementById('popupText');

  if (!widgetPopup || !popupText) return;

  // If this widget is already active, hide popup and reset activeWidget
  if (activeWidget === widget && widgetPopup.classList.contains('show')) {
    widgetPopup.classList.remove('show');
    activeWidget = null;
    return;
  }

  // Otherwise, show popup for this widget
  activeWidget = widget;

  // Important: ensure overlay accepts the click in Electron
  if (isElectron) {
    scheduleAcceptMouse(true, 0);
    setTimeout(() => scheduleAcceptMouse(false, 100), 200);
  }

  popupText.textContent = widget.dataset.title;
  widgetPopup.style.background = widget.dataset.color;
  widgetPopup.style.border = `3px solid ${widget.dataset.border}`;

  const rect = widget.getBoundingClientRect();
  widgetPopup.style.left = (rect.left + rect.width / 2 + 30) + 'px';
  widgetPopup.style.bottom = (window.innerHeight - rect.bottom + rect.height + 20) + 'px';

  widgetPopup.classList.add('show');
}

// ---- Mark complete ----
async function markAsComplete(deadlineId) {
  console.log('markAsComplete called with deadlineId:', deadlineId);

  const donePopup = document.getElementById('donePopup');
  const doneText = document.getElementById('doneText');

  if (!donePopup || !doneText) {
    console.error('Required popup elements not found:', { donePopup: !!donePopup, doneText: !!doneText });
    return;
  }

  if (!activeWidget) {
    console.error('No active widget set');
    return;
  }

  try {
    const deadline = deadlines.find(d => d.id === deadlineId);
    console.log('Found deadline:', deadline);
    if (!deadline) {
      console.error('Deadline not found for id:', deadlineId);
      console.log('Available deadlines:', deadlines.map(d => ({ id: d.id, title: d.title })));
      return;
    }

    const requestBody = {
      ...deadline,
      completed: true
    };
    console.log('Sending request to:', `${API_BASE}/deadlines/${deadlineId}`);
    console.log('Request body:', requestBody);

    const response = await fetch(`${API_BASE}/deadlines/${deadlineId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (response.ok) {
      console.log('Successfully marked as complete');

      doneText.textContent = 'Marked as done';

      const rect = activeWidget.getBoundingClientRect();
      donePopup.style.left = (rect.left + rect.width / 2 + 60) + 'px';
      donePopup.style.bottom = (window.innerHeight - rect.top + 100) + 'px';
      donePopup.classList.add('show');

      activeWidget.classList.add('fade-out');

      setTimeout(async () => {
        console.log('Refreshing data and re-rendering widgets');
        await fetchData();
        // renderWidgets(); not necessary; fetchData triggers it
        donePopup.classList.remove('show');
      }, 500);
    } else {
      const errorText = await response.text();
      console.error('Failed to mark deadline as complete. Status:', response.status, 'Error:', errorText);
    }
  } catch (error) {
    console.error('Failed to mark deadline as complete:', error);
  }
}

// ---- UI event wiring (confirm dialogs etc.) ----
function setupPopupButtons() {
  const checkBox = document.getElementById('checkBox');
  if (checkBox) {
    checkBox.addEventListener('click', (e) => {
      e.stopPropagation();
      const widgetPopup = document.getElementById('widgetPopup');
      const confirmPopup = document.getElementById('confirmPopup');

      widgetPopup.classList.add('blur');

      const rect = widgetPopup.getBoundingClientRect();
      confirmPopup.style.left = (rect.left + rect.width / 2) + 'px';
      confirmPopup.style.bottom = (window.innerHeight - rect.top + 60) + 'px';
      confirmPopup.style.transform = 'translateX(-50%)';
      confirmPopup.classList.add('show');
    });
  }

  const yesBtn = document.getElementById('yesBtn');
  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      const confirmPopup = document.getElementById('confirmPopup');
      const widgetPopup = document.getElementById('widgetPopup');

      confirmPopup.classList.remove('show');
      widgetPopup.classList.remove('blur');
      widgetPopup.classList.remove('show');

      if (activeWidget) {
        const deadlineId = parseInt(activeWidget.dataset.deadlineId, 10);
        markAsComplete(deadlineId);
      } else {
        console.error('No active widget found');
      }
    });
  }

  const noBtn = document.getElementById('noBtn');
  if (noBtn) {
    noBtn.addEventListener('click', () => {
      const confirmPopup = document.getElementById('confirmPopup');
      const widgetPopup = document.getElementById('widgetPopup');

      confirmPopup.classList.remove('show');
      widgetPopup.classList.remove('blur');
    });
  }

  // document click closes popups
  document.addEventListener('click', (e) => {
    const widgetPopup = document.getElementById('widgetPopup');
    const confirmPopup = document.getElementById('confirmPopup');
    const donePopup = document.getElementById('donePopup');

    if (widgetPopup && !widgetPopup.contains(e.target) && confirmPopup && !confirmPopup.contains(e.target)) {
      widgetPopup.classList.remove('show');
      confirmPopup.classList.remove('show');
      donePopup && donePopup.classList.remove('show');
    }
  });
}

// ---- Clickable overlay support ----
// Core idea: make overlay ignore mouse events by default (pointer-events:none on root),
// but when user hovers or presses a `.clickable` element, tell main process to stop ignoring mouse events
// so Electron receives the click. After a short timeout, re-enable ignore/forward mode.

function attachClickableListeners(root = document) {
  // attach handlers to existing clickable elements
  function addTo(el) {
    if (el.__clickableAttached) return;
    el.__clickableAttached = true;

    // Hover in -> request overlay accept events
    el.addEventListener('mouseenter', () => {
      scheduleAcceptMouse(true, 25);
      // also ensure DOM-level pointer-events allow interaction
      el.style.pointerEvents = 'auto';
    });

    // Hover out -> restore passthrough
    el.addEventListener('mouseleave', () => {
      // small delay before re-forwarding to avoid flicker
      scheduleAcceptMouse(false, 120);
    });

    // On mousedown, ensure the overlay accepts events immediately (for click)
    el.addEventListener('mousedown', () => {
      scheduleAcceptMouse(true, 0);
    });

    // On mouseup, re-forward back after a short delay
    el.addEventListener('mouseup', () => {
      scheduleAcceptMouse(false, 150);
    });

    // Touch support (mobile/touchscreens)
    el.addEventListener('touchstart', () => {
      scheduleAcceptMouse(true, 0);
    });
    el.addEventListener('touchend', () => {
      scheduleAcceptMouse(false, 150);
    });
  }

  // find current clickable nodes
  const nodes = root.querySelectorAll && root.querySelectorAll('.clickable');
  if (nodes && nodes.length) {
    nodes.forEach(addTo);
  }

  // observe DOM mutations to auto-attach to new elements
  if (!attachClickableListeners._observer) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        // check added nodes for clickable class
        (m.addedNodes || []).forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          if (node.classList && node.classList.contains('clickable')) addTo(node);
          // also attach to descendants
          if (node.querySelectorAll) {
            node.querySelectorAll('.clickable').forEach(addTo);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    attachClickableListeners._observer = observer;
  }
}

// ---- Initialization ----
function initOverlayBehavior() {
  // Make overlay DOM non-interactive by default so clicks go through
  // Prefer targeting a wrapper if you have one (e.g., #overlay). Fallback to body.
  const overlayRoot = document.getElementById('overlay') || document.body;
  overlayRoot.style.pointerEvents = 'none';

  // clickable elements must also set pointerEvents:auto locally to enable hover styles
  // but actual accepting of clicks is done via IPC toggles above.
  const style = document.createElement('style');
  style.innerHTML = `
    .clickable { pointer-events: auto !important; }
    .widget, .event-marker, .event-label { -webkit-user-select: none; user-select: none; }
  `;
  document.head.appendChild(style);

  // attach listeners for any existing and future .clickable elements
  attachClickableListeners(document);

  // Make sure any UI popups which are interactive have .clickable class
  // e.g. #widgetPopup, #confirmPopup, #donePopup, buttons inside them
  ['widgetPopup', 'confirmPopup', 'donePopup'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('clickable');
      // ensure children (buttons) are clickable too
      el.querySelectorAll('button, input, a').forEach(b => b.classList.add('clickable'));
    }
  });

  // When the window is blurred (user switches away), make sure overlay returns to passthrough mode
  window.addEventListener('blur', () => {
    scheduleAcceptMouse(false, 50);
  });
}

// ---- Bootstrapping ----
document.addEventListener('DOMContentLoaded', () => {
  try {
    // initial UI wiring
    setupPopupButtons();

    // Fetch & render initial data
    fetchData();

    // keep timeline time updated
    setInterval(updateCurrentTime, 60000);

    // background refresh — you can increase interval to reduce network usage
    setInterval(fetchData, 10000);

    // initialize overlay click-through behavior (relies on .clickable classes)
    initOverlayBehavior();

    console.log('desktop-sync initialized (electron=' + isElectron + ')');
  } catch (e) {
    console.error('desktop-sync initialization error:', e);
  }
});
