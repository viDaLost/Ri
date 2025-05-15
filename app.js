const playerNameInput = document.getElementById("playerName");
const birthDateInput = document.getElementById("birthDate");
const namePopup = document.getElementById("namePopup");
const homeworkPopup = document.getElementById("homeworkPopup");

let player = {
  name: "",
  birthDate: "",
  health: 100,
  energy: 100,
  stars: 10,
  lastHomeworkComplete: null,
  inventory: { food: {}, furniture: {}, clothes: {} },
  selectedFurniture: null
};

// Загрузка из localStorage
function loadFromStorage() {
  const saved = localStorage.getItem('ricky-game');
  if (saved) {
    player = JSON.parse(saved);
    checkBirthday();
    updateBars();
    startGameLoop();
  } else {
    namePopup.classList.remove('hidden');
  }
}

function saveToStorage() {
  localStorage.setItem('ricky-game', JSON.stringify(player));
}

function savePlayerInfo() {
  player.name = playerNameInput.value;
  player.birthDate = birthDateInput.value;
  namePopup.classList.add("hidden");
  checkBirthday();
  startGameLoop();
  saveToStorage();
}

function checkBirthday() {
  if (!player.birthDate) return;

  const today = new Date();
  const birth = new Date(player.birthDate);
  if (today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate()) {
    alert(`🎉 С днём рождения, ${player.name}! 🎉`);
  }
}

function updateBars() {
  document.getElementById("healthBar").style.width = `${player.health}%`;
  document.getElementById("energyBar").style.width = `${player.energy}%`;
  document.getElementById("starsBar").style.width = `${player.stars}%`;
}

function feed() {
  if (player.health <= 0) {
    alert("Рикки хочет кушать, покорми его чтобы продолжить!");
    return;
  }
  player.health += 30;
  if (player.health > 100) player.health = 100;
  updateBars();
  saveToStorage();
}

function sleep() {
  if (player.energy >= 100) return;
  alert("Рикки лег спать...");
  player.energy = 100;
  updateBars();
  saveToStorage();
}

function doHomework() {
  homeworkPopup.classList.remove("hidden");
}

function setReminder() {
  const time = document.getElementById("reminderTime").value;
  if (!time) return alert("Выберите время напоминания.");
  alert("Напоминание установлено!");
}

function completeHomework() {
  if (player.lastHomeworkComplete === new Date().toDateString()) {
    alert("Вы уже выполнили задание сегодня!");
    return;
  }

  player.stars += 3;
  player.lastHomeworkComplete = new Date().toDateString();
  updateBars();
  saveToStorage();
  alert("Молодец! Получено 3 звезды!");
}

function startGameLoop() {
  setInterval(() => {
    if (document.visibilityState === "visible") {
      if (player.energy > 0) {
        player.energy -= 1;
        updateBars();
      } else {
        showSleepAnimation();
      }

      if (player.health > 0) {
        player.health -= 0.25;
        updateBars();
      } else {
        alert("Рикки голоден! Покорми его!");
      }
    }
    saveToStorage();
  }, 60000 / 40); // За 40 минут энергия заканчивается
}

function showSleepAnimation() {
  const zzz = document.createElement('div');
  zzz.className = 'zzz';
  zzz.innerHTML = 'Z z z';
  document.getElementById('room').appendChild(zzz);

  playSound('zzzSound');

  setTimeout(() => {
    zzz.remove();
  }, 2000);
}

function playGame() {
  document.getElementById('room').classList.remove('active');
  document.getElementById('game').classList.add('active');
}

function backToRoom() {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById('room').classList.add('active');
}

function goToStore() {
  document.getElementById('room').classList.remove('active');
  document.getElementById('store').classList.add('active');
  showCategory('food');
}

function goToGames() {
  document.getElementById('room').classList.remove('active');
  document.getElementById('games').classList.add('active');
}

function showCategory(category) {
  const menu = document.getElementById('storeMenu');
  menu.innerHTML = '';
  items[category].forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'item';

    let icon = '';
    switch (category) {
      case 'food':
        icon = '<svg class="icon"><use href="#icon-berry"/></svg>';
        break;
      case 'furniture':
        icon = '<svg class="icon"><use href="#icon-bed"/></svg>';
        break;
      case 'clothes':
        icon = '<svg class="icon"><use href="#icon-clothes"/></svg>';
        break;
    }

    div.innerHTML = `
      ${icon}
      <span>${item.name}</span>
      <span>💰 ${item.price} звёзд</span>
      <button onclick="buyItem('${category}', ${index})">${getItemButtonText(category, item)}</button>
    `;
    menu.appendChild(div);
  });
}

function getItemButtonText(category, item) {
  if (category === 'furniture' && player.selectedFurniture === item.name) {
    return 'Выбрана';
  }
  if (player.inventory[category][item.name]) {
    return 'Выбрать';
  }
  return `Купить за ${item.price}`;
}

function buyItem(category, index) {
  const item = items[category][index];
  if (player.inventory[category][item.name]) {
    if (category === 'furniture') {
      player.selectedFurniture = item.name;
      alert(`Вы выбрали: ${item.name}`);
      playSound('clickSound');
    }
    showCategory(category);
    saveToStorage();
    return;
  }
  if (player.stars >= item.price) {
    player.stars -= item.price;
    player.inventory[category][item.name] = true;
    updateBars();
    playSound('buySound');
    showCategory(category);
    saveToStorage();
  } else {
    playSound('clickSound');
    alert("Не хватает звёзд!");
  }
}

// Переключатель звука
const soundToggle = document.getElementById("soundToggle");

function playSound(soundId) {
  if (soundToggle.checked) {
    const sound = document.getElementById(soundId);
    sound.currentTime = 0;
    sound.play();
  }
}

