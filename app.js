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

// Загрузка контента
let contentData = {
    homework: { default: "Прочитай 5 стихов из Библии" },
    puzzles: []
};

async function loadContent() {
    try {
        const response = await fetch('content.json');
        if (!response.ok) throw new Error('Ошибка загрузки контента');
        contentData = await response.json();
    } catch (error) {
        console.error('Используется резервный контент:', error);
    }
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', async () => {
    // Загрузка данных
    await loadContent();
    const userData = loadUserData();
    
    // Инициализация игры
    if (document.querySelector('.bible-puzzles-page')) {
        initBiblePuzzles();
    } else if (document.querySelector('.memory-game-page')) {
        initMemoryGame();
    } else if (document.querySelector('.homework-page')) {
        initHomework();
    }
});

// Игра "Библейские загадки"
function initBiblePuzzles() {
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

// Игра "Найди пару"
function initMemoryGame() {
    const memoryGrid = document.getElementById('memoryGrid');
    const winMessage = document.getElementById('winMessage');
    
    let cards = [];
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchedCount = 0;
    
    function startMemoryGame() {
        memoryGrid.innerHTML = '';
        cards = [];
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        matchedCount = 0;
        
        const pairs = [];
        for (let i = 1; i <= 8; i++) {
            pairs.push(i, i);
        }
        
        shuffle(pairs);
        
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

// Домашнее задание
function initHomework() {
    const homeworkText = document.getElementById('homeworkText');
    const doneBtn = document.getElementById('doneBtn');
    const remindBtn = document.getElementById('remindBtn');
    const reminderInput = document.getElementById('reminderInput');
    const reminderTime = document.getElementById('reminderTime');
    const setReminderBtn = document.getElementById('setReminderBtn');
    const homeworkCompleteModal = document.querySelector('.homework-complete');
    const closeHomeworkModalBtn = document.getElementById('closeHomeworkModalBtn');
    
    homeworkText.textContent = contentData.homework.default;
    
    remindBtn.addEventListener('click', () => {
        reminderInput.classList.toggle('hidden');
    });
    
    setReminderBtn.addEventListener('click', () => {
        const reminderTimeValue = reminderTime.value;
        
        if (reminderTimeValue) {
            localStorage.setItem('rikkieHomeworkReminder', reminderTimeValue);
            alert('Напоминание установлено!');
            reminderInput.classList.add('hidden');
        } else {
            alert('Выберите дату и время напоминания');
        }
    });
    
    doneBtn.addEventListener('click', () => {
        homeworkCompleteModal.classList.add('active');
    });
    
    closeHomeworkModalBtn.addEventListener('click', () => {
        homeworkCompleteModal.classList.remove('active');
        window.location.href = 'main-menu.html';
    });
}

// Уведомление о перерыве
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
