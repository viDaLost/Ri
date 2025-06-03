// Глобальные переменные
let contentData = {
    homework: {
        default: "Прочитай 5 стихов из Библии"
    },
    puzzles: [
        { question: "Кто построил ковчег?", answer: "ноев" },
        { question: "Кто был братом Авраама?", answer: "лар" },
        { question: "Кто продал своё первородство за чечевичную похлебку?", answer: "есав" },
        { question: "Как звали сына Авраама и Сарры?", answer: "исак" },
        { question: "Кто был отцом Иакова и Исава?", answer: "исак" },
        { question: "Кто был женой Авраама?", answer: "сара" }
    ]
};

// Загрузка данных пользователя
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('rikkieUserData'));
    if (userData) {
        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting) {
            userGreeting.textContent = userData.name;
        }
    }
    return userData;
}

// Загрузка контента из JSON
async function loadContent() {
    try {
        const [puzzlesRes, homeworkRes] = await Promise.all([
            fetch('content/puzzles.json'),
            fetch('content/homework.json')
        ]);
        
        const puzzles = await puzzlesRes.json();
        const homework = await homeworkRes.json();
        
        contentData = {
            homework: homework,
            puzzles: puzzles
        };
    } catch (error) {
        console.warn('Используется резервный контент:', error);
    }
}

// Инициализация главного меню
function initMainMenu() {
    const userData = JSON.parse(localStorage.getItem('rikkieUserData'));
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    loadUserData();
    checkGameTimer();
}

// Инициализация экрана выбора игры
function initChooseGame() {
    const userData = JSON.parse(localStorage.getItem('rikkieUserData'));
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    loadUserData();
    checkGameTimer();
}

// Инициализация игры "Библейские загадки"
function initBiblePuzzles() {
    const userData = JSON.parse(localStorage.getItem('rikkieUserData'));
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    loadUserData();
    checkGameTimer();
    
    const currentPuzzle = document.getElementById('currentPuzzle');
    const answerInput = document.getElementById('answerInput');
    const checkAnswerBtn = document.getElementById('checkAnswerBtn');
    const answerFeedback = document.getElementById('answerFeedback');
    const feedbackText = document.getElementById('feedbackText');
    const nextPuzzleBtn = document.getElementById('nextPuzzleBtn');
    
    let currentPuzzleIndex = 0;
    let currentPuzzleAnswer = "";
    
    function startPuzzleGame() {
        if (currentPuzzleIndex >= contentData.puzzles.length) {
            currentPuzzleIndex = 0;
        }
        
        const puzzle = contentData.puzzles[currentPuzzleIndex];
        currentPuzzle.textContent = puzzle.question;
        currentPuzzleAnswer = puzzle.answer.toLowerCase();
        answerInput.value = '';
        answerFeedback.classList.add('hidden');
    }
    
    startPuzzleGame();
    
    checkAnswerBtn.addEventListener('click', () => {
        const userAnswer = answerInput.value.trim().toLowerCase();
        
        if (userAnswer === currentPuzzleAnswer) {
            feedbackText.textContent = "Молодец!";
            answerFeedback.classList.remove('hidden');
        } else {
            feedbackText.textContent = "Попробуй еще раз!";
            answerFeedback.classList.remove('hidden');
        }
    });
    
    nextPuzzleBtn.addEventListener('click', () => {
        currentPuzzleIndex++;
        if (currentPuzzleIndex < contentData.puzzles.length) {
            startPuzzleGame();
        } else {
            currentPuzzle.textContent = "Вы прошли все загадки! Молодец!";
            answerFeedback.classList.add('hidden');
            nextPuzzleBtn.textContent = "Вернуться к выбору игры";
            nextPuzzleBtn.onclick = () => {
                window.location.href = 'choose-game.html';
            };
        }
    });
}

