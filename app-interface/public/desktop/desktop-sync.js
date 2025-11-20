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
    
    const startHours = eventStart.getHours();
    const startMinutes = eventStart.getMinutes();
    const startTotalMinutes = startHours * 60 + startMinutes;
    const startPosition = (startTotalMinutes / 1440) * 100;
    
    const endHours = eventEnd.getHours();
    const endMinutes = eventEnd.getMinutes();
    const endTotalMinutes = endHours * 60 + endMinutes;
    const endPosition = (endTotalMinutes / 1440) * 100;
    
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
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'event-name';
    nameDiv.textContent = event.title;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'event-time';
    timeDiv.textContent = `${startStr} - ${endStr}`;
    
    label.appendChild(nameDiv);
    label.appendChild(timeDiv);
    
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
        renderWidgets();
        
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

document.getElementById('checkBox').addEventListener('click', (e) => {
  console.log('Checkbox clicked');
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
  console.log('Yes button clicked');
  const confirmPopup = document.getElementById('confirmPopup');
  const widgetPopup = document.getElementById('widgetPopup');
  
  confirmPopup.classList.remove('show');
  widgetPopup.classList.remove('blur');
  widgetPopup.classList.remove('show');
  
  if (activeWidget) {
    const deadlineId = parseInt(activeWidget.dataset.deadlineId, 10);
    console.log('Calling markAsComplete with deadlineId:', deadlineId, 'type:', typeof deadlineId);
    markAsComplete(deadlineId);
  } else {
    console.error('No active widget found');
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
setInterval(fetchData, 10000);
