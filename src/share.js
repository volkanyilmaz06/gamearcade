import { analytics } from './analytics.js';

const TWITTER_URL = 'https://twitter.com/intent/tweet';
const WHATSAPP_URL = 'https://api.whatsapp.com/send';

/**
 * Generates a shareable score card image using Canvas.
 * @param {string} gameName
 * @param {number} score
 * @returns {Promise<{ dataUrl: string, blob: Blob | null }>} The data url and blob for sharing.
 */
async function generateScoreCard(gameName, score) {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1d4ed8');
  gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#f97316';
  ctx.fillRect(60, 60, width - 120, height - 120);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(90, 90, width - 180, height - 180);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 72px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GameArcade', width / 2, 220);

  ctx.fillStyle = '#f97316';
  ctx.font = '600 56px "Segoe UI", sans-serif';
  ctx.fillText(gameName, width / 2, 320);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 140px "Segoe UI", sans-serif';
  ctx.fillText(`${score}`, width / 2, 470);

  ctx.fillStyle = 'rgba(248, 250, 252, 0.75)';
  ctx.font = '36px "Segoe UI", sans-serif';
  ctx.fillText('Can you beat my score?', width / 2, 560);

  const dataUrl = canvas.toDataURL('image/png');
  let blob = null;
  try {
    const response = await fetch(dataUrl);
    blob = await response.blob();
  } catch (error) {
    console.warn('Unable to convert score card to blob', error);
  }

  return { dataUrl, blob };
}

function buildShareText(gameName, score, shareUrl) {
  return `${gameName} - Score: ${score} ${shareUrl}`;
}

function buildShareLinks(text) {
  const encodedText = encodeURIComponent(text);
  return {
    twitter: `${TWITTER_URL}?text=${encodedText}`,
    whatsapp: `${WHATSAPP_URL}?text=${encodedText}`,
  };
}

function updateFallbackUI({
  text,
  links,
  scoreCardUrl,
}) {
  const shareResult = document.getElementById('share-result');
  const twitterLink = document.getElementById('twitter-link');
  const whatsappLink = document.getElementById('whatsapp-link');
  const shareText = document.getElementById('share-text');
  const scoreCardImage = document.getElementById('score-card-image');

  if (!shareResult || !twitterLink || !whatsappLink || !shareText || !scoreCardImage) {
    return;
  }

  twitterLink.href = links.twitter;
  whatsappLink.href = links.whatsapp;
  shareText.value = text;
  scoreCardImage.src = scoreCardUrl;
  scoreCardImage.alt = `Score card for ${text}`;
  shareResult.classList.remove('hidden');
}

function hideFallbackUI() {
  const shareResult = document.getElementById('share-result');
  if (shareResult) {
    shareResult.classList.add('hidden');
  }
}

async function shareNative({ gameName, score, shareUrl, scoreCard }) {
  if (!navigator.share) {
    return false;
  }

  const shareText = buildShareText(gameName, score, shareUrl);
  const files = [];
  if (scoreCard.blob && typeof File !== 'undefined') {
    try {
      const file = new File([scoreCard.blob], `${gameName}-score.png`, {
        type: 'image/png',
        lastModified: Date.now(),
      });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        files.push(file);
      }
    } catch (error) {
      console.warn('Unable to create score card file', error);
    }
  }

  try {
    if (files.length && navigator.canShare?.({ files })) {
      await navigator.share({
        title: `${gameName} score`,
        text: shareText,
        url: shareUrl,
        files,
      });
    } else {
      await navigator.share({
        title: `${gameName} score`,
        text: shareText,
        url: shareUrl,
      });
    }
    return true;
  } catch (error) {
    console.warn('Native share failed', error);
    return false;
  }
}

export async function shareScore({ gameName, score, shareUrl = window.location.href }) {
  const scoreCard = await generateScoreCard(gameName, score);
  const text = buildShareText(gameName, score, shareUrl);
  const links = buildShareLinks(text);

  analytics.trackEvent('share', { game: gameName, score });

  hideFallbackUI();
  const shared = await shareNative({ gameName, score, shareUrl, scoreCard });
  if (!shared) {
    updateFallbackUI({ text, links, scoreCardUrl: scoreCard.dataUrl });
  }
}