// Инициализация игры "Найди пару"
function initMemoryGame() {
    const userData = JSON.parse(localStorage.getItem('rikkieUserData'));
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    loadUserData();
    checkGameTimer();
    
    const memoryGrid = document.getElementById('memoryGrid');
    const winMessage = document.getElementById('winMessage');
    
    let cards = [];
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchedCount = 0;
    
    function startMemoryGame() {
        // Временные смайлики вместо изображений
        const emojis = ['😊', '😎', '😂', '🤣', '😍', '🥳', '😇', '🥰'];
        const pairs = [...emojis, ...emojis];
        
        shuffle(pairs);
        
        memoryGrid.innerHTML = '';
        cards = [];
        firstCard = null;
        secondCard = null;
        matchedCount = 0;
        
        pairs.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.pairId = index % 8 + 1;
            
            const front = document.createElement('div');
            front.classList.add('memory-card-front');
            front.textContent = '❓';
            
            const back = document.createElement('div');
            back.classList.add('memory-card-back');
            back.textContent = emoji;
            
            card.appendChild(front);
            card.appendChild(back);
            
            card.addEventListener('click', () => flipCard(card));
            memoryGrid.appendChild(card);
            cards.push(card);
        });
    }
    
    function flipCard(card) {
        if (lockBoard || card.classList.contains('flipped') || card.classList.contains('matched')) return;
        
        card.classList.add('flipped');
        
        if (!firstCard) {
            firstCard = card;
            return;
        }
        
        secondCard = card;
        lockBoard = true;
        
        checkForMatch();
    }
    
    function checkForMatch() {
        const isMatch = firstCard.dataset.pairId === secondCard.dataset.pairId;
        
        if (isMatch) {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            matchedCount += 2;
            resetTurn();
            
            if (matchedCount === cards.length) {
                winMessage.classList.remove('hidden');
                setTimeout(() => {
                    window.location.href = 'choose-game.html';
                }, 3000);
            }
        } else {
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                resetTurn();
            }, 1000);
        }
    }
    
    function resetTurn() {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
    }
    
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    startMemoryGame();
}

// Инициализация домашнего задания
function initHomework() {
    const userData = JSON.parse(localStorage.getItem('rikkieUserData'));
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    loadUserData();
    checkGameTimer();
    
    const homeworkText = document.getElementById('homeworkText');
    homeworkText.textContent = contentData.homework.default;
    
    const homeworkCompleteModal = document.getElementById('homeworkCompleteModal');
    const closeHomeworkModalBtn = document.getElementById('closeHomeworkModalBtn');
    
    document.getElementById('doneBtn').addEventListener('click', () => {
        homeworkCompleteModal.classList.add('active');
    });
    
    closeHomeworkModalBtn.addEventListener('click', () => {
        homeworkCompleteModal.classList.remove('active');
        window.location.href = 'main-menu.html';
    });
    
    document.getElementById('remindBtn').addEventListener('click', () => {
        document.getElementById('reminderInput').classList.toggle('hidden');
    });
    
    document.getElementById('setReminderBtn').addEventListener('click', () => {
        const reminderTimeValue = document.getElementById('reminderTime').value;
        
        if (reminderTimeValue) {
            localStorage.setItem('rikkieHomeworkReminder', reminderTimeValue);
            alert('Напоминание установлено!');
            document.getElementById('reminderInput').classList.add('hidden');
        } else {
            alert('Выберите дату и время напоминания');
        }
    });
}

// Проверка времени сессии
function checkGameTimer() {
    const breakUntil = localStorage.getItem('rikkieBreakUntil');
    
    if (breakUntil && Date.now() < parseInt(breakUntil)) {
        window.location.href = 'break-notification.html';
    }
    
    let gameStartTime = Date.now();
    
    setInterval(() => {
        const sessionDuration = Date.now() - gameStartTime;
        
        if (sessionDuration >= 2400000) {
            localStorage.setItem('rikkieBreakUntil', Date.now() + 900000);
            window.location.href = 'break-notification.html';
        }
    }, 1000);
}

// Проверка напоминаний
function checkReminders() {
    const reminderTime = localStorage.getItem('rikkieHomeworkReminder');
    if (reminderTime) {
        const now = new Date();
        const reminder = new Date(reminderTime);
        
        if (now >= reminder) {
            alert('Время выполнить домашнее задание!');
            localStorage.removeItem('rikkieHomeworkReminder');
        }
    }
}

setInterval(checkReminders, 300000);

// Анимации
function animateIn(element, delay = 0) {
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
    }, delay);
}

function animateOut(element, callback, delay = 0) {
    element.style.opacity = '0';
    element.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        element.classList.add('hidden');
        if (callback) callback();
    }, delay);
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    await loadContent();
    window.contentData = contentData;
    
    // Инициализация текущей страницы
    if (document.querySelector('.main-menu-page')) {
        initMainMenu();
    } else if (document.querySelector('.choose-game-page')) {
        initChooseGame();
    } else if (document.querySelector('.bible-puzzles-page')) {
        initBiblePuzzles();
    } else if (document.querySelector('.memory-game-page')) {
        initMemoryGame();
    } else if (document.querySelector('.homework-page')) {
        initHomework();
    }
});
