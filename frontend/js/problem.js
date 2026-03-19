checkAuth();

let currentProblemId = null;
let currentLevel = null;
let currentQuestionIndex = 0;
let initialQuestionLength = 0;
let currentAnswer = null;
let isSubmitted = false;
let isFinished = false;
let topicName = "";

function goBack() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ref') === 'topic') {
        window.location.href = `/topic.html?t=${encodeURIComponent(topicName)}`;
    } else {
        window.location.href = '/dashboard.html';
    }
}

async function loadLevel() {
    const urlParams = new URLSearchParams(window.location.search);
    const problemId = urlParams.get('id');
    
    if (!problemId) {
        window.location.href = '/dashboard.html';
        return;
    }

    currentProblemId = problemId;
    const user = getUser();

    try {
        const userData = await apiCall(`/users/${user.username}`);
        document.getElementById('user-score').textContent = userData.score;

        const levelData = await apiCall(`/problems/${encodeURIComponent(problemId)}`);
        topicName = levelData.topic;
        currentLevel = levelData;
        
        if (!currentLevel.questions && currentLevel.options) {
            currentLevel.questions = [{
                description: currentLevel.description,
                options: currentLevel.options,
                answer: currentLevel.answer
            }];
        }

        currentQuestionIndex = 0;
        initialQuestionLength = currentLevel.questions.length;
        renderQuestion();
    } catch (error) {
        console.error('Error loading level:', error);
        alert('Failed to load level. ' + error.message);
    }
}

function renderQuestion() {
    isSubmitted = false;
    currentAnswer = null;
    
    const checkBtn = document.getElementById('check-btn');
    checkBtn.disabled = true;
    checkBtn.textContent = 'CHECK';
    checkBtn.className = 'btn btn-secondary';
    document.getElementById('status-msg').textContent = '';

    let progressPercent = (currentQuestionIndex / initialQuestionLength) * 100;
    if (progressPercent > 100) progressPercent = 100;
    document.getElementById('progress-bar').style.width = `${progressPercent}%`;

    document.getElementById('problem-title').textContent = `${currentLevel.title}`;
    
    const node = currentLevel.questions[currentQuestionIndex];
    document.getElementById('problem-description').textContent = node.description;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    node.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn pop-anim';
        btn.style.animationDelay = `${index * 0.05}s`;
        btn.textContent = opt;
        btn.onclick = () => selectOption(btn, index);
        optionsContainer.appendChild(btn);
    });
}

function selectOption(btn, index) {
    if (isSubmitted || isFinished) return; 
    
    currentAnswer = index;
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('check-btn').disabled = false;
}

document.getElementById('check-btn').addEventListener('click', async () => {
    if (currentAnswer === null || isFinished) return;

    const checkBtn = document.getElementById('check-btn');
    const node = currentLevel.questions[currentQuestionIndex];
    const correctAnswerIndex = node.answer;
    
    const isEditing = checkBtn.textContent === 'CONTINUE';

    if (isEditing) {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentLevel.questions.length) {
            renderQuestion();
        } else {
            finishLevel();
        }
        return;
    }

    isSubmitted = true;
    checkBtn.textContent = 'CONTINUE';
    
    const allButtons = document.querySelectorAll('.option-btn');
    const selectedBtn = allButtons[currentAnswer];
    const statusMsg = document.getElementById('status-msg');

    const user = getUser();
    const correct = currentAnswer === correctAnswerIndex;

    if (correct) {
        selectedBtn.classList.remove('selected');
        selectedBtn.classList.add('correct');
        statusMsg.textContent = 'Perfect! +25 XP 🌟';
        statusMsg.style.color = 'var(--primary)';
        checkBtn.className = 'btn btn-primary';
    } else {
        selectedBtn.classList.remove('selected');
        selectedBtn.classList.add('wrong');
        allButtons[correctAnswerIndex].classList.add('correct');
        statusMsg.textContent = 'Nice try! +5 XP 🧡';
        statusMsg.style.color = 'var(--gold)';
        checkBtn.className = 'btn btn-warning';
    }

    // Ping API efficiently recording correct state tracking payload inside add-xp endpoint
    try {
        const xpAmount = correct ? 25 : 5;
        const resp = await apiCall(`/users/${user.username}/add-xp`, 'POST', { xp: xpAmount, isCorrect: correct });
        document.getElementById('user-score').textContent = resp.score;
    } catch(e) {}
});

async function finishLevel() {
    isFinished = true;
    document.getElementById('progress-bar').style.width = '100%';
    
    const checkBtn = document.getElementById('check-btn');
    const user = getUser();
    let badgeToAward = `🎖️ ${currentLevel.title}`;

    try {
        const response = await apiCall(`/users/${user.username}/complete`, 'POST', { 
            problemId: currentProblemId, 
            badge: badgeToAward 
        });

        if (response.isNewUnlock) {
            document.getElementById('full-screen-overlay').classList.add('active');
            document.getElementById('congrats-text').innerHTML = `You have mastered <br> <span style="font-size:3rem;">${currentLevel.title}</span>`;
            document.getElementById('badge-reward').textContent = currentLevel.type === 'boss' ? '☠️' : '🏆';
            document.getElementById('floating-xp').textContent = `New Gateway Unlocked!`;
            
            document.getElementById('continue-overlay-btn').onclick = () => {
                goBack();
            };
        } else {
            document.getElementById('problem-title').textContent = 'Lesson Wrapped!';
            document.getElementById('problem-description').textContent = 'You completed all questions. Great practice!';
            document.getElementById('options-container').innerHTML = '';
            document.getElementById('status-msg').textContent = 'Review complete.';
            checkBtn.textContent = 'RETURN TO MAP';
            checkBtn.className = 'btn btn-primary btn-outline';
            checkBtn.disabled = false;
            checkBtn.onclick = () => goBack();
        }
    } catch (e) {
        console.error(e);
        goBack();
    }
}

document.addEventListener('DOMContentLoaded', loadLevel);
