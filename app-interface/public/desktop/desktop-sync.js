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
  if (!dock) return;

  const now = new Date();

  const upcomingDeadlines = deadlines
    .filter(d => d.widget && !d.completed && new Date(d.dueAt) > now)
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    .slice(0, 5);

  const existingWidgets = {};
  dock.querySelectorAll('.widget').forEach(w => {
    existingWidgets[w.dataset.deadlineId] = w;
  });

  upcomingDeadlines.forEach((deadline, index) => {
    const color = WIDGET_COLOR_DETAILS[deadline.colorIndex ?? 0 % WIDGET_COLOR_DETAILS.length];
    const icon = WIDGET_ICONS[deadline.iconIndex ?? 0 % WIDGET_ICONS.length];

    let widget = existingWidgets[deadline.id];
    if (!widget) {
      widget = document.createElement('div');
      widget.className = 'widget clickable';
      widget.dataset.deadlineId = deadline.id;

      const img = document.createElement('img');
      img.src = icon;
      img.alt = deadline.title;
      widget.appendChild(img);

      widget.addEventListener('click', e => handleWidgetClick(e, widget));
      dock.appendChild(widget);
      attachClickableListeners(widget);
    }

    // Update attributes & styles
    widget.dataset.title = `${deadline.title} - due ${new Date(deadline.dueAt).toLocaleString()}`;
    widget.style.background = color.bg;
    widget.style.border = `4px solid ${color.border}`;
    widget.dataset.color = color.bg;
    widget.dataset.border = color.border;

    const scales = [
      { translateY: 0, scale: 1.3, zIndex: 5 },
      { translateY: 4, scale: 1.15, zIndex: 4 },
      { translateY: 8, scale: 1.05, zIndex: 3 },
      { translateY: 10, scale: 0.95, zIndex: 2 },
      { translateY: 12, scale: 0.85, zIndex: 1 }
    ];
    const s = scales[index] || scales[scales.length - 1];
    widget.style.transform = `translateY(${s.translateY}px) scale(${s.scale})`;
    widget.style.zIndex = s.zIndex;

    // Toggle upcoming animation
    if (deadline.notificationEnabled) {
      const dueTime = new Date(deadline.dueAt);
      const notifyTime = new Date(dueTime.getTime() - (deadline.notificationMinutesBefore ?? 0) * 60000);
      widget.classList.toggle('upcoming', now >= notifyTime && now <= dueTime);
    } else {
      widget.classList.remove('upcoming');
    }

    delete existingWidgets[deadline.id];
  });

  // Remove any leftover widgets
  Object.values(existingWidgets).forEach(w => w.remove());
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

