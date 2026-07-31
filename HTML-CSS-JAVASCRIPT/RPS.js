const storageKey = 'styled-rps-score';
let score = JSON.parse(localStorage.getItem(storageKey)) || {
  wins: 0,
  losses: 0,
  tie: 0
};

updateScoreElement();

function getComputerMove() {
  const randomNumber = Math.random();

  if (randomNumber < 1 / 3) {
    return 'Scissors';
  }

  if (randomNumber < 2 / 3) {
    return 'Paper';
  }

  return 'Rock';
}

function playGame(playerMove) {
  const computerMove = getComputerMove();
  let result = '';

  if (playerMove === computerMove) {
    result = 'Tie';
  } else if (
    (playerMove === 'Rock' && computerMove === 'Paper') ||
    (playerMove === 'Scissors' && computerMove === 'Rock') ||
    (playerMove === 'Paper' && computerMove === 'Scissors')
  ) {
    result = 'You Lose!';
  } else {
    result = 'You Win!';
  }

  if (result === 'You Win!') {
    score.wins += 1;
  } else if (result === 'You Lose!') {
    score.losses += 1;
  } else {
    score.tie += 1;
  }

  localStorage.setItem(storageKey, JSON.stringify(score));
  updateScoreElement();

  const playerImage = `image/${playerMove.toLowerCase()}-emoji.png`;
  const computerImage = `image/${computerMove.toLowerCase()}-emoji.png`;

  document.querySelector('.js-moves').innerHTML = `
    You <img src="${playerImage}" alt="${playerMove}" class="move-icon">
    <img src="${computerImage}" alt="${computerMove}" class="move-icon"> computer
  `;
  document.querySelector('.js-result').textContent = result;
}

function updateScoreElement() {
  document.querySelector('.js-score').textContent =
    `Wins: ${score.wins}, Losses: ${score.losses}, Ties: ${score.tie}`;
}

function resetScore() {
  score = { wins: 0, losses: 0, tie: 0 };
  localStorage.removeItem(storageKey);
  updateScoreElement();
  document.querySelector('.js-result').textContent = '';
  document.querySelector('.js-moves').textContent = '';
}
