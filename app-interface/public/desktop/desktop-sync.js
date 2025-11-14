const API_BASE = window.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const widgetColors = [
  { bg: '#F3B1D1', border: '#cc5d97' },
  { bg: '#BDBDBD', border: '#a1a1a1' },
  { bg: '#6FCF97', border: '#5baa52' },
  { bg: '#B298F5', border: '#8b6dc9' },
  { bg: '#9AD1E3', border: '#3aa6b0' }
];

const widgetIcons = [
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
    updateCalendarStats();
    
    document.getElementById('loading').style.display = 'none';
  } catch (error) {
    console.error('Failed to fetch data:', error);
    document.getElementById('loading').textContent = 'Failed to load data. Is the backend running?';
  }
}

function renderWidgets() {
  const dock = document.getElementById('widgetDock');
  
  const existingWidgets = dock.querySelectorAll('.widget:not(.calendar)');
  existingWidgets.forEach(w => w.remove());
  
  const upcomingDeadlines = deadlines
    .filter(d => !d.completed && new Date(d.dueAt) > new Date())
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    .slice(0, 5);
  
  upcomingDeadlines.forEach((deadline, index) => {
    const widget = document.createElement('div');
    widget.className = 'widget';
    if (index === 0) widget.classList.add('upcoming');
    
    const color = widgetColors[index % widgetColors.length];
    const icon = widgetIcons[index % widgetIcons.length];
    
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
  
  todayEvents.forEach(event => {
    const eventTime = new Date(event.startTime);
    const hours = eventTime.getHours();
    const minutes = eventTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const position = (totalMinutes / 1440) * 100;
    
    const marker = document.createElement('div');
    marker.className = 'event-marker';
    marker.style.left = `${position}%`;
    
    const label = document.createElement('div');
    label.className = 'event-label';
    label.style.left = `${position}%`;
    label.textContent = `${eventTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })} - ${event.title}`;
    
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

function updateCalendarStats() {
  const completedDeadlines = deadlines.filter(d => d.completed).length;
  const totalDeadlines = deadlines.length;
  
  document.getElementById('completedCount').textContent = completedDeadlines;
  document.getElementById('deadlineCount').textContent = totalDeadlines - completedDeadlines;
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

document.getElementById('calendarWidget').addEventListener('click', (e) => {
  e.stopPropagation();
  const calendarPopup = document.getElementById('calendarPopup');
  const rect = e.target.getBoundingClientRect();
  calendarPopup.style.left = (rect.left + 20) + 'px';
  calendarPopup.style.bottom = (window.innerHeight - rect.top + 150) + 'px';
  calendarPopup.classList.toggle('show');
});

document.getElementById('calendarClose').addEventListener('click', () => {
  document.getElementById('calendarPopup').classList.remove('show');
});

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
  const calendarPopup = document.getElementById('calendarPopup');
  const donePopup = document.getElementById('donePopup');
  
  if (!widgetPopup.contains(e.target) && !confirmPopup.contains(e.target)) {
    widgetPopup.classList.remove('show');
    confirmPopup.classList.remove('show');
    donePopup.classList.remove('show');
  }
  
  if (!calendarPopup.contains(e.target) && !e.target.closest('.calendar')) {
    calendarPopup.classList.remove('show');
  }
});

fetchData();
setInterval(updateCurrentTime, 60000);
setInterval(fetchData, 30000);
