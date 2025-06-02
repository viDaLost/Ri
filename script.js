// Состояния и таймеры
const screens = {
  welcome: document.getElementById('welcome-modal'),
  lock: document.getElementById('lock-screen'),
  mainMenu: document.getElementById('main-menu'),
  gameMenu: document.getElementById('game-menu'),
  bibleGame: document.getElementById('bible-game')
};

let playStartTime = null;
const maxPlayTime = 40 * 60 * 1000; // 40 минут
const cooldownTime = 15 * 60 * 1000; // 15 минут

// Загадки
const riddles = [
  { question: 'Кто построил ковчег?', answer: 'ной' },
  { question: 'Кто был первым человеком?', answer: 'адам' },
  { question: 'Как звали жену Адама?', answer: 'ева' }
];
let currentRiddleIndex = 0;

// Инициализация
window.onload = () => {
  const user = localStorage.getItem('rikkieName');
  const cooldown = localStorage.getItem('cooldownUntil');
  const now = Date.now();

  if (!user) {
    showScreen('welcome');
  } else if (cooldown && now < parseInt(cooldown)) {
    showScreen('lock');
  } else {
    startSession();
    showScreen('mainMenu');
    document.getElementById('name-display').textContent = user;
  }
};

// Хранение данных пользователя
function confirmUserData() {
  const name = document.getElementById('username').value.trim();
  const birthdate = document.getElementById('birthdate').value;
  if (!name || !birthdate) return alert("Пожалуйста, введи имя и дату рождения!");
  localStorage.setItem('rikkieName', name);
  localStorage.setItem('rikkieBirthday', birthdate);
  startSession();
  showScreen('mainMenu');
  document.getElementById('name-display').textContent = name;
}

// Показывать экран
function showScreen(screenName) {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  if (screens[screenName]) {
    screens[screenName].classList.remove('hidden');
    if (screens[screenName].classList.contains('screen')) {
      screens[screenName].classList.add('visible');
    }
  }
}

// Навигация
function goToMainMenu() {
  showScreen('mainMenu');
}

function goToGameMenu() {
  if (isOnCooldown()) {
    alert('Рикки устал, зайди позже!');
    return;
  }
  showScreen('gameMenu');
}

function goToHomework() {
  alert('Раздел "Домашнее задание" будет добавлен позже!');
}

function startBibleGame() {
  currentRiddleIndex = 0;
  updateRiddle();
  showScreen('bibleGame');
}

function nextRiddle() {
  currentRiddleIndex++;
  if (currentRiddleIndex >= riddles.length) currentRiddleIndex = 0;
  document.getElementById('riddle-feedback').classList.add('hidden');
  updateRiddle();
}

function updateRiddle() {
  document.getElementById('riddle-text').textContent = riddles[currentRiddleIndex].question;
  document.getElementById('riddle-answer').value = '';
}

// Проверка ответа
function checkRiddleAnswer() {
  const input = document.getElementById('riddle-answer').value.trim().toLowerCase();
  const correct = riddles[currentRiddleIndex].answer;
  if (input === correct) {
    document.getElementById('riddle-feedback').classList.remove('hidden');
  } else {
    alert('Попробуй ещё!');
  }
}

// Таймер сессии
function startSession() {
  playStartTime = Date.now();
  setInterval(() => {
    const now = Date.now();
    if (now - playStartTime > maxPlayTime) {
      const until = now + cooldownTime;
      localStorage.setItem('cooldownUntil', until);
      showScreen('lock');
    }
  }, 10000);
}

// Проверка ограничения
function isOnCooldown() {
  const until = parseInt(localStorage.getItem('cooldownUntil') || '0');
  return Date.now() < until;
}

// Заглушки для игр 2 и 3 (добавьте позже)
function startPairGame() {
  alert('Игра "Найди пару" будет добавлена позже!');
}

function startPuzzleGame() {
  alert('Игра "Помоги собрать" будет добавлена позже!');
}
