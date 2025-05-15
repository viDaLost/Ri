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
  selectedFurniture: null,
  selectedCloth: null
};

function loadFromStorage() {
  const saved = localStorage.getItem('ricky-game');
  if (saved) {
    player = JSON.parse(saved);
    checkBirthday();
    updateBars();
    startGameLoop();
    initRaccoonModel(); // Восстанавливаем модель после загрузки
  } else {
    showScreen('room');
    namePopup.classList.remove('hidden');
  }
}

function saveToStorage() {
  localStorage.setItem('ricky-game', JSON.stringify(player));
}

function savePlayerInfo() {
  player.name = playerNameInput.value || "Рикки";
  player.birthDate = birthDateInput.value;
  namePopup.style.display = 'none';
  checkBirthday();
  updateBars();
  startGameLoop();
  saveToStorage();

  // Убедиться, что комната видна
  showScreen('room');
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
  const healthBar = document.getElementById("healthBar");
  const energyBar = document.getElementById("energyBar");
  const starsBar = document.getElementById("starsBar");

  if (healthBar) healthBar.style.width = `${player.health}%`;
  if (energyBar) energyBar.style.width = `${player.energy}%`;
  if (starsBar) starsBar.style.width = `${player.stars}%`;

  document.getElementById("playerNameLabel").innerText = player.name || "Рикки";
  document.getElementById("equippedCloth").innerText = player.selectedCloth || "Ничего";
  document.getElementById("raccoonStatusLabel").innerText =
    player.health <= 30 ? "Голоден" :
    player.energy <= 30 ? "Устал" : "Здоров";
}

function feed() {
  if (player.health <= 0) {
    alert("Рикки хочет кушать, покорми его чтобы продолжить!");
    return;
  }
  player.health += 30;
  if (player.health > 100) player.health = 100;
  updateBars();
  playSound('buySound');
  saveToStorage();
}

function sleep() {
  if (player.energy >= 100) return;
  alert("Рикки лег спать...");
  player.energy = 100;
  updateBars();
  playSound('clickSound');
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
  playSound('buySound');
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
  zzz.id = "zzzAnimation";
  zzz.innerHTML = 'Z z z';
  document.getElementById('room').appendChild(zzz);

  playSound('zzzSound');

  setTimeout(() => {
    zzz.remove();
  }, 2000);
}

function playSound(soundId) {
  const soundToggle = document.getElementById("soundToggle");
  if (soundToggle && soundToggle.checked) {
    const sound = document.getElementById(soundId);
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('show', 'bounce'));
  document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');

  const screen = document.getElementById(id);
  if (!screen) return;

  screen.style.display = 'block';
  setTimeout(() => {
    screen.classList.add('show', 'bounce');
  }, 50);
}

function backToRoom() {
  showScreen('room');
}

function goToStore() {
  showScreen('store');
  showCategory('food');
}

function goToGames() {
  showScreen('games');
}

// --- Магазин ---

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

function getItemButtonText(category, item) {
  if (category === 'furniture' && player.selectedFurniture === item.name) {
    return 'Выбрана';
  }
  if (player.inventory[category][item.name]) {
    return 'Выбрать';
  }
  return `Купить за ${item.price}`;
}

function showCategory(category) {
  const menu = document.getElementById('storeMenu');
  menu.classList.remove('show');
  setTimeout(() => {
    menu.innerHTML = '';
    items[category].forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'item bounce';
      let icon = '';
      switch (category) {
        case 'food':
          icon = '<svg width="30" height="30"><use href="#icon-berry"/></svg>';
          break;
        case 'furniture':
          icon = '<svg width="30" height="30"><use href="#icon-bed"/></svg>';
          break;
        case 'clothes':
          icon = '<svg width="30" height="30"><use href="#icon-clothes"/></svg>';
          break;
      }

      div.innerHTML = `
        ${icon}
        <span>${item.name}</span>
        <span>💰 ${item.price} звёзд</span>
        <button onclick="buyItem('${category}', ${index})">${getItemButtonText(category, item)}</button>
      `;

      if (category === 'clothes') {
        div.style.cursor = 'pointer';
        div.onclick = () => openClothesCatalog(item);
      }

      menu.appendChild(div);
    });
    menu.classList.add('show');
  }, 100);
}

