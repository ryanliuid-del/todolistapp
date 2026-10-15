import './style.css';
import { readTasks, visibleTasks, STORAGE_KEY } from './tasks.js';

const icons = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 12 4 4 8-8"/></svg>',
};
let tasks;
try { tasks = readTasks(localStorage); } catch { tasks = []; }
let filter = 'all';

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="site-header"><a class="brand" href="./" aria-label="Daylist home"><span class="brand-mark">${icons.check}</span>daylist<span class="brand-dot">.</span></a><span class="header-note">LESS CLUTTER. MORE CLARITY.</span></header>
  <main>
    <div class="date-line">${icons.sun}<span id="date"></span></div>
    <section class="intro"><p class="eyebrow">MAKE ROOM FOR WHAT MATTERS</p><h1>A little more <em>done.</em></h1><p class="subtitle">Big plans start with small steps. What’s on your mind?</p></section>
    <section class="workspace" aria-label="Your todo list">
      <form id="task-form"><label class="sr-only" for="task-input">New task</label><span class="input-plus">${icons.plus}</span><input id="task-input" placeholder="Add a task, make a little progress…" autocomplete="off" maxlength="300" required/><button class="add-button" type="submit">Add task <span>${icons.plus}</span></button></form>
      <div class="list-toolbar"><div class="filters" role="group" aria-label="Filter tasks"><button data-filter="all" aria-pressed="true">All tasks <span id="all-count">0</span></button><button data-filter="active" aria-pressed="false">Active</button><button data-filter="completed" aria-pressed="false">Completed</button></div><span id="remaining"></span></div>
      <ul id="task-list" aria-label="Tasks"></ul>
      <div id="empty-state"><div class="empty-icon">${icons.check}</div><h2>A fresh start.</h2><p>Your next small step belongs here.<br>Add your first task above.</p></div>
      <div class="list-footer"><span><span class="status-dot"></span> <span id="progress-label">Your day, at your pace</span></span><button id="clear-completed" hidden>Clear completed</button></div>
      <div class="progress-track"><div id="progress-bar"></div></div>
    </section>
    <p class="gentle-note"><span>✧</span> You don’t have to do it all. Just the next thing.</p>
    <p id="announcement" class="sr-only" role="status" aria-live="polite"></p><p id="storage-warning" role="alert" hidden>Changes can’t be saved in this browser. Keep this page open to retain your tasks.</p>
  </main>
  <footer class="site-footer"><span>A little space for a clearer mind.</span><span>Saved on this device <span class="footer-lock">⌑</span></span></footer>
`;
const list = document.querySelector('#task-list');
const input = document.querySelector('#task-input');
document.querySelector('#date').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

function save(message) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    document.querySelector('#storage-warning').hidden = true;
  } catch { document.querySelector('#storage-warning').hidden = false; }
  render();
  document.querySelector('#announcement').textContent = message;
}
function render() {
  const completed = tasks.filter(task => task.completed).length;
  const remaining = tasks.length - completed;
  document.querySelector('#all-count').textContent = tasks.length;
  document.querySelector('#remaining').textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} left`;
  document.querySelector('#clear-completed').hidden = completed === 0;
  document.querySelector('#progress-label').textContent = tasks.length ? `${completed} of ${tasks.length} completed${remaining === 0 ? ' — nicely done!' : ''}` : 'Your day, at your pace';
  document.querySelector('#progress-bar').style.width = `${tasks.length ? completed / tasks.length * 100 : 0}%`;
  document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
  list.replaceChildren();
  const visible = visibleTasks(tasks, filter);
  document.querySelector('#empty-state').hidden = visible.length > 0;
  document.querySelector('#empty-state h2').textContent = tasks.length ? (filter === 'completed' ? 'Good things take a first step.' : 'All clear.') : 'A fresh start.';
  document.querySelector('#empty-state p').textContent = tasks.length ? (filter === 'completed' ? 'Complete a task and it will appear here.' : 'No tasks here. Take a breath and enjoy the moment.') : 'Your next small step belongs here. Add your first task above.';
  visible.forEach(task => {
    const row = document.createElement('li');
    row.className = `task${task.completed ? ' completed' : ''}`;
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      save(task.completed ? 'Task completed.' : 'Task marked active.');
      const next = [...list.querySelectorAll('input')].find(el => el.dataset.id === task.id);
      (next ?? document.querySelector(`[data-filter="${filter}"]`)).focus();
    });
    checkbox.dataset.id = task.id;
    label.append(checkbox, text);
    const remove = document.createElement('button');
    remove.className = 'delete-button';
    remove.setAttribute('aria-label', `Delete task: ${task.text}`);
    remove.innerHTML = icons.trash;
    remove.addEventListener('click', () => {
      const index = visible.findIndex(item => item.id === task.id);
      tasks = tasks.filter(item => item.id !== task.id);
      save('Task deleted.');
      const buttons = list.querySelectorAll('.delete-button');
      (buttons[Math.min(index, buttons.length - 1)] ?? input).focus();
    });
    row.append(label, remove);
    list.append(row);
  });
}
document.querySelector('#task-form').addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) { input.value = ''; input.focus(); return; }
  tasks.push({ id: crypto.randomUUID(), text, completed: false });
  filter = 'all';
  input.value = '';
  save('Task added.');
  input.focus();
});
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; render(); }));
document.querySelector('#clear-completed').addEventListener('click', () => { tasks = tasks.filter(task => !task.completed); save('Completed tasks cleared.'); document.querySelector(`[data-filter="${filter}"]`).focus(); });
window.addEventListener('storage', event => { if (event.key === STORAGE_KEY || event.key === null) { try { tasks = readTasks(localStorage); render(); } catch { /* Keep the current session usable. */ } } });
render();
