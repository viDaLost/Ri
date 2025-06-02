import { riddles } from './riddles.js';
import { puzzlePieces } from './puzzle-images.js';
import { homeworkText } from './homework.js';

const screens = {
  welcome: document.getElementById('welcome-screen'),
  menu: document.getElementById('menu-screen'),
  gameMenu: document.getElementById('game-menu'),
  riddle: document.getElementById('riddle-screen'),
  pair: document.getElementById('pair-screen'),
  puzzle: document.getElementById('puzzle-screen'),
  homework: document.getElementById('homework-screen'),
  block: document.getElementById('block-screen'),
};

const modals = {
  confirm: document.getElementById('confirm-modal'),
  message: document.getElementById('message-modal'),
  homeworkDone: document.getElementById('homework-done-modal'),
};

const nameEl = document.getElementById('name');
const birthEl = document.getElementById('birth');
const greetName = document.getElementById('greet-name');
const gameName = document.getElementById('game-name');
const riddleText = document.getElementById('riddle-text');
const riddleInput = document.getElementById('riddle-input');
const puzzleBoard = document.getElementById('puzzle-board');
const puzzlePiecesContainer = document.getElementById('puzzle-pieces');
const homeworkTextEl = document.getElementById('homework-text');
const remindTime = document.getElementById('remind-time');
const pairBoard = document.getElementById('pair-board');
const playButton = document.getElementById('play-button');

let currentRiddle = 0;
let matchedCards = [];
let flippedCards = [];
let sessionStart = null;
let intervalId = null;

// Init
window.onload = () => {
  const user = JSON.parse(localStorage.getItem('rikkie_user'));
  const blockTime = parseInt(localStorage.getItem('block_until') || '0', 10);
  const now = Date.now();

  if (!user) {
    showModal('confirm');
    return;
  }

  greetName.textContent = user.name;
  gameName.textContent = user.name;

  if (blockTime && now < blockTime) {
    showScreen('block');
    setTimeout(() => showScreen('menu'), blockTime - now);
  } else {
    showScreen('menu');
  }
};

document.getElementById('confirm-btn').onclick = () => {
  const name = nameEl.value.trim();
  const birth = birthEl.value;
  if (name && birth) {
    localStorage.setItem('rikkie_user', JSON.stringify({ name, birth }));
    greetName.textContent = name;
    gameName.textContent = name;
    closeModal('confirm');

    const blockTime = parseInt(localStorage.getItem('block_until') || '0', 10);
    const now = Date.now();
    if (blockTime && now < blockTime) {
      showScreen('block');
      setTimeout(() => showScreen('menu'), blockTime - now);
    } else {
      showScreen('menu');
    }
  }
};

function showScreen(id) {
  for (let key in screens) {
    screens[key].classList.remove('visible');
  }
  screens[id].classList.add('visible');
}

function showModal(id) {
  modals[id].classList.add('visible');
}

function closeModal(id) {
  modals[id].classList.remove('visible');
}

function checkSessionTime() {
  const now = Date.now();
  const diff = now - sessionStart;
  if (diff > 40 * 60 * 1000) {
    localStorage.setItem('block_until', now + 15 * 60 * 1000);
    showScreen('block');
    clearInterval(intervalId);
    intervalId = null;
  }
}

// 📘 Riddles
function showRiddle(index) {
  currentRiddle = index;
  riddleText.textContent = riddles[index].question;
  riddleInput.value = '';
  showScreen('riddle');
}

document.getElementById('riddle-submit').onclick = () => {
  const input = riddleInput.value.trim().toLowerCase();
  const answer = riddles[currentRiddle].answer.toLowerCase();
  if (input === answer) {
    document.getElementById('riddle-result').textContent = 'Молодец!';
    document.getElementById('riddle-win').style.display = 'block';
  } else {
    document.getElementById('riddle-result').textContent = 'Попробуй ещё!';
  }
};

document.getElementById('next-riddle').onclick = () => {
  currentRiddle = (currentRiddle + 1) % riddles.length;
  showRiddle(currentRiddle);
  document.getElementById('riddle-result').textContent = '';
  document.getElementById('riddle-win').style.display = 'none';
};

