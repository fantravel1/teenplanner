// --- Hourly Blocks Render ---
const hourlyBlocks = document.getElementById('hourlyBlocks');
const hours = [];
for (let h = 7; h <= 22; h++) {
  let display = h < 12 ? `${h}:00am` : (h === 12 ? '12:00pm' : `${h-12}:00pm`);
  hours.push(display);
}
hourlyBlocks.innerHTML = hours.map((hr, i) =>
  `<div class="hour-block"><span class="hour-label">${hr}</span> <input type="text" class="hour-input" data-hour="${i+7}" maxlength="48" placeholder="Add event..." /></div>`
).join('');

// --- To-Do List Logic (LocalStorage) ---
const todoList = document.getElementById('todoList');
const completedList = document.getElementById('completedList');
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const LS_KEY = 'teenplanner_todos';
function getTodos() {
  return JSON.parse(localStorage.getItem(LS_KEY) || '{"tasks":[],"done":[]}');
}
function setTodos(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}
function renderTodos() {
  const {tasks, done} = getTodos();
  todoList.innerHTML = tasks.map((t,i) => {
  // Split into words, group every 3, join with span
  const words = t.trim().split(/\s+/);
  let lines = [];
  for(let j=0; j<words.length; j+=3) {
    lines.push(words.slice(j, j+3).join(' '));
  }
  const lineHtml = lines.map(line => `<span class='task-break'>${line}</span>`).join('');
  return `<li class="todo-item">
    <label><input type="checkbox" data-idx="${i}" class="todo-check"> <span class="todo-text">${lineHtml}</span></label>

    <button class="todo-delete-btn" data-idx="${i}" aria-label="Delete task"><i data-feather="trash-2"></i></button>
  </li>`;
}).join('');
  completedList.innerHTML = done.map((t,i) =>
    `<li><label><input type="checkbox" checked data-idx="${i}" class="done-check"> <span>${t}</span></label></li>`
  ).join('');
  feather.replace();
}

todoList.onclick = e => {
  // Complete task
  if(e.target.classList.contains('todo-check')) {
    const idx = +e.target.dataset.idx;
    const data = getTodos();
    const [t] = data.tasks.splice(idx,1);
    data.done.unshift(t);
    setTodos(data);
    renderTodos();
    return;
  }
  // Delete task
  const delBtn = e.target.closest('.todo-delete-btn');
  if (delBtn) {
    const idx = +delBtn.dataset.idx;
    const data = getTodos();
    data.tasks.splice(idx, 1);
    setTodos(data);
    renderTodos();
    return;
  }
};
todoForm.onsubmit = e => {
  e.preventDefault();
  const val = todoInput.value.trim();
  if(val) {
    const data = getTodos();
    data.tasks.push(val);
    setTodos(data);
    todoInput.value = '';
    renderTodos();
  }
};
completedList.onclick = e => {
  if(e.target.classList.contains('done-check')) {
    const idx = +e.target.dataset.idx;
    const data = getTodos();
    const [t] = data.done.splice(idx,1);
    data.tasks.unshift(t);
    setTodos(data);
    renderTodos();
  }
};
renderTodos();

// --- Priorities Widget (LocalStorage) ---
const prioritiesList = document.getElementById('prioritiesList');
const PRIORITY_KEY = 'teenplanner_priorities';
function getPriorities() {
  return JSON.parse(localStorage.getItem(PRIORITY_KEY) || '["","",""]');
}
function setPriorities(arr) {
  localStorage.setItem(PRIORITY_KEY, JSON.stringify(arr));
}
[...prioritiesList.querySelectorAll('input')].forEach((inp, i) => {
  inp.value = getPriorities()[i] || '';
  inp.oninput = () => {
    const arr = [...prioritiesList.querySelectorAll('input')].map(x => x.value);
    setPriorities(arr);
  };
});

// --- Daily Thought (LocalStorage) ---
const thoughtInput = document.getElementById('thoughtInput');
const THOUGHT_KEY = 'teenplanner_thought';
thoughtInput.value = localStorage.getItem(THOUGHT_KEY) || '';
thoughtInput.oninput = () => {
  localStorage.setItem(THOUGHT_KEY, thoughtInput.value);
};

// --- Date Selector (default today, persist) ---
const dateInput = document.getElementById('planner-date-input');
const DATE_KEY = 'teenplanner_date';
function getToday() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}
dateInput.value = localStorage.getItem(DATE_KEY) || getToday();
dateInput.oninput = () => {
  localStorage.setItem(DATE_KEY, dateInput.value);
};

// --- PDF Export (html2pdf.js) ---
document.getElementById('pdfExportBtn').onclick = () => {
  const el = document.querySelector('.planner-wrapper');
  html2pdf().from(el).set({ margin: 0.2, filename: 'MyDay.pdf', html2canvas: {scale:2}, jsPDF: {unit:'in', format:'a4', orientation:'portrait'} }).save();
};

// --- Hourly Inputs (LocalStorage) ---
const HOUR_KEY = 'teenplanner_hours';
const hourInputs = document.querySelectorAll('.hour-input');
function getHourVals() {
  return JSON.parse(localStorage.getItem(HOUR_KEY) || '[]');
}
function setHourVals(vals) {
  localStorage.setItem(HOUR_KEY, JSON.stringify(vals));
}
const hourVals = getHourVals();
hourInputs.forEach((inp,i) => {
  inp.value = hourVals[i] || '';
  inp.oninput = () => {
    const vals = [...document.querySelectorAll('.hour-input')].map(x=>x.value);
    setHourVals(vals);
  };
});