// Dismiss all glowing notifications when circle is clicked
async function dismissActiveNotifications() {
  const now = new Date();
  const eventsToUpdate = events.filter(event => {
    if (!event.notificationEnabled) return false;
    const eventStart = new Date(event.startTime);
    const notifyTime = new Date(eventStart.getTime() - (event.notificationMinutesBefore ?? 0) * 60000);
    return now >= notifyTime && now <= eventStart;
  });

  // Disable notifications for all glowing events
  for (const event of eventsToUpdate) {
    try {
      const updated = { ...event, notificationEnabled: false, notificationMinutesBefore: null };
      await fetch(`${API_BASE}/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error('Failed to dismiss notification for event:', event.id, err);
    }
  }

  // Refresh data to update UI
  await fetchData();
}

function updateTimelineColors(backgroundColor, borderColor) {
  const timelineBars = document.querySelectorAll('.timeline-bar');
  timelineBars.forEach(bar => {
    bar.style.background = backgroundColor;
    if (borderColor) {
      bar.style.border = `2px solid ${borderColor}`;
    }
  });
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
  widgetPopup.classList.add('clickable');
  widgetPopup.querySelectorAll('*').forEach(el => el.classList.add('clickable'));
  attachClickableListeners(widgetPopup);
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
      doneText.textContent = 'Marked as done';

      // Position the donePopup **just above the widget**
      const rect = activeWidget.getBoundingClientRect();
      donePopup.style.left = (rect.left + rect.width / 2) + 'px';
      donePopup.style.bottom = (window.innerHeight - rect.top + rect.height + 10) + 'px'; // closer to widget
      donePopup.style.transform = 'translateX(-50%)';
      donePopup.classList.add('show');
      donePopup.classList.add('clickable');
      donePopup.querySelectorAll('*').forEach(el => el.classList.add('clickable'));

      // Slower fade
      activeWidget.style.transition = 'opacity 1s, transform 1s';
      activeWidget.classList.add('fade-out');

      setTimeout(async () => {
        await fetchData();
        donePopup.classList.remove('show');
      }, 1000); // wait 1s for fade
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
      checkBox.addEventListener('click', async (e) => {
        e.stopPropagation();
        const widgetPopup = document.getElementById('widgetPopup');

        // Hide the widget popup immediately
        if (widgetPopup) {
          widgetPopup.classList.remove('show');
        }

        if (!activeWidget) return;

        const deadlineId = parseInt(activeWidget.dataset.deadlineId, 10);
        await markAsComplete(deadlineId);
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

// ---- Platform-specific positioning ----
function adjustPlatformPositioning() {
  // Detect platform - macOS needs more space from bottom (dock is hidden from CSS calculations)
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  if (isMac) {
    // Adjust widgets dock
    const dock = document.getElementById('widgetDock');
    if (dock) dock.style.bottom = '130px'; // Default is 30px
    
    // Adjust timeline container
    const timeline = document.getElementById('timeline');
    if (timeline) timeline.style.bottom = '120px'; // Default is 20px
    
    // Adjust time labels (now below the bar)
    const timeLabels = document.querySelector('.time-labels');
    if (timeLabels) timeLabels.style.bottom = '80px'; // Default is 0px (below bar)
  }
}

// ---- Settings synchronization ----
function applySettings(settings) {
  const dock = document.getElementById('widgetDock');
  const timeline = document.getElementById('timeline');
  const timeLabels = document.querySelector('.time-labels');
  
  if (settings.widgetsEnabled !== undefined) {
    if (dock) {
      dock.style.display = settings.widgetsEnabled ? 'flex' : 'none';
      dock.style.pointerEvents = settings.widgetsEnabled ? 'auto' : 'none';
    }
  }
  
  if (settings.progressBarEnabled !== undefined) {
    if (timeline) {
      timeline.style.display = settings.progressBarEnabled ? 'block' : 'none';
      timeline.style.pointerEvents = settings.progressBarEnabled ? 'auto' : 'none';
    }
    if (timeLabels) {
      timeLabels.style.display = settings.progressBarEnabled ? 'flex' : 'none';
      timeLabels.style.pointerEvents = settings.progressBarEnabled ? 'auto' : 'none';
    }
  }
}

function loadSettings() {
  // Load from localStorage
  const widgetsEnabled = localStorage.getItem('widgetsEnabled');
  const progressBarEnabled = localStorage.getItem('progressBarEnabled');
  const progressBarColorIndex = localStorage.getItem('progressBarColorIndex');
  
  applySettings({
    widgetsEnabled: widgetsEnabled !== null ? JSON.parse(widgetsEnabled) : true,
    progressBarEnabled: progressBarEnabled !== null ? JSON.parse(progressBarEnabled) : true
  });
  
  // Apply saved color if available
  if (progressBarColorIndex !== null) {
    const PROGRESS_BAR_COLORS = [
      { color: '#ffffff', border: '#333333' }, { color: '#e5e5e5', border: '#999999' },
      { color: '#FFF9C4', border: '#ccca9d' }, { color: '#FFCCBC', border: '#cca295' },
      { color: '#C8E6C9', border: '#a1b8a2' }, { color: '#BBDEFB', border: '#95b1cb' },
      { color: '#F8BBD0', border: '#c995a6' }, { color: '#E1BEE7', border: '#b598ba' },
      { color: '#0066ff', border: '#004499' }, { color: '#00ff66', border: '#00cc52' },
      { color: '#ffb6c1', border: '#cc9199' }, { color: '#9892ff', border: '#7b75cc' },
      { color: '#00ffff', border: '#00cccc' }, { color: '#ccff00', border: '#a6cc00' },
      { color: '#ff00ff', border: '#cc00cc' }, { color: '#ffff00', border: '#cccc00' },
      { color: '#4169e1', border: '#2854b4' }, { color: '#228b22', border: '#1b6b1b' },
      { color: '#87ceeb', border: '#6ba6cd' }, { color: '#98fb98', border: '#7bc97b' },
      { color: '#dda0dd', border: '#b87db8' }, { color: '#F3B1D1', border: '#cc5d97' },
      { color: '#BDBDBD', border: '#a1a1a1' }, { color: '#6FCF97', border: '#5baa52' },
      { color: '#B298F5', border: '#8b6dc9' }, { color: '#9AD1E3', border: '#3aa6b0' },
      { color: '#c0c0c0', border: '#999999' }, { color: '#ffd700', border: '#ccac00' },
      { color: '#ffa500', border: '#cc8400' }, { color: '#40e0d0', border: '#33b3a6' },
      { color: '#8a2be2', border: '#6b22b5' }, { color: '#00ff7f', border: '#00cc66' },
      { color: '#00bfff', border: '#0099cc' }, { color: '#ba55d3', border: '#9444a6' },
      { color: '#7fffd4', border: '#66cca7' }, { color: '#8a2be2', border: '#6b22b5' },
      { color: '#7fff00', border: '#66cc00' }
    ];
    const index = parseInt(progressBarColorIndex, 10);
    if (index >= 0 && index < PROGRESS_BAR_COLORS.length) {
      const color = PROGRESS_BAR_COLORS[index];
      updateTimelineColors(color.color, color.border);
    }
  }
}

// ---- Bootstrapping ----
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Adjust positions based on platform
    adjustPlatformPositioning();
    
    // Load and apply settings
    loadSettings();
    
    // Listen for settings updates from main app
    if (isElectron && window.electronAPI && window.electronAPI.onUpdateSettings) {
      window.electronAPI.onUpdateSettings((settings) => {
        // Also update localStorage so it persists
        if (settings.widgetsEnabled !== undefined) {
          localStorage.setItem('widgetsEnabled', JSON.stringify(settings.widgetsEnabled));
        }
        if (settings.progressBarEnabled !== undefined) {
          localStorage.setItem('progressBarEnabled', JSON.stringify(settings.progressBarEnabled));
        }
        // Persist color if provided
        if (settings.progressBarColor !== undefined) {
          localStorage.setItem('progressBarColor', settings.progressBarColor);
        }
        if (settings.progressBarBorder !== undefined) {
          localStorage.setItem('progressBarBorder', settings.progressBarBorder);
        }
        applySettings(settings);

        const timeline = document.getElementById('timeline'); // the container
        if (timeline) {
          if (settings.progressBarColor) timeline.style.backgroundColor = settings.progressBarColor;
          if (settings.progressBarBorder) timeline.style.borderColor = settings.progressBarBorder;
        }
      });
    }
    
    // Listen for color updates from main app
    if (isElectron && window.electronAPI && window.electronAPI.onUpdateColors) {
      window.electronAPI.onUpdateColors((colors) => {
        console.log('Received color update:', colors);
        if (colors.colorIndex !== undefined) {
          localStorage.setItem('progressBarColorIndex', colors.colorIndex.toString());
        }
        if (colors.backgroundColor && colors.borderColor) {
          updateTimelineColors(colors.backgroundColor, colors.borderColor);
        }
      });
    }
    
    // initial UI wiring
    setupPopupButtons();

    // Add click handler to current time marker for dismissing notifications
    const currentTimeMarker = document.getElementById('currentTime');
    if (currentTimeMarker) {
      // Enable mouse events when hovering over glowing circle
      currentTimeMarker.addEventListener('mouseenter', () => {
        if (currentTimeMarker.classList.contains('upcoming')) {
          scheduleAcceptMouse(true, 25);
        }
      });

      currentTimeMarker.addEventListener('mouseleave', () => {
        if (currentTimeMarker.classList.contains('upcoming')) {
          scheduleAcceptMouse(false, 120);
        }
      });

      currentTimeMarker.addEventListener('mousedown', () => {
        if (currentTimeMarker.classList.contains('upcoming')) {
          scheduleAcceptMouse(true, 0);
        }
      });

      currentTimeMarker.addEventListener('click', async () => {
        if (currentTimeMarker.classList.contains('upcoming')) {
          await dismissActiveNotifications();
        }
      });
    }

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
