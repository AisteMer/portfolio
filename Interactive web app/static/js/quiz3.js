// Function to determine if we need to clear localStorage
function shouldClearState() {
  // Check referrer
  const referrer = document.referrer;
  
  // PRESERVE state when:
  // 1. Refreshing the page (no referrer but already on quiz3)
  // 2. Coming from quiz1 or quiz2
  
  if (!referrer && window.location.pathname.includes('quiz/3')) {
    console.log("Refresh detected - preserving state");
    return false;
  }
  
  if (referrer && (referrer.includes('quiz/1') || referrer.includes('quiz/2') || 
                   referrer.includes('quiz1') || referrer.includes('quiz2'))) {
    console.log("Coming from quiz1 or quiz2 - preserving state");
    return false;
  }
  
  // Clear state in all other cases (home, direct access from new tab, etc)
  console.log("Should clear state - fresh start");
  return true;
}let correctAnswers = {};
let nextQuizUrl = null;

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const draggedElement = document.getElementById(data);

  let dropZone = ev.target;

  while (dropZone && !dropZone.classList.contains("borough")) {
    dropZone = dropZone.parentElement;
  }

  if (dropZone && draggedElement && !draggedElement.contains(dropZone)) {
    dropZone.appendChild(draggedElement);
    // Save the current state after each drop
    saveCurrentState();
  } else {
    console.warn("Drop failed: invalid target or circular reference.");
  }
}

// Save the current state of genre placements
function saveCurrentState() {
  const currentState = {};
  
  // For each genre, save its current borough placement
  for (const genreName of Object.keys(correctAnswers)) {
    const el = document.getElementById(genreName.replace(/\s+/g, '_'));
    const parentEl = el.parentElement;
    
    if (parentEl && parentEl.classList.contains('borough')) {
      currentState[genreName] = parentEl.id;
    } else {
      currentState[genreName] = null;
    }
  }
  
  // Save to localStorage
  localStorage.setItem('quiz3_state', JSON.stringify(currentState));
}

// Load saved state from localStorage
function loadSavedState() {
  const savedState = localStorage.getItem('quiz3_state');
  if (!savedState) {
    console.log("No saved state found");
    return;
  }
  
  try {
    const state = JSON.parse(savedState);
    console.log("Loading saved state:", state);
    
    // Place each genre in its saved borough
    for (const [genreName, boroughId] of Object.entries(state)) {
      if (boroughId) {
        const genreEl = document.getElementById(genreName.replace(/\s+/g, '_'));
        const boroughEl = document.getElementById(boroughId);
        
        if (genreEl && boroughEl) {
          boroughEl.appendChild(genreEl);
          console.log(`Placed ${genreName} in ${boroughId}`);
        }
      }
    }
  } catch (error) {
    console.error('Error loading saved state:', error);
    // If there's any error, clear the state
    clearQuizState();
  }
}

function checkAnswers() {
  let score = 0;
  const total = Object.keys(correctAnswers).length;
  
  // Reset all genres to default styling first
  for (const genreName of Object.keys(correctAnswers)) {
    const el = document.getElementById(genreName.replace(/\s+/g, '_'));
    if (el) {
      el.classList.remove('correct-answer', 'incorrect-answer');
    }
  }

  // Check answers and apply styling
  for (const genreName of Object.keys(correctAnswers)) {
    const el = document.getElementById(genreName.replace(/\s+/g, '_'));
    if (!el) continue;
    
    if (el.parentElement?.id === correctAnswers[genreName]) {
      score++;
      el.classList.add('correct-answer'); // Add green styling
    } else if (el.parentElement?.classList.contains('borough')) {
      el.classList.add('incorrect-answer'); // Add red styling
    }
  }

  // Find the container with boroughs (drop boxes)
  const boroughsContainer = document.querySelector('.boroughs') || document.querySelector('.borough-container');
  
  // Create or update the score display
  let scoreDisplay = document.getElementById('score-display');
  if (!scoreDisplay) {
    scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'score-display';
    
    // Insert right after the boroughs container if it exists
    if (boroughsContainer) {
      if (boroughsContainer.nextSibling) {
        boroughsContainer.parentNode.insertBefore(scoreDisplay, boroughsContainer.nextSibling);
      } else {
        boroughsContainer.parentNode.appendChild(scoreDisplay);
      }
    } else {
      // Fallback to a reasonable container
      let container = document.querySelector('.quiz-container') || 
                     document.querySelector('form') || 
                     document.body;
      container.appendChild(scoreDisplay);
    }
  }
  
  scoreDisplay.innerHTML = `
    <div class="score-message">You got ${score} out of ${total} correct!</div>
    <button id="show-explanations-btn" class="action-button">See detailed explanations</button>
  `;
  
  // Add event listener to the explanations button
  document.getElementById('show-explanations-btn').addEventListener('click', () => {
    showExplanations('quiz3');
  });

  const answersPayload = {};
  for (const genreName of Object.keys(correctAnswers)) {
    const el = document.getElementById(genreName.replace(/\s+/g, '_'));
    if (!el) continue;
    
    const parentEl = el.parentElement;
    
    if (parentEl && parentEl.classList.contains('borough')) {
      answersPayload[genreName] = parentEl.id;
    } else {
      answersPayload[genreName] = null;
    }
  }
  console.log('Answers payload:', answersPayload);
  fetch('/submit_quiz', {
    method: 'POST',
    credentials: 'same-origin', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quiz_id: 'quiz3',
      answers: answersPayload,
      score: score
    })
  })
  .then(res => res.json())
  .then(data => {
    nextQuizUrl = data.next;
    console.log('Saved quiz3 results:', data);
  })
  .catch(err => console.error('Quiz submit error:', err));
}

