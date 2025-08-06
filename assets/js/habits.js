// habits.js - Handles dynamic 30-day calendar grid and habit state for Habit Tracker

document.addEventListener('DOMContentLoaded', function() {

  // Aggressive JS fix removed to allow horizontal scrolling of calendar area

  const calendarGrid = document.querySelector('.calendar-grid');
  const habitList = document.querySelectorAll('.habit-list-item');
  let activeHabitIdx = 0;
  let habits = [
    { name: 'Drink Water', icon: 'check-circle', days: Array(30).fill(false) },
    { name: 'Morning Stretch', icon: 'sun', days: Array(30).fill(false) },
    { name: 'Read 10 min', icon: 'book', days: Array(30).fill(false) }
  ];

  // Try to load from localStorage
  if (localStorage.getItem('teenplanner_habits')) {
    habits = JSON.parse(localStorage.getItem('teenplanner_habits'));
  }

  // Year view calendar logic
  const year = 2025;
  function getMonthDays(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  function renderCalendar() {
    const row1 = document.getElementById('calendarMonthRow1');
    const row2 = document.getElementById('calendarMonthRow2');
    const row3 = document.getElementById('calendarMonthRow3');
    if (!row1 || !row2 || !row3) return;
    // Ensure habit.days is a 2D array: [12][daysInMonth]
    let days = habits[activeHabitIdx].days;
    if (!Array.isArray(days) || days.length !== 12) {
      days = Array.from({length: 12}, (_, m) => Array(getMonthDays(year, m)).fill(false));
      habits[activeHabitIdx].days = days;
      saveHabits();
    } else {
      for (let m = 0; m < 12; m++) {
        const monthLen = getMonthDays(year, m);
        if (!Array.isArray(days[m]) || days[m].length !== monthLen) {
          days[m] = Array(monthLen).fill(false);
        }
      }
      habits[activeHabitIdx].days = days;
      saveHabits();
    }
    row1.innerHTML = '';
    row2.innerHTML = '';
    row3.innerHTML = '';
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let m = 0; m < 12; m++) {
      const monthDiv = document.createElement('div');
      monthDiv.className = 'month-calendar';
      // Month header
      const header = document.createElement('div');
      header.className = 'month-header';
      header.textContent = monthNames[m];
      monthDiv.appendChild(header);
      // Weekday row
      const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const weekdaysRow = document.createElement('div');
      weekdaysRow.className = 'month-weekdays-row';
      weekdays.forEach(wd => {
        const wdSpan = document.createElement('span');
        wdSpan.textContent = wd;
        weekdaysRow.appendChild(wdSpan);
      });
      monthDiv.appendChild(weekdaysRow);
      // Calendar grid
      const grid = document.createElement('div');
      grid.className = 'month-grid';
      const firstWeekday = new Date(year, m, 1).getDay();
      const daysInMonth = getMonthDays(year, m);
      let cellCount = 0;
      // Tooltip logic
      function showTooltip(e) {
        let tooltip = document.getElementById('calendar-tooltip');
        if (!tooltip) {
          tooltip = document.createElement('div');
          tooltip.id = 'calendar-tooltip';
          tooltip.style.position = 'fixed';
          tooltip.style.pointerEvents = 'none';
          tooltip.style.background = 'rgba(255,255,255,0.97)';
          tooltip.style.borderRadius = '1em';
          tooltip.style.boxShadow = '0 2px 12px 0 rgba(120,180,255,0.13)';
          tooltip.style.padding = '0.45em 0.95em';
          tooltip.style.fontSize = '1em';
          tooltip.style.color = '#6c63ff';
          tooltip.style.zIndex = 9999;
          document.body.appendChild(tooltip);
        }
        const cell = e.currentTarget;
        const d = cell.textContent;
        const checked = cell.classList.contains('checked');
        tooltip.textContent = `${monthNames[m]} ${d}: ${checked ? 'Checked' : 'Not checked'}`;
        const rect = cell.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width/2 - tooltip.offsetWidth/2) + 'px';
        tooltip.style.top = (rect.top - 38) + 'px';
        tooltip.style.display = 'block';
      }
      function hideTooltip() {
        const tooltip = document.getElementById('calendar-tooltip');
        if (tooltip) tooltip.style.display = 'none';
      }
      for (let i = 0; i < firstWeekday; i++) {
        const blank = document.createElement('div');
        blank.className = 'month-day-cell blank';
        blank.tabIndex = -1;
        grid.appendChild(blank);
        cellCount++;
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        cell.className = 'month-day-cell' + (days[m][d-1] ? ' checked' : '');
        cell.tabIndex = 0;
        cell.setAttribute('aria-label', `${monthNames[m]} ${d}: ${days[m][d-1] ? 'Checked' : 'Not checked'}`);
        cell.title = `${monthNames[m]} ${d}`;
        cell.textContent = d;
        // Tooltip logic
        cell.addEventListener('mouseenter', showTooltip);
        cell.addEventListener('mouseleave', hideTooltip);
        cell.addEventListener('focus', showTooltip);
        cell.addEventListener('blur', hideTooltip);
        cell.addEventListener('click', () => {
          days[m][d-1] = !days[m][d-1];
          saveHabits();
          renderCalendar();
        });
        cell.addEventListener('keydown', (e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            days[m][d-1] = !days[m][d-1];
            saveHabits();
            renderCalendar();
          }
        });
        grid.appendChild(cell);
        cellCount++;
      }
      // Streak summary logic
      function getStreaks(arr) {
        let longest = 0, temp = 0;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i]) {
            temp++;
            if (temp > longest) longest = temp;
          } else {
            temp = 0;
          }
        }
        // Current streak: count from last checked day backward
        let current = 0;
        let lastCheckedIdx = -1;
        for (let i = arr.length - 1; i >= 0; i--) {
          if (arr[i]) { lastCheckedIdx = i; break; }
        }
        if (lastCheckedIdx !== -1) {
          for (let i = lastCheckedIdx; i >= 0 && arr[i]; i--) current++;
        }
        // If the last day is not checked, current streak should be 0
        if (!arr[arr.length-1]) current = 0;
        return { current, longest };
      }
      const totalChecked = days[m].filter(Boolean).length;
      const streakDiv = document.createElement('div');
      streakDiv.className = 'streak-summary';
      streakDiv.innerHTML = `<span title="Total days selected" aria-label="Total days selected">🏆 ${totalChecked} day${totalChecked===1?'':'s'} selected</span>`;
      streakDiv.style.margin = '0 0 0.2em 0';
      streakDiv.style.fontSize = '0.99em';
      streakDiv.style.textAlign = 'center';
      streakDiv.style.opacity = '0.87';
      monthDiv.insertBefore(streakDiv, monthDiv.firstChild);
      monthDiv.appendChild(grid);

      // Trailing blanks to fill grid (so all months have 5 or 6 rows)
      const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
      for (let i = cellCount; i < totalCells; i++) {
        const blank = document.createElement('div');
        blank.className = 'month-day-cell blank';
        blank.tabIndex = -1;
        grid.appendChild(blank);
      }
      monthDiv.appendChild(grid);
      if (m < 5) {
        row1.appendChild(monthDiv);
      } else if (m < 10) {
        row2.appendChild(monthDiv);
      } else {
        // Nov/Dec: force exact sizing
        monthDiv.style.flex = '1 1 27em';
        monthDiv.style.minWidth = '24.5em';
        monthDiv.style.maxWidth = '30em';
        monthDiv.style.width = '100%';
        row3.appendChild(monthDiv);
      }
    }
    // Update year label
    const monthLabel = document.querySelector('.calendar-month');
    if (monthLabel) {
      monthLabel.textContent = `${year} Year View`;
    }
  }

  function updateActiveHabitDisplay() {
    const iconSpan = document.getElementById('activeHabitIcon');
    const nameSpan = document.getElementById('activeHabitName');
    if (iconSpan && nameSpan && habits[activeHabitIdx]) {
      iconSpan.setAttribute('data-feather', habits[activeHabitIdx].icon);
      nameSpan.textContent = habits[activeHabitIdx].name;
      if (window.feather) feather.replace();
    }
  }

  function renderHabitList() {
    const list = document.querySelector('.habit-list');
    list.innerHTML = '';
    habits.forEach((habit, idx) => {
      const li = document.createElement('li');
      li.className = 'habit-list-item' + (idx === activeHabitIdx ? ' active' : '');
      li.innerHTML = `<span class="habit-icon"><i data-feather="${habit.icon}"></i></span> ${habit.name}`;
      li.onclick = () => {
        activeHabitIdx = idx;
        renderHabitList();
        renderCalendar();
        updateActiveHabitDisplay();
      };
      // Delete button (if more than 1 habit)
      if (habits.length > 1) {
        const delBtn = document.createElement('button');
        delBtn.className = 'habit-delete-btn';
        delBtn.title = 'Delete habit';
        delBtn.innerHTML = '<i data-feather="trash-2"></i>';
        delBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm(`Delete habit "${habit.name}"?`)) {
            habits.splice(idx, 1);
            if (activeHabitIdx >= habits.length) activeHabitIdx = habits.length - 1;
            saveHabits();
            renderHabitList();
            renderCalendar();
            updateActiveHabitDisplay();
            if (window.feather) feather.replace();
          }
        };
        li.appendChild(delBtn);
      }
      list.appendChild(li);
    });
    updateActiveHabitDisplay();
    if (window.feather) feather.replace();
  }

  function saveHabits() {
    localStorage.setItem('teenplanner_habits', JSON.stringify(habits));
  }

  // --- Add Habit Modal logic ---
  const addHabitBtn = document.querySelector('.add-habit-btn');
  const addHabitModal = document.getElementById('addHabitModal');
  const addHabitOverlay = document.getElementById('addHabitOverlay');
  const closeAddHabitModal = document.getElementById('closeAddHabitModal');
  const addHabitForm = document.getElementById('addHabitForm');

  function openAddHabitModal() {
    addHabitModal.style.display = 'block';
    addHabitOverlay.style.display = 'block';
    setTimeout(() => {
      addHabitModal.classList.add('active');
      addHabitOverlay.classList.add('active');
      addHabitForm.habitName.focus();
    }, 10);
    if (window.feather) feather.replace();
  }
  function closeModal() {
    addHabitModal.classList.remove('active');
    addHabitOverlay.classList.remove('active');
    setTimeout(() => {
      addHabitModal.style.display = 'none';
      addHabitOverlay.style.display = 'none';
      addHabitForm.reset();
    }, 250);
  }
  addHabitBtn.addEventListener('click', openAddHabitModal);
  closeAddHabitModal.addEventListener('click', closeModal);
  addHabitOverlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && addHabitModal.classList.contains('active')) closeModal();
  });

  addHabitForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = addHabitForm.habitName.value.trim();
    const icon = addHabitForm.habitIcon.value;
    if (!name) return;
    habits.push({ name, icon, days: Array(30).fill(false) });
    activeHabitIdx = habits.length - 1;
    saveHabits();
    renderHabitList();
    renderCalendar();
    updateActiveHabitDisplay();
    closeModal();
  });

  renderHabitList();
  renderCalendar();
});
