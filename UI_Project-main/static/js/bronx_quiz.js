const optionsContainer = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const submitButton = document.getElementById('submit-btn');
const resetButton = document.getElementById('reset-btn');

// Selected options array
let selectedOptions = [];

// Initialize the quiz
function initQuiz() {
    // Clear existing options if any
    optionsContainer.innerHTML = '';
    
    // Create option elements
    quizData.options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectOption(optionElement, option));
        optionsContainer.appendChild(optionElement);
    });

    // Add event listeners
    submitButton.addEventListener('click', checkAnswer);
    resetButton.addEventListener('click', resetQuiz);
}

// Handle option selection
function selectOption(element, option) {
    // Since this is a multi-select quiz (multiple correct answers)
    if (element.classList.contains('selected')) {
        // If already selected, unselect it
        element.classList.remove('selected');
        selectedOptions = selectedOptions.filter(item => item !== option);
    } else {
        // Otherwise, select it
        element.classList.add('selected');
        selectedOptions.push(option);
    }

    // Enable submit button if at least one option is selected
    submitButton.disabled = selectedOptions.length === 0;
}

// Check the answer
function checkAnswer() {
    const options = document.querySelectorAll('.option');
    let isCorrect = true;

    // Check if all selected options are correct
    if (selectedOptions.length !== quizData.correctAnswer.length) {
        isCorrect = false;
    } else {
        selectedOptions.forEach(option => {
            if (!quizData.correctAnswer.includes(option)) {
                isCorrect = false;
            }
        });
    }

    // Mark options as correct or incorrect
    options.forEach(option => {
        const optionValue = option.textContent;
        
        if (quizData.correctAnswer.includes(optionValue)) {
            option.classList.add('correct');
        } else if (selectedOptions.includes(optionValue)) {
            option.classList.add('incorrect');
        }
    });

    // Show feedback
    feedbackElement.textContent = isCorrect ? quizData.feedback.correct : quizData.feedback.incorrect;
    feedbackElement.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    feedbackElement.style.display = 'block';

    // Disable submit button and show reset button
    submitButton.style.display = 'none';
    resetButton.style.display = 'block';

    // Disable further selection
    options.forEach(option => {
        option.style.pointerEvents = 'none';
    });
}

// Reset the quiz
function resetQuiz() {
    // Clear selected options
    selectedOptions = [];

    // Reset UI
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
        option.style.pointerEvents = 'auto';
    });

    // Hide feedback
    feedbackElement.style.display = 'none';

    // Show submit button and hide reset button
    submitButton.style.display = 'block';
    submitButton.disabled = true;
    resetButton.style.display = 'none';
}