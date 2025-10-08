import { shareScore } from './share.js';

const playButton = document.getElementById('play-btn');
const shareButton = document.getElementById('share-btn');
const scoreValue = document.getElementById('score-value');
const gameNameEl = document.getElementById('game-name');

let currentScore = 0;

function getRandomScore() {
  return Math.floor(Math.random() * 10_000);
}

function updateScore(score) {
  currentScore = score;
  scoreValue.textContent = score.toLocaleString();
  shareButton.disabled = false;
}

function getGameName() {
  return gameNameEl?.textContent?.trim() || 'Unknown Game';
}

playButton?.addEventListener('click', () => {
  const newScore = getRandomScore();
  updateScore(newScore);
});

shareButton?.addEventListener('click', async () => {
  if (shareButton.disabled) return;
  const gameName = getGameName();
  await shareScore({ gameName, score: currentScore });
});

// Preload a score to demonstrate the UI.
updateScore(getRandomScore());
