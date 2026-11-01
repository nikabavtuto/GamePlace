const pointsEl = document.getElementById("headerPoints");
const totalPointsEl = document.getElementById("totalPoints");
const modal = document.getElementById("gameModal");
const modalTitle = document.getElementById("modalTitle");
const gameArea = document.getElementById("gameArea");
let points = 0;
let reactionTimer = null;
let reactionStart = 0;
let reactionState = "idle";
let secretNumber = 0;
let attempts = 0;

function addPoints(value) {
  points += value;
  pointsEl.textContent = points;
  totalPointsEl.textContent = points;
}

function openGame(game) {
  modal.classList.remove("hidden");
  if (game === "memory") startMemory();
  if (game === "reaction") startReaction();
  if (game === "number") startNumber();
}
function closeGame() {
  modal.classList.add("hidden");
  clearTimeout(reactionTimer);
}
document.querySelectorAll(".play-btn").forEach(button => {
  button.addEventListener("click", () => openGame(button.dataset.game));
});
document.getElementById("closeModal").addEventListener("click", closeGame);
modal.addEventListener("click", event => {
  if (event.target === modal) closeGame();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeGame();
});

function startMemory() {
  modalTitle.textContent = "Найди пару";
  const symbols = ["◆","●","▲","★","☀","♣","♥","✦"];
  const deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  let first = null;
  let lock = false;
  let matched = 0;
  let moves = 0;
  gameArea.innerHTML = `<p class="game-instructions">Открой две карточки. Если символы совпадают, пара останется открытой. Найди все 8 пар!</p><div class="record" id="memoryMoves">Ходы: 0</div><div class="memory-board" id="memoryBoard"></div><div class="game-status" id="memoryStatus"></div>`;
  const board = document.getElementById("memoryBoard");
  deck.forEach((symbol, index) => {
    const cell = document.createElement("button");
    cell.className = "memory-cell";
    cell.textContent = "?";
    cell.setAttribute("aria-label", "Закрытая карточка");
    cell.addEventListener("click", () => {
      if (lock || cell.classList.contains("open") || cell.classList.contains("matched")) return;
      cell.textContent = symbol;
      cell.classList.add("open");
      cell.setAttribute("aria-label", symbol);
      if (!first) {
        first = {cell, symbol};
        return;
      }
      moves++;
      document.getElementById("memoryMoves").textContent = `Ходы: ${moves}`;
      if (first.symbol === symbol) {
        first.cell.classList.add("matched");
        cell.classList.add("matched");
        first.cell.classList.remove("open");
        cell.classList.remove("open");
        matched += 2;
        first = null;
        if (matched === deck.length) {
          addPoints(20);
          document.getElementById("memoryStatus").textContent = `Отлично! Все пары найдены за ${moves} ходов. +20 очков`;
        }
      } else {
        lock = true;
        const previous = first.cell;
        first = null;
        setTimeout(() => {
          previous.textContent = "?";
          cell.textContent = "?";
          previous.classList.remove("open");
          cell.classList.remove("open");
          lock = false;
        }, 700);
      }
    });
    board.appendChild(cell);
  });
}

function startReaction() {
  modalTitle.textContent = "Проверь реакцию";
  reactionState = "idle";
  gameArea.innerHTML = `<p class="game-instructions">Нажми «Начать» и дождись, пока поле станет зелёным. Не нажимай раньше времени!</p><button class="game-action" id="reactionStart">Начать</button><button class="reaction-pad" id="reactionPad">Жди сигнала…</button><div class="game-status" id="reactionStatus"></div>`;
  const pad = document.getElementById("reactionPad");
  document.getElementById("reactionStart").addEventListener("click", () => {
    clearTimeout(reactionTimer);
    reactionState = "waiting";
    pad.className = "reaction-pad waiting";
    pad.textContent = "Жди…";
    document.getElementById("reactionStatus").textContent = "";
    reactionTimer = setTimeout(() => {
      reactionState = "ready";
      reactionStart = performance.now();
      pad.className = "reaction-pad ready";
      pad.textContent = "ЖМИ!";
    }, 1400 + Math.random() * 2600);
  });
  pad.addEventListener("click", () => {
    const status = document.getElementById("reactionStatus");
    if (reactionState === "waiting") {
      clearTimeout(reactionTimer);
      reactionState = "idle";
      pad.className = "reaction-pad";
      pad.textContent = "Слишком рано!";
      status.textContent = "Попробуй ещё раз и дождись зелёного сигнала.";
    } else if (reactionState === "ready") {
      const time = Math.round(performance.now() - reactionStart);
      reactionState = "done";
      pad.textContent = `${time} мс`;
      status.textContent = time < 350 ? "Молниеносно! +15 очков" : "Хорошая реакция! +10 очков";
      addPoints(time < 350 ? 15 : 10);
    }
  });
}

function startNumber() {
  modalTitle.textContent = "Угадай число";
  secretNumber = Math.floor(Math.random() * 20) + 1;
  attempts = 0;
  gameArea.innerHTML = `<p class="game-instructions">Я загадал число от 1 до 20. Введи свой вариант и узнай, больше или меньше загаданное число.</p><input class="number-input" id="numberGuess" type="number" min="1" max="20" placeholder="Число от 1 до 20"><div class="number-row"><button class="game-action" id="guessButton">Проверить</button><button class="game-action" id="newNumber" type="button">Заново</button></div><div class="game-status" id="numberStatus"></div><div class="record" id="attemptCount">Попыток: 0</div>`;
  const input = document.getElementById("numberGuess");
  const status = document.getElementById("numberStatus");
  const count = document.getElementById("attemptCount");
  function guess() {
    const value = Number(input.value);
    if (!Number.isInteger(value) || value < 1 || value > 20) {
      status.textContent = "Введи целое число от 1 до 20.";
      return;
    }
    attempts++;
    count.textContent = `Попыток: ${attempts}`;
    if (value === secretNumber) {
      status.textContent = `Верно! Ты угадал за ${attempts} попыток. +${Math.max(5, 20 - attempts)} очков`;
      addPoints(Math.max(5, 20 - attempts));
      document.getElementById("guessButton").disabled = true;
    } else {
      status.textContent = value < secretNumber ? "Моё число больше. Попробуй ещё!" : "Моё число меньше. Попробуй ещё!";
    }
    input.value = "";
    input.focus();
  }
  document.getElementById("guessButton").addEventListener("click", guess);
  input.addEventListener("keydown", event => { if (event.key === "Enter") guess(); });
  document.getElementById("newNumber").addEventListener("click", startNumber);
}