function showFeedback(message) {
  document.getElementById('feedback-message').textContent = message;
  document.getElementById('overlay').classList.remove('hidden');
  document.getElementById('feedback-box').classList.remove('hidden');
}

function showExplanations(quizId) {
  const explanationOverlay = document.getElementById('ex-overlay');
  const explanationBox = document.getElementById('explanation-box');
  
  if (!explanationOverlay || !explanationBox) {
    console.error("Explanation overlay or box not found!");
    return;
  }
  
  // Check if we've already added our buttons
  if (!document.getElementById('explanation-button-container')) {
    // Get the existing Next button
    const existingNextBtn = document.getElementById('ex-close-btn');
    if (!existingNextBtn) {
      console.error("Next button not found!");
      return;
    }
    
    // Create buttons
    const retryBtn = document.createElement('button');
    retryBtn.id = 'retry-overlay-btn';
    retryBtn.className = 'check-btn';
    retryBtn.textContent = 'Retry Quiz';
    
    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-overlay-btn';
    closeBtn.className = 'check-btn';
    closeBtn.textContent = 'Close';
    
    // Clone the next button with its existing styling
    const nextBtn = existingNextBtn.cloneNode(true);
    nextBtn.id = 'next-quiz-btn';
    
    // Create a container for the buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'explanation-button-container';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.marginTop = '15px';
    
    // Add buttons to the container
    buttonContainer.appendChild(retryBtn);
    buttonContainer.appendChild(nextBtn);
    buttonContainer.appendChild(closeBtn);
    
    // Replace the existing button with our container
    existingNextBtn.parentNode.replaceChild(buttonContainer, existingNextBtn);
    
    // Add click handlers
    nextBtn.addEventListener('click', () => {
      clearQuizState();
      if (!nextQuizUrl) {
        alert('Please wait until your answers are saved.');
        return;
      }
      window.location.href = nextQuizUrl;
    });
    
    closeBtn.addEventListener('click', () => {
      explanationOverlay.classList.add('hidden');
      explanationBox.classList.add('hidden');
    });
    
    retryBtn.addEventListener('click', () => {
      explanationOverlay.classList.add('hidden');
      explanationBox.classList.add('hidden');
      resetQuiz();
    });
  }
  
  // Get the explanation list element
  const ul = document.getElementById('explanation-list');
  if (!ul) {
    console.error("Explanation list element not found!");
    return Promise.reject("Explanation list element not found");
  }
  
  // Clear any existing content
  ul.innerHTML = '';

  // Show the explanation overlay and box
  explanationOverlay.classList.remove('hidden');
  explanationBox.classList.remove('hidden');

  return fetch('/static/data/explanations.json')
    .then(response => {
      if (!response.ok) {
        console.error('Could not load explanations.json');
        throw new Error('Failed to load explanations');
      }
      return response.json();
    })
    .then(allExplanations => {
      const explanations = allExplanations[quizId] || {};

      for (const [genre, borough] of Object.entries(correctAnswers)) {
        const li = document.createElement('li');
        // Note: quiz3 has a different explanation format (no borough in the text)
        let html = `<strong>${genre}</strong> →`;
        if (explanations[genre]) {
          html += ` ${explanations[genre]}`;
        }

        li.innerHTML = html;
        ul.appendChild(li);
      }
    })
    .catch(error => {
      console.error('Error showing explanations:', error);
      // Show a fallback message if explanations can't be loaded
      ul.innerHTML = '<li>Failed to load explanations. Please try again later.</li>';
    });
}

