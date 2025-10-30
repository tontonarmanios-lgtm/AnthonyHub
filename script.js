
const announcements = [
  {text: 'Welcome to Anthony Hub — check the calendar for rehearsal updates.'},
  {text: 'Reminder: Tech rehearsal Saturday at 10:00.'}
];
const announceBox = document.getElementById('announceBox');
let announceIndex = 0;
function renderAnnouncement(){
  if(!announceBox) return;
  announceBox.textContent = announcements[announceIndex].text;
}
function rotateAnnouncements(){
  announceIndex = (announceIndex + 1) % announcements.length;
  renderAnnouncement();
}
renderAnnouncement();
setInterval(rotateAnnouncements, 6000);
document.getElementById('postAnnouncementBtn')?.addEventListener('click', ()=>{
  const text = prompt('Add announcement (local only):');
  if(text){announcements.push({text}); announceIndex = announcements.length-1; renderAnnouncement();}
});

const events = [
  {date:'2025-11-15', title:'Rehearsal: Act I', time:'18:00'},
  {date:'2025-11-20', title:'Tech Rehearsal', time:'10:00'},
  {date:'2025-12-01', title:'Production Meeting', time:'13:00'}
];
function renderEvents(){
  const list = document.getElementById('eventsList');
  if(!list) return;
  list.innerHTML = '<h3>Upcoming Events</h3>' + events.map(e=>`<div class="event"><strong>${e.title}</strong> — ${e.date} ${e.time ? '@'+e.time:''}</div>`).join('');
}
renderEvents();

function renderMiniCalendar(){
  const el = document.getElementById('miniCalendar');
  if(!el) return;
  const byMonth = {};
  events.forEach(e=>{ const m = e.date.slice(0,7); (byMonth[m] ||= []).push(e); });
  el.innerHTML = Object.keys(byMonth).map(m=>`<div class="month"><strong>${m}</strong><ul>${byMonth[m].map(ev=>`<li>${ev.date.split('-')[2]} — ${ev.title} ${ev.time?ev.time:''}</li>`).join('')}</ul></div>`).join('');
}
renderMiniCalendar();

function getEventsForDay(y,m,d){
  const key = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  return events.filter(e=>e.date === key);
}

function renderMonthCalendar(year, month){
  const container = document.getElementById('monthCalendar');
  const label = document.getElementById('monthLabel');
  if(!container || !label) return;
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const startDay = first.getDay(); 

  const monthName = first.toLocaleString(undefined, {month:'long', year:'numeric'});
  label.textContent = monthName;

  let html = '<div class="cal-grid"><div class="cal-head">Sun</div><div class="cal-head">Mon</div><div class="cal-head">Tue</div><div class="cal-head">Wed</div><div class="cal-head">Thu</div><div class="cal-head">Fri</div><div class="cal-head">Sat</div>';
  for(let i=0;i<startDay;i++) html += '<div class="cal-cell blank"></div>';
  for(let d=1; d<=daysInMonth; d++){
    const dayEvents = getEventsForDay(year, month+1, d);
    html += `<div class="cal-cell"><div class="date">${d}</div>`;
    if(dayEvents.length){
      html += '<ul class="day-events">' + dayEvents.map(ev=>`<li title="${ev.title}">${ev.title}${ev.time? ' @'+ev.time:''}</li>`).join('') + '</ul>';
    }
    html += '</div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

let current = new Date();
function showCurrentMonth(){ renderMonthCalendar(current.getFullYear(), current.getMonth()); }
document.getElementById('prevMonth')?.addEventListener('click', ()=>{ current.setMonth(current.getMonth()-1); showCurrentMonth(); });
document.getElementById('nextMonth')?.addEventListener('click', ()=>{ current.setMonth(current.getMonth()+1); showCurrentMonth(); });
showCurrentMonth();

const bioForm = document.getElementById('bioForm');
const downloadBio = document.getElementById('downloadBio');
if(bioForm){
  bioForm.addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(bioForm);
    const obj = Object.fromEntries(fd.entries());
    const saved = JSON.parse(localStorage.getItem('bios')||'[]');
    saved.push({...obj, savedAt:new Date().toISOString()});
    localStorage.setItem('bios', JSON.stringify(saved));
    alert('Bio saved locally. Use "Download Saved Bio" to get it as a file.');
    bioForm.reset();
  });
}
if(downloadBio){
  downloadBio.addEventListener('click', ()=>{
    const saved = JSON.parse(localStorage.getItem('bios')||'[]');
    if(!saved.length){ alert('No saved bios found. Submit one first.'); return; }
    const txt = saved.map(b=>`Name: ${b.name}\nRole: ${b.role}\nBio: ${b.bio}\nSaved: ${b.savedAt}\n---\n`).join('\n');
    const blob = new Blob([txt], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bios.txt';
    a.click();
  });
}

const managerForm = document.getElementById('managerContactForm');
if(managerForm){
  managerForm.addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(managerForm);
    const from = fd.get('fromEmail');
    const name = fd.get('fromName');
    const message = fd.get('message');
    const subject = encodeURIComponent('Website Contact from '+name);
    const body = encodeURIComponent(message + '\n\nFrom: ' + name + ' <' + from + '>');
    const mailto = `mailto:production@example.com?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  });
}

