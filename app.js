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
        console.warn('Использован резервный контент:', error);
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
    
    // Обработчики событий
    document.getElementById('remindBtn').addEventListener('click', () => {
        document.getElementById('reminderInput').classList.toggle('hidden');
    });
    
    document.getElementById('setReminderBtn').addEventListener('click', () => {
        const reminderTimeValue = document.getElementById('reminderTime').value;
        
        if (reminderTimeValue) {
            localStorage.setItem('rikkieHomeworkReminder', reminderTimeValue);
            document.getElementById('reminderInput').classList.add('hidden');
            document.getElementById('reminderConfirmation').classList.remove('hidden');
            
            setTimeout(() => {
                document.getElementById('reminderConfirmation').classList.add('hidden');
            }, 1500);
        } else {
            alert('Выберите дату и время напоминания');
        }
    });
    
    document.getElementById('okReminderBtn').addEventListener('click', () => {
        document.getElementById('reminderConfirmation').classList.add('hidden');
    });
}

// Инициализация игры "Найди пару"
function initMemoryGame() {
    const userData = JSON.parse(localStorage.getItem('rikkieUserData'));
    if (!userData) window.location.href = 'index.html';
    
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
        // Создание пар
        const pairs = [];
        for (let i = 1; i <= 8; i++) {
            pairs.push(i, i);
        }
        
        shuffle(pairs);
        
        memoryGrid.innerHTML = '';
        cards = [];
        firstCard = null;
        secondCard = null;
        matchedCount = 0;
        
        pairs.forEach((pairId, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.pairId = pairId;
            
            const front = document.createElement('div');
            front.classList.add('memory-card-front');
            front.textContent = '❓';
            
            const back = document.createElement('div');
            back.classList.add('memory-card-back');
            
            const img = document.createElement('img');
            img.src = `img/puzzle-pieces/piece${pairId}.png`;
            img.alt = `Пазл ${pairId}`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            
            back.appendChild(img);
            
            card.appendChild(front);
            card.appendChild(back);
            
            card.addEventListener('click', flipCard);
            memoryGrid.appendChild(card);
            cards.push(card);
        });
    }

    function flipCard() {
        if (lockBoard || this.classList.contains('flipped') || this.classList.contains('matched')) return;
        
        this.classList.add('flipped');
        
        if (!firstCard) {
            firstCard = this;
            return;
        }
        
        secondCard = this;
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
            }
        } else {
            firstCard.classList.add('mismatch');
            secondCard.classList.add('mismatch');
            
            setTimeout(() => {
                firstCard.classList.remove('flipped', 'mismatch');
                secondCard.classList.remove('flipped', 'mismatch');
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
    }
    
    startPuzzleGame();
    
    checkAnswerBtn.addEventListener('click', () => {
        const userAnswer = answerInput.value.trim().toLowerCase();
        
        if (userAnswer === currentPuzzleAnswer) {
            const feedback = document.getElementById('currentPuzzle');
            feedback.textContent = "Молодец!";
            feedback.style.color = "#388e3c";
            
            setTimeout(() => {
                currentPuzzleIndex++;
                if (currentPuzzleIndex < contentData.puzzles.length) {
                    startPuzzleGame();
                    feedback.style.color = "#333";
                } else {
                    feedback.textContent = "Вы прошли все загадки! Молодец!";
                    window.location.href = 'choose-game.html';
                }
            }, 1500);
        } else {
            feedback.textContent = "Попробуй еще раз!";
            feedback.style.color = "#d32f2f";
            
            setTimeout(() => {
                feedback.textContent = contentData.puzzles[currentPuzzleIndex].question;
                feedback.style.color = "#333";
            }, 1500);
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

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    await loadContent();
    window.contentData = contentData;
    
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