// Reset quiz function
function resetQuiz() {
  // Remove all genres from boroughs
  const boroughs = document.querySelectorAll('.borough');
  const genreContainer = document.getElementById('genres');
  if (!genreContainer) {
    console.error("Genre container not found!");
    return;
  }
  
  // Move all genres back to the genre container
  const genres = document.querySelectorAll('.genre');
  genres.forEach(genre => {
    // Remove styling
    genre.classList.remove('correct-answer', 'incorrect-answer');
    // Move back to the genres container
    genreContainer.appendChild(genre);
  });
  
  // Remove score display if it exists
  const scoreDisplay = document.getElementById('score-display');
  if (scoreDisplay) {
    scoreDisplay.remove();
  }
  
  // Clear localStorage
  clearQuizState();
}

function clearQuizState() {
  localStorage.removeItem('quiz3_state');
}

// Function to determine if we need to clear localStorage
function shouldClearState() {
  // Check if we have existing saved state
  const hasExistingState = localStorage.getItem('quiz3_state') !== null;
  
  // Check referrer
  const referrer = document.referrer;
  
  // Quiz3 should ONLY preserve state on refresh
  
  // If no referrer but we have existing state, it's likely a refresh
  if (!referrer && hasExistingState) {
    console.log("Refresh detected (no referrer + existing state) - preserving state");
    return false;
  }
  
  // Clear state in all other cases (including coming from quiz1 or quiz2)
  console.log("Should clear state - fresh start for quiz3");
  return true;
}

document.addEventListener("DOMContentLoaded", function () {
  // Add CSS for correct/incorrect answers
  const style = document.createElement('style');
  style.textContent = `
    .correct-answer {
      background-color: #4CAF50 !important; /* Green */
      color: white !important;
      border: 2px solid #2E7D32 !important;
      transition: background-color 0.3s ease;
    }
    
    .incorrect-answer {
      background-color: #F44336 !important; /* Red */
      color: white !important;
      border: 2px solid #C62828 !important;
      transition: background-color 0.3s ease;
    }
    
    #score-display {
      text-align: center;
      padding: 15px;
      margin: 20px auto;
      max-width: 80%;
      border-radius: 5px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      font-size: 1.1em;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      position: relative;
      z-index: 10;
    }
    
    .score-message {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    
    #show-explanations-btn {
      display: inline-block;
      padding: 10px 20px;
      background-color: #2196F3;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    
    #show-explanations-btn:hover {
      background-color: #0b7dda;
    }
    
    .secondary-button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #757575;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
      margin-left: 10px;
    }
    
    .secondary-button:hover {
      background-color: #616161;
    }
    
    .explanation-buttons {
      display: flex;
      justify-content: center;
      margin-top: 15px;
    }
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 100;
    }
    
    .modal-box {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      z-index: 101;
      max-width: 80%;
      max-height: 80%;
      overflow-y: auto;
    }
    
    .hidden {
      display: none;
    }
  `;
  document.head.appendChild(style);

  fetch("/static/data/quiz3.json?v=" + Date.now())
  .then(response => response.json())
  .then(data => {
    console.log("Loaded data:", data); 
    correctAnswers = data;
    const genresDiv = document.getElementById('genres');
    
    if (genresDiv) {
      // Clear the genres container first
      genresDiv.innerHTML = '';
      
      // Create genre elements
      for (const genre in data) {
        const div = document.createElement('div');
        div.className = 'genre';
        div.draggable = true;
        div.id = genre.replace(/\s+/g, '_');
        div.textContent = genre;
        div.ondragstart = drag;
        genresDiv.appendChild(div);
      }
      
      // Check if we should clear state and load appropriately
      if (shouldClearState()) {
        console.log("Clearing quiz state - new session detected");
        clearQuizState();
      } else {
        // Load saved state after genres are created
        loadSavedState();
      }
    } else {
      console.error("Genres container not found!");
    }
  })
  .catch(err => {
    console.error("Error loading quiz data:", err);
  });

  // Set up event listener for the check button
  const checkBtn = document.getElementById('check-btn');
  if (checkBtn) {
    checkBtn.addEventListener('click', checkAnswers);
  } else {
    console.error("Check button not found!");
  }

  // We'll keep this button handler for backward compatibility
  const continueBtn = document.getElementById('continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', async () => {
      const quizId = 'quiz3';
      const overlay = document.getElementById('overlay');
      if (overlay) {
        overlay.classList.add('hidden');
      }
      
      const feedbackBox = document.getElementById('feedback-box');
      if (feedbackBox) {
        feedbackBox.classList.add('hidden');
      }
      
      showExplanations(quizId);
    });
  }

  // Add event listener for the retry button if it exists
  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      // Hide overlay if it exists
      const overlay = document.getElementById('overlay');
      if (overlay) {
        overlay.classList.add('hidden');
      }
      
      const feedbackBox = document.getElementById('feedback-box');
      if (feedbackBox) {  
        feedbackBox.classList.add('hidden');
      }
      
      // Reset the quiz
      resetQuiz();
    });
  }
});