function buyItem(category, index) {
  const item = items[category][index];
  if (player.inventory[category][item.name]) {
    if (category === 'furniture') {
      player.selectedFurniture = item.name;
    } else if (category === 'clothes') {
      applyCloth(item.name);
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

// --- Одежда ---
let scene, camera, renderer, raccoonModel;
let currentClothModel = null;

const clothModels = {
  'Тога': 'https://models.babylonjs.com/Assets/CharacterPack/characterPack02.glb ',
  'Шлем': 'https://models.babylonjs.com/Assets/Helmet/helmet.glb ',
  'Римский воин': 'https://models.babylonjs.com/Assets/Soldier/soldier.glb '
};

function applyCloth(clothName) {
  if (!clothModels[clothName]) return console.warn(`Модель "${clothName}" не найдена`);

  if (currentClothModel) {
    scene.remove(currentClothModel);
    currentClothModel = null;
  }

  const loader = new THREE.GLTFLoader();

  loader.load(
    clothModels[clothName],
    gltf => {
      currentClothModel = gltf.scene;
      currentClothModel.scale.set(0.5, 0.5, 0.5);
      raccoonModel.add(currentClothModel);
      updateClothSelection(clothName);
      alert(`Рикки надел: ${clothName}`);
    },
    undefined,
    error => console.error(`Ошибка загрузки "${clothName}":`, error)
  );
}

function updateClothSelection(selected) {
  document.querySelectorAll("#clothesPreviewList img").forEach(img => {
    img.classList.remove("selected");
    if (img.dataset.name === selected) {
      img.classList.add("selected");
    }
  });
}

function openClothesCatalog(cloth) {
  const catalog = document.getElementById("clothesCatalog");
  const previewList = document.getElementById("clothesPreviewList");
  previewList.innerHTML = '';

  Object.keys(player.inventory.clothes).forEach(name => {
    const item = items.clothes.find(c => c.name === name);
    if (!item) return;

    const div = document.createElement("div");
    div.className = "preview-item";
    div.innerHTML = `
      <img src="${getClothThumbnail(name)}" alt="${name}" data-name="${name}" />
      <p>${name}</p>
    `;
    div.querySelector("img").onclick = () => applyCloth(name);
    previewList.appendChild(div);
  });

  catalog.style.display = 'block';
  document.getElementById("store").classList.add("hidden");
}

function closeClothesCatalog() {
  document.getElementById("clothesCatalog").style.display = 'none';
  document.getElementById("store").classList.remove("hidden");
}

function getClothThumbnail(name) {
  switch (name) {
    case "Тога":
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Roman_toga.png/240px-Roman_toga.png ";
    case "Шлем":
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Viking_Helmet.jpg/240px-Viking_Helmet.jpg ";
    case "Щит":
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Shield_of_arms_of_Silesian_Brandenburg_vassals_%2814th_century%29.svg/240px-Shield_of_arms_of_Silesian_Brandenburg_vassals_%2814th_century%29.svg.png ";
    case "Римский воин":
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Lorica_segmentata.jpg/240px-Lorica_segmentata.jpg ";
    default:
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Toga_Barberini_front.jpg/240px-Toga_Barberini_front.jpg ";
  }
}

// --- Three.js модель ---

function initRaccoonModel() {
  const container = document.getElementById("raccoon-container");
  if (!container) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5).normalize();
  scene.add(directionalLight);

  const loader = new THREE.GLTFLoader();
  loader.load(
    'https://models.babylonjs.com/Assets/CharacterPack/characterPack01.glb ',
    gltf => {
      raccoonModel = gltf.scene;
      raccoonModel.scale.set(0.5, 0.5, 0.5);
      scene.add(raccoonModel);
      animateRaccoon();
    },
    undefined,
    error => console.error('Ошибка загрузки модели:', error)
  );

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.2;
}

function animateRaccoon() {
  requestAnimationFrame(animateRaccoon);
  renderer.render(scene, camera);
  if (scene && scene.children.length > 0) {
    scene.children[0].rotation.y += 0.01;
  }
}

// --- Игра "Змейка" ---

let snake, food, direction, score, gameInterval;

function initSnakeGame() {
  const canvas = document.getElementById("snakeCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  score = 0;
  generateFood();

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    updateSnakeGame(ctx, canvas);
    drawSnakeGame(ctx);
  }, 150);
}

function generateFood() {
  const tileCount = 400 / 20;
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
}

function updateSnakeGame(canvas) {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  const tileCount = 400 / 20;

  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    endSnakeGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    generateFood();

    player.stars += 5;
    updateBars();
    saveToStorage();
  } else {
    snake.pop();
  }
}

