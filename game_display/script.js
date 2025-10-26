// game.js

// Music
root_folder = "game_display/"
audio_folder = root_folder + "audio/"
images_folder = root_folder + "images/"

const soundEffects = {
  "bootup": audio_folder + "my_bootup.wav",
  "health_counter_bootup": audio_folder + "health counter bootup.ogg",
  "health_counter_beep": audio_folder + "health counter beep2.wav",
  "health_counter_heal": audio_folder + "health counter confirmation.ogg",
  "health_counter_decrease": audio_folder + "health counter reduce health.ogg",
  "heartbeat": audio_folder + "heartbeat effect.ogg",
  "heartbeat2": audio_folder + "heartbeat effect2.ogg",
  "round_blink": audio_folder + "round blinker wave.ogg",
  "round_hum": audio_folder + "my_round indicator hum.wav",
  "round_shut_down": audio_folder + "round indicator shut down.ogg",
  "shoot": audio_folder + "temp gunshot_live.wav",
  "winner": audio_folder + "winner.ogg",
  "shut_down": audio_folder + "crt_turn off display2.ogg"
}



// Game Logic
let game_state = 'off'; // 'start' | 'pause' | 'playing' | 'off'
let max_lives = 4;
let player1 = { name: '', lives: MaxLives(), prev_lives: MaxLives(), wins: 0 };

const container_p1 = document.getElementById('score-p1');
const white_overlay = document.getElementById('white-overlay');
const name_input_overlay = document.getElementById('name-overlay');
const scoreboard = document.getElementById('scoreboard');
const winner_overlay = document.getElementById('winner-overlay');

const charge_img = images_folder + 'charge.png';
shift_pressed = false;


function MaxLives() {
  return max_lives;
}

// State Management
function StartGame() {
  // Cancel form submission
  if (event) event.preventDefault();

  // Load player names
  player1.name = document.getElementById('name-input-p1').value.toUpperCase() || 'PLAYER1';
  document.getElementById('name-input-p1').value = "";

  // Hide the Name Input
  name_input_overlay.style.display = 'none';

  // Fill in names
  document.getElementById('name-p1').textContent = player1.name;

  // Scoreboard
  ShowScoreboard(1);
}

function ShowScoreboard() {
  console.log("Scoreboard!");
  name_input_overlay.style.display = 'none';
  scoreboard.style.display = 'flex';
  // Sound
  PlaySound(soundEffects["health_counter_bootup"]);
  setTimeout(() => {UpdateUI();}, 1000);
  game_state = 'playing';
}

function ShowGameOver() {
  console.log("Game Over!");
  name_input_overlay.style.display = 'none';
  scoreboard.style.display = 'none';
  game_state = 'pause';
  // document.getElementById('winner-text').textContent = "GAME OVER!";
  setTimeout(() => {winner_overlay.style.display = 'flex';}, 1000);
}

function UpdateUI() {
  const delta_p1 = player1.lives - player1.prev_lives;

  // === PLAYER 1 ===
  if (delta_p1 < 0) {
    // Blink the last N elements before removing
    const existing = container_p1.querySelectorAll('img');
    const toRemove = Math.abs(delta_p1);
    // Removing charges
    for (let i = 0; i < toRemove; i++) {
      const index = existing.length - 1 - i;
      const img = existing[index];
      if (img) {
        img.classList.remove("charge-blink-slow");
        img.classList.add("charge-blink");
        img.addEventListener('animationend', () => {
          img.remove();
        }, { once: true });
      }
    }
  // Adding charges
  } else {
    container_p1.innerHTML = '';
    for (let i = 0; i < player1.lives; i++) {
      const img = document.createElement('img');
      img.src = charge_img;
      img.classList.add('charge');
      container_p1.appendChild(img);

      // Blink only added
      if (delta_p1 > 0 && i >= player1.lives - delta_p1) {
        requestAnimationFrame(() => {
          img.classList.add("charge-blink");
          img.addEventListener('animationend', () => {
            img.classList.remove("charge-blink");
          }, { once: true });
        });
      }
    }
  }

  // One Life Player 1
  if (player1.lives === 1) {
    const lastImg = container_p1.querySelector('img');
    if (lastImg) lastImg.classList.add('charge-blink-slow');
    console.log("blink left");
  }

  // Update Prev Lives
  player1.prev_lives = player1.lives;
}

function WhiteOverlay() {
  white_overlay.style.display = 'flex';
  requestAnimationFrame(() =>
    {
    white_overlay.classList.add("white-fade");
    white_overlay.addEventListener('animationend', () =>
      {
        white_overlay.classList.remove("white-fade");
        white_overlay.style.display = 'none';
      }, { once: true });
  });
  BloodOverlay();
}

function BloodOverlay() {
  const layers = document.querySelectorAll('.blood-layer');
  layers.forEach((layer, i) => {
    layer.style.animation = "none"; // reset if retriggered
    layer.offsetHeight; // force reflow
    layer.style.animation = `white-fade 2s ease-out ${i * 50 + 200}ms forwards`;
  });
}

function Shoot(player, damage = 1) {
  // Double Damage
  if (player.lives > 0) {
    player.lives -= damage;
    //PlaySound(soundEffects["shoot"]);
    UpdateUI();
    PlaySound(soundEffects["health_counter_decrease"]);
    //BloodOverlay()
    // Death
    if (player.lives <= 0) {
      player.lives = 0;
      setTimeout(() => {ShowGameOver();}, 1000);
    }
  }
}

function Heal(player) {
  if (game_state !== 'playing') return;
  if (player.lives < MaxLives()) {
    player.lives++;
    PlaySound(soundEffects["health_counter_heal"]);
    UpdateUI();
  }
}

function DecreaseLives() {
  console.log("DECREASE");
  Shoot(player1);
}

function IncreaseLives() {
  console.log("INCREASE");
  Heal(player1);
}