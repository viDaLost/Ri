let health = 100;
let energy = 100;
let stars = 10;
let isSleeping = false;
let intervalId;

function startGame() {
    const name = document.getElementById("name-input").value;
    const birthday = document.getElementById("birthday-input").value;
    if (!name || !birthday) return alert("Введите имя и дату рождения!");

    localStorage.setItem("playerName", name);
    localStorage.setItem("playerBirthday", birthday);

    checkBirthdayGreeting();

    document.getElementById("welcome-screen").classList.add("hidden");
    document.getElementById("main-screen").classList.remove("hidden");

    startEnergyTimer();
}

function checkBirthdayGreeting() {
    const today = new Date().toISOString().slice(0, 10);
    const birthday = localStorage.getItem("playerBirthday");
    const name = localStorage.getItem("playerName");

    if (today.slice(5) === birthday.slice(5)) {
        alert(`🎉 С днём рождения, ${name}!`);
    }
}

function startEnergyTimer() {
    intervalId = setInterval(() => {
        if (!isSleeping && energy > 0) {
            energy -= 2;
            updateUI();
        }
        if (energy <= 0) {
            showZZZ();
        }
    }, 60000); // Каждую минуту
}

function updateUI() {
    document.getElementById("health-value").textContent = `${health}%`;
    document.getElementById("energy-value").textContent = `${energy}%`;
    document.getElementById("stars-value").textContent = stars;
}

function showZZZ() {
    document.getElementById("zzz-animation").classList.remove("hidden");
}

function goToSleep() {
    if (health <= 0) {
        alert("Рикки хочет кушать, покорми его чтобы продолжить!");
        return;
    }

    document.getElementById("main-screen").classList.add("hidden");
    document.getElementById("sleep-screen").classList.remove("hidden");

    setTimeout(() => {
        energy = 100;
        updateUI();
        wakeUp();
    }, 3600000); // 1 час
}

function wakeUp() {
    document.getElementById("sleep-screen").classList.add("hidden");
    document.getElementById("main-screen").classList.remove("hidden");
    document.getElementById("zzz-animation").classList.add("hidden");
    isSleeping = false;
}

function feedRicky() {
    if (health <= 0) {
        document.getElementById("main-screen").classList.add("hidden");
        document.getElementById("food-screen").classList.remove("hidden");
    }
}

function eat(item) {
    let cost = item.includes("berry") ? 1 : 2;
    if (stars >= cost) {
        stars -= cost;
        if (item.includes("berry")) health += 30;
        else health += 50;
        if (health > 100) health = 100;
        updateUI();
        alert("Рикки съел " + item + "!");
        backToMain();
    } else {
        alert("Не хватает звёзд!");
    }
}

function playGame() {
    if (health <= 0) {
        alert("Рикки хочет кушать, покорми его чтобы продолжить!");
        return;
    }

    alert("Вы начали играть... Рикки теряет здоровье.");
    let gameInterval = setInterval(() => {
        if (health > 0) {
            health -= 25;
            updateUI();
            if (health <= 0) {
                clearInterval(gameInterval);
                alert("Рикки голоден!");
            }
        }
    }, 300000); // Каждые 5 мин
}

function openHomework() {
    document.getElementById("main-screen").classList.add("hidden");
    document.getElementById("homework-screen").classList.remove("hidden");
}

function setReminder() {
    const time = document.getElementById("reminder-time").value;
    if (!time) return alert("Укажите время напоминания.");
    alert("Напоминание установлено на " + time);
}

function completeHomework() {
    stars += 3;
    updateUI();
    document.getElementById("complete-btn").disabled = true;
    alert("Вы получили 3 звезды!");
}

function openStore() {
    document.getElementById("main-screen").classList.add("hidden");
    document.getElementById("store-screen").classList.remove("hidden");
    showCategory('food');
}

function showCategory(category) {
    const content = document.getElementById("store-content");
    content.innerHTML = "";

    if (category === 'food') {
        content.innerHTML = `
            <button onclick="buyFood('Голубика', 1)">Голубика (1⭐)</button>
            <button onclick="buyFood('Клубника', 1)">Клубника (1⭐)</button>
            <button onclick="buyFood('Миндаль', 2)">Миндаль (2⭐)</button>
            <button onclick="buyFood('Грецкий орех', 2)">Грецкий орех (2⭐)</button>
        `;
    } else if (category === 'clothes') {
        content.innerHTML = `
            <button onclick="buyItem('Тога', 3)">Тога (3⭐)</button>
            <button onclick="buyItem('Шлем легионера', 7)">Шлем легионера (7⭐)</button>
            <button onclick="buyItem('Доспех воина', 9)">Доспех воина (9⭐)</button>
        `;
    } else if (category === 'furniture') {
        content.innerHTML = `
            <button onclick="buyItem('Кровать с подушками', 3)">Кровать с подушками (3⭐)</button>
            <button onclick="buyItem('Блестящая кровать', 6)">Блестящая кровать (6⭐)</button>
            <button onclick="buyItem('Царская кровать', 8)">Царская кровать (8⭐)</button>
        `;
    }
}

function buyFood(name, price) {
    if (stars >= price) {
        stars -= price;
        updateUI();
        alert("Вы купили " + name);
    } else {
        alert("Не хватает звёзд!");
    }
}

function buyItem(name, price) {
    if (stars >= price) {
        stars -= price;
        updateUI();
        alert("Вы купили " + name);
    } else {
        alert("Не хватает звёзд!");
    }
}

function backToMain() {
    document.getElementById("food-screen").classList.add("hidden");
    document.getElementById("homework-screen").classList.add("hidden");
    document.getElementById("store-screen").classList.add("hidden");
    document.getElementById("main-screen").classList.remove("hidden");
}
