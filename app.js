let hwCompleted = false;

function openHomework() {
  document.getElementById('homework').style.display = 'block';
}

function setReminder() {
  const time = document.getElementById('reminder-time').value;
  if (time) {
    alert('Напоминание установлено на ' + time);
  }
}

function completeHomework() {
  if (!hwCompleted) {
    document.getElementById('reward-status').innerText = 'Поздравляем! Вы получили 3 звезды!';
    hwCompleted = true;
  } else {
    document.getElementById('reward-status').innerText = 'Вы уже выполнили это задание.';
  }
}
