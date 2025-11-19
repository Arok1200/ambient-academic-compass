const API_BASE = window.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// Match the colors from the main interface (WIDGET_COLOR_DETAILS)
const WIDGET_COLOR_DETAILS = [
  { bg: '#F3B1D1', border: '#cc5d97' }, // Pink
  { bg: '#BDBDBD', border: '#a1a1a1' }, // Gray
  { bg: '#6FCF97', border: '#5baa52' }, // Green
  { bg: '#B298F5', border: '#8b6dc9' }, // Purple
  { bg: '#9AD1E3', border: '#3aa6b0' }, // Blue
  { bg: '#FFD54F', border: '#FFA000' }, // Yellow
  { bg: '#81C784', border: '#4CAF50' }, // Light Green
  { bg: '#64B5F6', border: '#2196F3' }, // Light Blue
  { bg: '#FF8A65', border: '#FF5722' }, // Orange
  { bg: '#BA68C8', border: '#9C27B0' }  // Light Purple
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
    
    document.getElementById('loading').style.display = 'none';
  } catch (error) {
    console.error('Failed to fetch data:', error);
    document.getElementById('loading').textContent = 'Failed to load data. Is the backend running?';
  }
}

function renderWidgets() {
  const dock = document.getElementById('widgetDock');
  
  const existingWidgets = dock.querySelectorAll('.widget');
  existingWidgets.forEach(w => w.remove());
  
  const upcomingDeadlines = deadlines
    .filter(d => !d.completed && new Date(d.dueAt) > new Date())
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    .slice(0, 5);
  
  upcomingDeadlines.forEach((deadline, index) => {
    const widget = document.createElement('div');
    widget.className = 'widget';
    if (index === 0) widget.classList.add('upcoming');
    
    // Use the deadline's actual colorIndex and iconIndex from the database
    const colorIndex = deadline.colorIndex ?? 0;
    const iconIndex = deadline.iconIndex ?? 0;
    const color = WIDGET_COLOR_DETAILS[colorIndex % WIDGET_COLOR_DETAILS.length];
    const icon = WIDGET_ICONS[iconIndex % WIDGET_ICONS.length];
    
    widget.style.background = color.bg;
    widget.style.border = `4px solid ${color.border}`;
    widget.dataset.color = color.bg;
    widget.dataset.border = color.border;
    widget.dataset.deadlineId = deadline.id;
    widget.dataset.title = `${deadline.title} - due ${new Date(deadline.dueAt).toLocaleString()}`;
    
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
    
    const img = document.createElement('img');
    img.src = icon;
    img.alt = deadline.title;
    widget.appendChild(img);
    
    widget.addEventListener('click', (e) => handleWidgetClick(e, widget));
    
    dock.appendChild(widget);
  });
}

function renderTimeline() {
  const timeline = document.getElementById('timeline');
  
  const existingMarkers = timeline.querySelectorAll('.event-marker, .event-label');
  existingMarkers.forEach(m => m.remove());
  
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
    
    // Calculate start position
    const startHours = eventStart.getHours();
    const startMinutes = eventStart.getMinutes();
    const startTotalMinutes = startHours * 60 + startMinutes;
    const startPosition = (startTotalMinutes / 1440) * 100;
    
    // Calculate end position
    const endHours = eventEnd.getHours();
    const endMinutes = eventEnd.getMinutes();
    const endTotalMinutes = endHours * 60 + endMinutes;
    const endPosition = (endTotalMinutes / 1440) * 100;
    
    // Calculate width (duration)
    const width = endPosition - startPosition;
    
    const marker = document.createElement('div');
    marker.className = 'event-marker';
    marker.style.left = `${startPosition}%`;
    marker.style.width = `${width}%`;
    
    const label = document.createElement('div');
    label.className = isEven ? 'event-label label-above' : 'event-label label-below';
    label.style.left = `${startPosition + (width / 2)}%`;
    
    const startStr = eventStart.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const endStr = eventEnd.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    // Create time and title elements to match main interface
    const timeDiv = document.createElement('div');
    timeDiv.className = 'event-time';
    timeDiv.textContent = `${startStr} - ${endStr}`;
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'event-name';
    nameDiv.textContent = event.title;
    
    label.appendChild(timeDiv);
    label.appendChild(nameDiv);
    
    timeline.appendChild(marker);
    timeline.appendChild(label);
  });
  
  updateCurrentTime();
}

function updateCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const position = (totalSeconds / 86400) * 100;
  
  document.getElementById('currentTime').style.left = `${position}%`;
}

function handleWidgetClick(e, widget) {
  e.stopPropagation();
  
  const widgetPopup = document.getElementById('widgetPopup');
  const popupText = document.getElementById('popupText');
  
  popupText.textContent = widget.dataset.title;
  widgetPopup.style.background = widget.dataset.color;
  widgetPopup.style.border = `3px solid ${widget.dataset.border}`;
  
  const rect = widget.getBoundingClientRect();
  widgetPopup.style.left = (rect.left + rect.width / 2 + 30) + 'px';
  widgetPopup.style.bottom = (window.innerHeight - rect.bottom + rect.height + 20) + 'px';
  
  widgetPopup.classList.add('show');
  activeWidget = widget;
}

async function markAsComplete(deadlineId) {
  try {
    const deadline = deadlines.find(d => d.id === deadlineId);
    if (!deadline) return;
    
    const response = await fetch(`${API_BASE}/deadlines/${deadlineId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...deadline,
        completed: true
      })
    });
    
    if (response.ok) {
      await fetchData();
      
      const donePopup = document.getElementById('donePopup');
      const doneText = document.getElementById('doneText');
      
      doneText.textContent = 'Marked as done';
      
      const rect = activeWidget.getBoundingClientRect();
      donePopup.style.left = (rect.left + rect.width / 2 + 60) + 'px';
      donePopup.style.bottom = (window.innerHeight - rect.top + 100) + 'px';
      donePopup.classList.add('show');
      
      activeWidget.classList.add('fade-out');
      
      setTimeout(() => {
        activeWidget.classList.add('hidden');
        donePopup.classList.remove('show');
      }, 500);
    }
  } catch (error) {
    console.error('Failed to mark deadline as complete:', error);
  }
}

document.getElementById('checkBox').addEventListener('click', (e) => {
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

document.getElementById('yesBtn').addEventListener('click', () => {
  const confirmPopup = document.getElementById('confirmPopup');
  const widgetPopup = document.getElementById('widgetPopup');
  
  confirmPopup.classList.remove('show');
  widgetPopup.classList.remove('blur');
  widgetPopup.classList.remove('show');
  
  if (activeWidget) {
    const deadlineId = activeWidget.dataset.deadlineId;
    markAsComplete(deadlineId);
  }
});

document.getElementById('noBtn').addEventListener('click', () => {
  const confirmPopup = document.getElementById('confirmPopup');
  const widgetPopup = document.getElementById('widgetPopup');
  
  confirmPopup.classList.remove('show');
  widgetPopup.classList.remove('blur');
});

document.addEventListener('click', (e) => {
  const widgetPopup = document.getElementById('widgetPopup');
  const confirmPopup = document.getElementById('confirmPopup');
  const donePopup = document.getElementById('donePopup');
  
  if (!widgetPopup.contains(e.target) && !confirmPopup.contains(e.target)) {
    widgetPopup.classList.remove('show');
    confirmPopup.classList.remove('show');
    donePopup.classList.remove('show');
  }
});

fetchData();
setInterval(updateCurrentTime, 60000);
setInterval(fetchData, 30000);