// 🧩 Puzzle
function startPuzzle() {
  puzzleBoard.innerHTML = '';
  puzzlePiecesContainer.innerHTML = '';
  document.getElementById('puzzle-win').style.display = 'none';

  puzzlePieces.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.draggable = true;
    img.dataset.id = index;
    img.addEventListener('dragstart', dragStart);
    puzzlePiecesContainer.appendChild(img);

    const slot = document.createElement('div');
    slot.classList.add('puzzle-slot');
    slot.dataset.id = index;
    slot.style.width = '100px';
    slot.style.height = '100px';
    slot.style.border = '1px dashed #aaa';
    slot.style.margin = '2px';
    slot.addEventListener('drop', dropPiece);
    slot.addEventListener('dragover', e => e.preventDefault());
    puzzleBoard.appendChild(slot);
  });

  showScreen('puzzle');
}

function dragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.id);
  e.dataTransfer.setDragImage(e.target, 30, 30);
}

function dropPiece(e) {
  const id = e.dataTransfer.getData('text/plain');
  const piece = document.querySelector(`img[data-id="${id}"]`);
  if (e.target.children.length === 0 && e.target.dataset.id === id) {
    e.target.appendChild(piece);
  }

  const completed = [...puzzleBoard.children].every(
    slot => slot.children.length === 1
  );
  if (completed) {
    document.getElementById('puzzle-win').style.display = 'block';
  }
}

// 🧠 Find Pair
function startPair() {
  matchedCards = [];
  flippedCards = [];
  const items = [...Array(10).keys(), ...Array(10).keys()];
  items.sort(() => Math.random() - 0.5);
  pairBoard.innerHTML = '';
  document.getElementById('pair-win').style.display = 'none';

  items.forEach((n, i) => {
    const card = document.createElement('div');
    card.className = 'pair-card';
    card.dataset.value = n;
    card.innerText = '';
    card.addEventListener('click', () => flipCard(card));
    pairBoard.appendChild(card);
  });

  showScreen('pair');
}

function flipCard(card) {
  if (flippedCards.length === 2 || card.classList.contains('matched')) return;
  card.innerText = card.dataset.value;
  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    setTimeout(() => {
      if (
        flippedCards[0].dataset.value === flippedCards[1].dataset.value
      ) {
        flippedCards.forEach(c => {
          c.classList.add('matched');
          c.style.backgroundColor = '#c2f2c2';
        });
        matchedCards.push(...flippedCards);
        if (matchedCards.length === 20) {
          document.getElementById('pair-win').style.display = 'block';
        }
      } else {
        flippedCards.forEach(c => {
          c.classList.remove('flipped');
          c.innerText = '';
        });
      }
      flippedCards = [];
    }, 1000);
  }
}

// 📒 Homework
function showHomework() {
  homeworkTextEl.textContent = homeworkText;
  showScreen('homework');
}

document.getElementById('homework-done-btn').onclick = () => {
  document.getElementById('fireworks').style.display = 'block';
  showModal('homeworkDone');
};

document.getElementById('remind-later-btn').onclick = () => {
  const time = remindTime.value;
  if (time) {
    localStorage.setItem('remind_time', time);
    alert('Напоминание установлено!');
  }
};

// Закрытие модалок
document.querySelectorAll('.close-modal').forEach(btn =>
  btn.addEventListener('click', () => {
    btn.closest('.modal').classList.remove('visible');
  })
);

// Навигация
document.getElementById('to-game-menu').onclick = () => showScreen('gameMenu');
document.getElementById('to-menu').onclick = () => {
  showScreen('menu');
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};
document.getElementById('to-homework').onclick = () => showHomework();
document.getElementById('riddle-btn').onclick = () => showRiddle(0);
document.getElementById('pair-btn').onclick = () => startPair();
document.getElementById('puzzle-btn').onclick = () => startPuzzle();

playButton.onclick = () => {
  const blockTime = parseInt(localStorage.getItem('block_until') || '0', 10);
  const now = Date.now();
  if (blockTime && now < blockTime) {
    alert('Рикки устал, зайди позже!');
    return;
  }

  showScreen('gameMenu');
  sessionStart = Date.now();
  intervalId = setInterval(checkSessionTime, 1000);
};
