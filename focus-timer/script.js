let timer;
let totalTime;
let remainingTime;
let isPaused = false;

function startTimer() {
  const minutesInput = document.getElementById('minutes').value;
  if (!minutesInput || minutesInput <= 0) {
    alert("Please enter a valid number of minutes.");
    return;
  }

  totalTime = minutesInput * 60;
  remainingTime = totalTime;

  // Hide input section and title, show pause button
  document.getElementById('input-section').style.display = 'none';
  document.getElementById('pauseButton').style.display = 'inline-block';
  document.getElementById('title').style.opacity = '0'; // Hide title smoothly
  
  // Start the pulse effect
  document.getElementById('timer-display').classList.add('timer-pulse');

  updateDisplay();
  updateTabTitle(); // Update the tab title initially

  // Start the timer interval for the first time
  if (!timer) {
    timer = setInterval(updateTimer, 1000);
  }
}

function updateTimer() {
  if (!isPaused) {
    remainingTime--;
    updateDisplay();
    updateTabTitle(); // Update the tab title with remaining time

    if (remainingTime <= 0) {
      clearInterval(timer);
      playChime();
      resetUI();
    }
  }
}

function togglePause() {
  console.log('Pause Button Clicked!');
  if (isPaused) {
    // Resuming the timer
    isPaused = false;
    document.getElementById('pauseButton').textContent = 'Pause';
    // Restart the timer interval if paused
    timer = setInterval(updateTimer, 1000);
    console.log('Resumed');
  } else {
    // Pausing the timer
    isPaused = true;
    document.getElementById('pauseButton').textContent = 'Resume';
    // Stop the timer interval
    clearInterval(timer);
    console.log('Paused');
  }
}

function updateDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  document.getElementById('timer-display').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTabTitle() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  // Update the browser tab title with the remaining time
  document.title = `Focus Timer: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function playChime() {
  const chimeSound = document.getElementById('chime-sound');
  chimeSound.play();
}

function resetUI() {
  // Reset UI elements to initial state
  document.getElementById('input-section').style.display = 'block';
  document.getElementById('pauseButton').style.display = 'none';
  document.getElementById('pauseButton').textContent = 'Pause';
  document.getElementById('title').style.opacity = '1'; // Show title again
  isPaused = false;
  
  // Stop the pulse effect
  document.getElementById('timer-display').classList.remove('timer-pulse');
  clearInterval(timer);
  timer = null; // Reset the timer to be used again after reset
}
