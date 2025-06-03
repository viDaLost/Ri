// Глобальные переменные
let contentData = {
    homework: {
        default: "Прочитай 5 стихов из Библии"
    },
    puzzles: [
        { question: "Кто построил ковчег?", answer: "Ной" },
        { question: "Кто был племяником Авраама?", answer: "Лаван" },
        { question: "Кто продал своё первородство за чечевичную похлебку?", answer: "Исав" },
        { question: "Как звали сына Авраама и Сарры?", answer: "Исаак" },
        { question: "Кто был отцом Иакова и Исава?", answer: "Исаак" },
        { question: "Кто был женой Авраама?", answer: "Сарра" }
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
        const fruits = ['🍎', '🍌', '🍒', '🍇', '🍊', '🍐', '🍓', '🍉'];
        const pairs = [...fruits, ...fruits]; // 8 пар
        
        shuffle(pairs);
        
        memoryGrid.innerHTML = '';
        cards = [];
        firstCard = null;
        secondCard = null;
        matchedCount = 0;
        
        pairs.forEach((emoji) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.pairId = emoji;
            
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
            }
        } else {
            firstCard.classList.add('mismatch');
            secondCard.classList.add('mismatch');

            setTimeout(() => {
                firstCard.classList.remove('flipped', 'mismatch');
                secondCard.classList.remove('flipped', 'mismatch');
                resetTurn();
            }, 800); // достаточное время для анимации
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

    let puzzleIndex = 0;
    let shuffledPuzzles = [...contentData.puzzles];
    let currentPuzzleAnswer = "";
    let isAnswered = false;

    // Перемешиваем загадки при загрузке
    shuffle(shuffledPuzzles);

    function showNextPuzzle() {
        if (puzzleIndex >= shuffledPuzzles.length) {
            puzzleIndex = 0;
            shuffledPuzzles = [...contentData.puzzles]; // Перемешиваем заново
            shuffle(shuffledPuzzles);
        }

        const puzzle = shuffledPuzzles[puzzleIndex];
        currentPuzzle.textContent = puzzle.question;
        currentPuzzleAnswer = puzzle.answer.toLowerCase();
        answerInput.value = '';
        isAnswered = false;
    }

    // Показываем первую загадку
    showNextPuzzle();

    checkAnswerBtn.addEventListener('click', () => {
        if (isAnswered) return;

        const userAnswer = answerInput.value.trim().toLowerCase();

        if (!userAnswer) {
            alert("Пожалуйста, введите свой ответ");
            return;
        }

        isAnswered = true;

        if (userAnswer === currentPuzzleAnswer) {
            // Если ответ правильный
            currentPuzzle.textContent = "Молодец!";
            currentPuzzle.style.color = "#388e3c";

            setTimeout(() => {
                puzzleIndex++;
                if (puzzleIndex < shuffledPuzzles.length) {
                    showNextPuzzle();
                } else {
                    // Все загадки отгаданы
                    currentPuzzle.textContent = "Ты отгадал все загадки! Попробуем ещё раз?";
                    currentPuzzle.style.color = "#ff66b2";
                    answerInput.disabled = true;
                    checkAnswerBtn.disabled = true;
                    checkAnswerBtn.classList.add('hidden');

                    // Добавляем кнопку "Ещё раз"
                    const retryBtn = document.createElement('button');
                    retryBtn.textContent = "Ещё раз";
                    retryBtn.className = "green-btn";
                    retryBtn.onclick = () => {
                        answerInput.disabled = false;
                        checkAnswerBtn.disabled = false;
                        checkAnswerBtn.classList.remove('hidden');
                        puzzleIndex = 0;
                        showNextPuzzle();
                    };

                    const parent = checkAnswerBtn.parentElement;
                    parent.appendChild(retryBtn);
                }
            }, 1500);
        } else {
            // Неверный ответ
            currentPuzzle.textContent = "Неправильно... Вспомни поточнее!";
            currentPuzzle.style.color = "#d32f2f";

            setTimeout(() => {
                currentPuzzle.textContent = shuffledPuzzles[puzzleIndex].question;
                currentPuzzle.style.color = "#333";
                isAnswered = false;
            }, 1500);
        }
    });
}

// Функция для перемешивания массива
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
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
