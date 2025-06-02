// Глобальные переменные для хранения контента
let contentData = {
  homework: {
    default: "Прочитай 5 стихов из Библии"
  },
  puzzles: []
};

// Загрузка контента из JSON
document.addEventListener('DOMContentLoaded', () => {
  fetch('content.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка загрузки контента');
      }
      return response.json();
    })
    .then(data => {
      contentData = data;
      initApp(); // Инициализация приложения после загрузки контента
    })
    .catch(error => {
      console.error('Используется резервный контент:', error);
      initApp(); // Инициализация с резервным контентом
    });
});

// Основная функция инициализации приложения
function initApp() {
    const welcomeModal = document.querySelector('.welcome-modal');
    const mainMenu = document.querySelector('.main-menu');
    const chooseGame = document.querySelector('.choose-game');
    const biblePuzzles = document.querySelector('.bible-puzzles');
    const memoryGame = document.querySelector('.memory-game');
    const homework = document.querySelector('.homework');
    const breakNotification = document.querySelector('.break-notification');
    const homeworkCompleteModal = document.querySelector('.homework-complete');
    
    const usernameInput = document.getElementById('username');
    const birthdateInput = document.getElementById('birthdate');
    const confirmBtn = document.getElementById('confirmBtn');
    const userGreeting = document.getElementById('userGreeting');
    
    const playBtn = document.getElementById('playBtn');
    const homeworkBtn = document.getElementById('homeworkBtn');
    
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const backToChooseBtn = document.getElementById('backToChooseBtn');
    
    const biblePuzzlesBtn = document.getElementById('biblePuzzlesBtn');
    const memoryGameBtn = document.getElementById('memoryGameBtn');
    
    // Игра "Библейские загадки"
    const currentPuzzle = document.getElementById('currentPuzzle');
    const answerInput = document.getElementById('answerInput');
    const checkAnswerBtn = document.getElementById('checkAnswerBtn');
    const answerFeedback = document.getElementById('answerFeedback');
    const feedbackText = document.getElementById('feedbackText');
    const nextPuzzleBtn = document.getElementById('nextPuzzleBtn');
    
    // Игра "Найди пару"
    const memoryGrid = document.getElementById('memoryGrid');
    const winMessage = document.getElementById('winMessage');
    
    // Домашнее задание
    const homeworkText = document.getElementById('homeworkText');
    const doneBtn = document.getElementById('doneBtn');
    const remindBtn = document.getElementById('remindBtn');
    const reminderInput = document.getElementById('reminderInput');
    const reminderTime = document.getElementById('reminderTime');
    const setReminderBtn = document.getElementById('setReminderBtn');
    
    // Уведомление о перерыве
    const backToMenuFromBreakBtn = document.getElementById('backToMenuFromBreakBtn');
    
    // Дополнительные кнопки
    const puzzleMenuBtn = document.getElementById('puzzleMenuBtn');
    const puzzleChooseBtn = document.getElementById('puzzleChooseBtn');
    const memoryMenuBtn = document.getElementById('memoryMenuBtn');
    const memoryChooseBtn = document.getElementById('memoryChooseBtn');
    const homeworkMenuBtn = document.getElementById('homeworkMenuBtn');
    const homeworkChooseBtn = document.getElementById('homeworkChooseBtn');
    const closeHomeworkModalBtn = document.getElementById('closeHomeworkModalBtn');
    
    // Проверка первого запуска
    const userData = JSON.parse(localStorage.getItem('rikkieUserData'));
    if (!userData) {
        // Показываем только если нет данных
        welcomeModal.classList.add('active');
        mainMenu.classList.remove('active');
    } else {
        showMainMenu(userData.name);
        welcomeModal.classList.remove('active');
    }
    
    // Сохранение данных пользователя
    confirmBtn.addEventListener('click', () => {
        const name = usernameInput.value.trim();
        const birthdate = birthdateInput.value;
        
        if (name && birthdate) {
            const userData = { name, birthdate };
            localStorage.setItem('rikkieUserData', JSON.stringify(userData));
            welcomeModal.classList.remove('active');
            mainMenu.classList.add('active');
            showMainMenu(name);
        } else {
            alert('Пожалуйста, заполните все поля');
        }
    });
    
    // Отображение главного меню
    function showMainMenu(name) {
        userGreeting.textContent = name;
        mainMenu.classList.add('active');
        startGameTimer();
    }
    
    // Обработчики кликов по кнопкам
    playBtn.addEventListener('click', () => {
        mainMenu.classList.remove('active');
        chooseGame.classList.add('active');
    });
    
    homeworkBtn.addEventListener('click', () => {
        mainMenu.classList.remove('active');
        homework.classList.add('active');
        homeworkText.textContent = contentData.homework.default;
    });
    
    backToMenuBtn.addEventListener('click', () => {
        chooseGame.classList.remove('active');
        homework.classList.remove('active');
        mainMenu.classList.add('active');
    });
    
    backToChooseBtn.addEventListener('click', () => {
        biblePuzzles.classList.remove('active');
        memoryGame.classList.remove('active');
        chooseGame.classList.add('active');
    });
    
    // Выбор игры
    biblePuzzlesBtn.addEventListener('click', () => {
        chooseGame.classList.remove('active');
        biblePuzzles.classList.add('active');
        startPuzzleGame();
    });
    
    memoryGameBtn.addEventListener('click', () => {
        chooseGame.classList.remove('active');
        memoryGame.classList.add('active');
        startMemoryGame();
    });
    
    // Добавленные кнопки
    puzzleMenuBtn.addEventListener('click', () => {
        biblePuzzles.classList.remove('active');
        mainMenu.classList.add('active');
    });
    
    puzzleChooseBtn.addEventListener('click', () => {
        biblePuzzles.classList.remove('active');
        chooseGame.classList.add('active');
    });
    
    memoryMenuBtn.addEventListener('click', () => {
        memoryGame.classList.remove('active');
        mainMenu.classList.add('active');
    });
    
    memoryChooseBtn.addEventListener('click', () => {
        memoryGame.classList.remove('active');
        chooseGame.classList.add('active');
    });
    
    homeworkMenuBtn.addEventListener('click', () => {
        homework.classList.remove('active');
        mainMenu.classList.add('active');
    });
    
    homeworkChooseBtn.addEventListener('click', () => {
        homework.classList.remove('active');
        chooseGame.classList.add('active');
    });
    
    // Игра "Библейские загадки"
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
            nextPuzzleBtn.addEventListener('click', () => {
                biblePuzzles.classList.remove('active');
                chooseGame.classList.add('active');
                currentPuzzleIndex = 0;
            }, { once: true });
        }
    });
    
    // Игра "Найди пару"
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
                    memoryGame.classList.remove('active');
                    chooseGame.classList.add('active');
                    winMessage.classList.add('hidden');
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
    
    // Домашнее задание
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
        homework.classList.remove('active');
        homeworkCompleteModal.classList.add('active');
    });
    
    closeHomeworkModalBtn.addEventListener('click', () => {
        homeworkCompleteModal.classList.remove('active');
        mainMenu.classList.add('active');
    });
    
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
    
    // Ограничение времени на игры
    let gameStartTime = Date.now();
    let breakUntil = localStorage.getItem('rikkieBreakUntil');
    
    function startGameTimer() {
        if (breakUntil && Date.now() < parseInt(breakUntil)) {
            mainMenu.classList.remove('active');
            breakNotification.classList.remove('hidden');
            breakNotification.classList.add('active');
            return;
        }
        
        gameStartTime = Date.now();
        
        setInterval(() => {
            const sessionDuration = Date.now() - gameStartTime;
            
            if (sessionDuration >= 2400000) {
                mainMenu.classList.remove('active');
                chooseGame.classList.remove('active');
                biblePuzzles.classList.remove('active');
                memoryGame.classList.remove('active');
                breakNotification.classList.remove('hidden');
                breakNotification.classList.add('active');
                
                const breakEndTime = Date.now() + 900000;
                localStorage.setItem('rikkieBreakUntil', breakEndTime.toString());
                clearInterval(this);
            }
        }, 1000);
    }
    
    backToMenuFromBreakBtn.addEventListener('click', () => {
        breakNotification.classList.remove('active');
        mainMenu.classList.add('active');
    });
    
    // Проверка времени перерыва
    if (breakUntil && Date.now() < parseInt(breakUntil)) {
        mainMenu.classList.remove('active');
        breakNotification.classList.remove('hidden');
        breakNotification.classList.add('active');
    }
}
