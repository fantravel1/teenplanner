// goals.js - Handles interactivity for the Goals Page (category filtering, add modal, editing progress, localStorage)

document.addEventListener('DOMContentLoaded', () => {
  // --- MOTIVATIONAL CAROUSEL ---
  const tips = [
    "Small steps every day lead to big results.",
    "Dream big, start small, act now.",
    "Progress, not perfection.",
    "You are stronger than you think.",
    "Stay consistent and celebrate your wins.",
    "Your only limit is you.",
    "Every accomplishment starts with the decision to try.",
    "Believe in yourself and all that you are."
  ];
  let tipIdx = 0;
  const tipEl = document.querySelector('.motivation-tip');
  let carouselTimer = null;

  function showTip(idx, animate=true) {
    if (!tipEl) return;
    tipEl.style.opacity = 0;
    setTimeout(() => {
      tipEl.textContent = tips[idx];
      tipEl.style.opacity = 1;
    }, animate ? 220 : 0);
  }
  function nextTip() {
    tipIdx = (tipIdx + 1) % tips.length;
    showTip(tipIdx);
  }
  function startCarousel() {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(nextTip, 7000);
  }
  if (tipEl) {
    tipEl.addEventListener('mouseenter', () => { if (carouselTimer) clearInterval(carouselTimer); });
    tipEl.addEventListener('mouseleave', startCarousel);
  }
  showTip(tipIdx, false);
  startCarousel();
  // --- CATEGORY FILTERING ---
  const catBtns = document.querySelectorAll('.goal-cat-btn');
  const goalCards = document.querySelectorAll('.goal-card');

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      goalCards.forEach(card => {
        if (cat === 'All' || card.dataset.category === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- EDITING PROGRESS (enable slider, update bar) ---
  goalCards.forEach(card => {
    const slider = card.querySelector('.goal-slider');
    if (slider) {
      slider.disabled = false;
      slider.addEventListener('input', e => {
        const val = slider.value;
        card.querySelector('.goal-progress').style.width = val + '%';
        // Optionally, save progress to localStorage here
      });
    }
  });

  // --- ADD GOAL MODAL ---
  const addGoalBtn = document.querySelector('.add-goal-btn');
  const addGoalModal = document.getElementById('addGoalModal');
  const addGoalOverlay = document.getElementById('addGoalOverlay');
  const closeAddGoalModal = document.getElementById('closeAddGoalModal');
  const addGoalForm = document.getElementById('addGoalForm');
  const goalProgress = document.getElementById('goalProgress');
  const goalProgressValue = document.getElementById('goalProgressValue');

  function openAddGoalModal() {
    addGoalModal.style.display = 'block';
    addGoalOverlay.style.display = 'block';
    setTimeout(() => {
      addGoalModal.classList.add('active');
      addGoalOverlay.classList.add('active');
    }, 10);
    if (window.feather) feather.replace();
  }
  function closeModal() {
    addGoalModal.classList.remove('active');
    addGoalOverlay.classList.remove('active');
    setTimeout(() => {
      addGoalModal.style.display = 'none';
      addGoalOverlay.style.display = 'none';
    }, 250);
  }
  addGoalBtn.addEventListener('click', openAddGoalModal);
  closeAddGoalModal.addEventListener('click', closeModal);
  addGoalOverlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && addGoalModal.classList.contains('active')) closeModal();
  });

  // Real-time slider display
  goalProgress.addEventListener('input', e => {
    goalProgressValue.textContent = goalProgress.value + '%';
  });

  // --- Add Goal Form Submission ---
  addGoalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = addGoalForm.goalTitle.value.trim();
    const category = addGoalForm.goalCategory.value;
    const progress = parseInt(addGoalForm.goalProgress.value, 10);
    if (!title || !category || isNaN(progress)) return;
    let goals = JSON.parse(localStorage.getItem('teenplanner_goals') || '[]');
    const saveBtn = addGoalForm.querySelector('.save-goal-btn');
    if (addGoalForm.dataset.editing) {
      // Editing existing
      const id = parseInt(addGoalForm.dataset.editing, 10);
      goals = goals.map(g => g.id === id ? { ...g, title, category, progress } : g);
      localStorage.setItem('teenplanner_goals', JSON.stringify(goals));
      // Refresh grid
      refreshGoalsGrid();
      showToast('Goal updated!');
      delete addGoalForm.dataset.editing;
    } else {
      // New goal
      const newGoal = { id: Date.now(), title, category, progress };
      goals.push(newGoal);
      localStorage.setItem('teenplanner_goals', JSON.stringify(goals));
      addGoalToGrid(newGoal);
      showToast('Goal added!');
    }
    saveBtn.classList.add('pulse');
    setTimeout(() => saveBtn.classList.remove('pulse'), 450);
    addGoalForm.reset();
    goalProgressValue.textContent = '0%';
    closeModal();
  });

  function deleteGoal(id) {
    let goals = JSON.parse(localStorage.getItem('teenplanner_goals') || '[]');
    goals = goals.filter(g => g.id !== id);
    localStorage.setItem('teenplanner_goals', JSON.stringify(goals));
    // Animate removal
    const card = document.querySelector('.goal-card[data-goalid="' + id + '"]');
    if (card) {
      card.classList.add('removing');
      setTimeout(() => {
        refreshGoalsGrid();
      }, 420);
    } else {
      refreshGoalsGrid();
    }
    showToast('Goal deleted!');
  }

  function refreshGoalsGrid() {
    // Remove all custom goal cards
    document.querySelectorAll('.goal-card').forEach(card => {
      if (card.querySelector('.goal-actions')) card.remove();
    });
    // Add all from storage
    let goals = JSON.parse(localStorage.getItem('teenplanner_goals') || '[]');
    goals.forEach(addGoalToGrid);
  }

  // Add new goal card to grid
  function addGoalToGrid(goal) {
    const grid = document.querySelector('.goals-grid');
    const card = document.createElement('div');
    card.className = 'goal-card';
    card.dataset.goalid = goal.id || '';
    card.dataset.category = goal.category;
    card.innerHTML = `
      <div class="goal-card-header">
        <span class="goal-icon"><i data-feather="${goal.category === 'School' ? 'book-open' : goal.category === 'Fitness' ? 'activity' : goal.category === 'Personal' ? 'smile' : 'music'}"></i></span>
        <span class="goal-title"></span>
        <span class="goal-actions"></span>
      </div>
      <div class="goal-progress-bar"><div class="goal-progress" style="width: ${goal.progress}%"></div></div>
      <input type="range" min="0" max="100" value="${goal.progress}" class="goal-slider" />
    `;
    card.querySelector('.goal-title').textContent = goal.title;
    // Only show actions for custom goals
    if (goal.id) {
      const actions = card.querySelector('.goal-actions');
      actions.innerHTML = `
        <button class="goal-edit-btn" title="Edit"><i data-feather="edit-2"></i></button>
        <button class="goal-delete-btn" title="Delete"><i data-feather="trash-2"></i></button>
      `;
      // Edit handler
      actions.querySelector('.goal-edit-btn').addEventListener('click', () => {
        openAddGoalModal();
        addGoalForm.goalTitle.value = goal.title;
        addGoalForm.goalCategory.value = goal.category;
        addGoalForm.goalProgress.value = goal.progress;
        goalProgressValue.textContent = goal.progress + '%';
        addGoalForm.dataset.editing = goal.id;
      });
      // Delete handler
      actions.querySelector('.goal-delete-btn').addEventListener('click', () => {
        if (confirm('Delete this goal?')) {
          deleteGoal(goal.id);
          card.remove();
        }
      });
    }
    grid.insertBefore(card, document.querySelector('.add-goal-btn'));
    // Enable slider
    const slider = card.querySelector('.goal-slider');
    slider.addEventListener('input', e => {
      card.querySelector('.goal-progress').style.width = slider.value + '%';
      saveGoalProgress(goal.id, slider.value);
    });
    if (window.feather) feather.replace();
  }
  // Save slider progress
  function saveGoalProgress(id, value) {
    let goals = JSON.parse(localStorage.getItem('teenplanner_goals') || '[]');
    goals = goals.map(g => g.id === id ? { ...g, progress: parseInt(value, 10) } : g);
    localStorage.setItem('teenplanner_goals', JSON.stringify(goals));
  }
  // Load goals from localStorage
  function loadGoals() {
    let goals = JSON.parse(localStorage.getItem('teenplanner_goals') || '[]');
    goals.forEach(addGoalToGrid);
  }
  loadGoals();

  // --- Toast helper ---
  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // --- Feather icons refresh ---
  if (window.feather) feather.replace();
});