function drawSnakeGame(ctx) {
  ctx.clearRect(0, 0, 400, 400);

  snake.forEach((segment, index) =>
    ctx.fillStyle = index === 0 ? "#8B4513" : "#A0522D"
  );

  ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
  ctx.fillStyle = "green";
  ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
}

function endSnakeGame() {
  clearInterval(gameInterval);
  alert(`Игра окончена! Ты набрал ${score} очков и получил 5 звёзд!`);
  backToRoom();
}

window.addEventListener('keydown', changeDirection);

function changeDirection(e) {
  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
}

// --- Запуск игры ---

function startMemoryGame() {
  const game = document.getElementById("gameContent");
  game.innerHTML = `
    <h3 class="bounce">🕰 Найди пару</h3>
    <p>Нажми на одинаковые карточки!</p>
    <div class="memory-grid bounce" id="memoryGrid"></div>
    <button class="bounce" onclick="backToRoom()">Назад</button>
  `;
  showScreen('games');

  const cards = ['🍎','🍌','🍇','🍉','🍒','🍓','🍍','🥭'];
  const doubleCards = [...cards, ...cards].sort(() => 0.5 - Math.random());

  const grid = document.getElementById("memoryGrid");
  grid.innerHTML = '';

  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchedCount = 0;

  doubleCards.forEach(icon => {
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
          firstCard = secondCard = null;
          lockBoard = false;
          if (matchedCount === doubleCards.length) {
            setTimeout(() => {
              alert("Победа! Получено 10 звёзд!");
              player.stars += 10;
              updateBars();
              saveToStorage();
              backToRoom();
            }, 500);
          }
        } else {
          setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            firstCard = secondCard = null;
            lockBoard = false;
          }, 1000);
        }
      }
    });

    grid.appendChild(card);
  });

  showAllCards(doubleCards.length);
}

function showAllCards(totalPairs) {
  const cards = document.querySelectorAll(".memory-card");
  cards.forEach(card => card.classList.add("flipped"));

  setTimeout(() => {
    cards.forEach(card => card.classList.remove("flipped"));
  }, 5000);
}

// --- Инициализация экранов ---
function initApp() {
  updateBars();
  const room = document.getElementById('room');
  if (room) room.classList.add('active', 'show', 'bounce');

  // Подписываемся на событие после инициализации
  const storeBtn = document.getElementById('storeButton');
  if (storeBtn) {
    storeBtn.addEventListener('click', () => showScreen('store'));
  }

  // Инициализируем модель енота
  const container = document.getElementById("raccoon-container");
  if (container && !scene) {
    initRaccoonModel();
  }
}

// --- Запуск приложения ---
window.addEventListener('load', () => {
  loadFromStorage();
  initApp();
});