// --- Мини-игры ---

// 1. Поймай червяка
function startCatchWormGame() {
  const game = document.getElementById("gameContent");
  game.innerHTML = `
    <h3>🕹️ Поймай червяка!</h3>
    <p>Время: <span id="timeLeft">30</span>s</p>
    <button onclick="catchWormStart()">Начать</button>
    <button onclick="backToRoom()">Назад</button>
  `;
}

let wormInterval, catchWormTimer;

function catchWormStart() {
  let timeLeft = 30;
  document.getElementById("timeLeft").textContent = timeLeft;

  clearInterval(wormInterval);
  wormInterval = setInterval(() => {
    const worm = document.createElement("div");
    worm.className = "worm";
    worm.style.left = Math.random() * (window.innerWidth - 50) + "px";
    worm.style.top = Math.random() * (window.innerHeight - 50) + "px";
    worm.onclick = () => {
      player.stars += 1;
      player.health -= 5;
      updateBars();
      saveToStorage();
      worm.remove();
    };
    document.body.appendChild(worm);

    setTimeout(() => worm.remove(), 1500);
  }, 800);

  catchWormTimer = setInterval(() => {
    timeLeft--;
    document.getElementById("timeLeft").textContent = timeLeft;
    if (timeLeft <= 0 || player.energy <= 0) {
      clearInterval(catchWormTimer);
      clearInterval(wormInterval);
      alert("Игра окончена!");
      backToRoom();
    }
  }, 1000);
}

// 2. Угадай число
function startGuessNumberGame() {
  const game = document.getElementById("gameContent");
  const number = Math.floor(Math.random() * 100) + 1;
  let attempts = 0;

  game.innerHTML = `
    <h3>🧠 Угадай число (1–100)</h3>
    <input type="number" id="guessInput" min="1" max="100" />
    <button onclick="checkGuess(${number}, this)">Проверить</button>
    <p id="guessResult"></p>
    <button onclick="backToRoom()">Назад</button>
  `;
}

function checkGuess(number, btn) {
  const input = document.getElementById("guessInput");
  const result = document.getElementById("guessResult");
  const val = parseInt(input.value);
  const btnEl = btn;

  if (isNaN(val)) return alert("Введите число!");

  if (val < number) {
    result.textContent = "Число больше!";
  } else if (val > number) {
    result.textContent = "Число меньше!";
  } else {
    result.textContent = "Правильно! Вы получили 5 звёзд!";
    player.stars += 5;
    updateBars();
    saveToStorage();
    btnEl.disabled = true;
  }
}

// 3. Найди пару
function startMemoryGame() {
  const icons = ['🍎','🍌','🍇','🍉','🍒','🍓','🍍','🥭'];
  const cards = [...icons, ...icons].sort(() => 0.5 - Math.random());

  const game = document.getElementById("gameContent");
  game.innerHTML = `
    <h3>🕰 Найди пару</h3>
    <div class="memory-grid" id="memoryGrid"></div>
    <button onclick="backToRoom()">Назад</button>
  `;

  const grid = document.getElementById("memoryGrid");
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchedCount = 0;

  cards.forEach(icon => {
    const card = document.createElement("div");
    card.className = "memory-card";
    card.dataset.icon = icon;
    card.innerText = icon;
    card.addEventListener("click", () => {
      if (lockBoard || card.classList.contains("flipped") || card === firstCard) return;

      card.classList.add("flipped");

      if (!firstCard) {
        firstCard = card;
      } else {
        secondCard = card;
        lockBoard = true;

        if (firstCard.dataset.icon === secondCard.dataset.icon) {
          matchedCount += 2;
          firstCard = null;
          secondCard = null;
          lockBoard = false;

          if (matchedCount === cards.length) {
            alert("Победа! Получено 10 звёзд!");
            player.stars += 10;
            updateBars();
            saveToStorage();
          }
        } else {
          setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            firstCard = null;
            secondCard = null;
            lockBoard = false;
          }, 1000);
        }
      }
    });

    grid.appendChild(card);
  });
}

// --- Товары ---
const items = {
  food: [
    { name: "Клубника", price: 1, restore: 30 },
    { name: "Малина", price: 1, restore: 30 },
    { name: "Черника", price: 1, restore: 30 },
    { name: "Ежевика", price: 1, restore: 30 },
    { name: "Крыжовник", price: 1, restore: 30 },
    { name: "Лесной орех", price: 2, restore: 50 },
    { name: "Грецкий орех", price: 2, restore: 50 },
    { name: "Фундук", price: 2, restore: 50 },
    { name: "Миндаль", price: 2, restore: 50 },
    { name: "Кешью", price: 2, restore: 50 }
  ],
  furniture: [
    { name: "Кровать №1", price: 3 },
    { name: "Кровать №2", price: 3 },
    { name: "Кровать №3", price: 4 },
    { name: "Кровать №4", price: 4 },
    { name: "Кровать №5", price: 5 },
    { name: "Кровать №6", price: 5 },
    { name: "Кровать №7", price: 6 },
    { name: "Кровать №8", price: 6 },
    { name: "Кровать №9", price: 8 },
    { name: "Кровать №10", price: 8 }
  ],
  clothes: [
    { name: "Тога", price: 2 },
    { name: "Хитон", price: 3 },
    { name: "Лорика", price: 4 },
    { name: "Гребень", price: 5 },
    { name: "Шлем", price: 6 },
    { name: "Щит", price: 6 },
    { name: "Сандалии", price: 3 },
    { name: "Кольчуга", price: 7 },
    { name: "Плащ", price: 5 },
    { name: "Римский воин", price: 9 }
  ]
};

loadFromStorage();
