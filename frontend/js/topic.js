checkAuth();

async function loadTopic() {
    const urlParams = new URLSearchParams(window.location.search);
    const topic = urlParams.get('t');
    if (!topic) {
        window.location.href = '/dashboard.html';
        return;
    }

    document.getElementById('topic-title').textContent = topic;

    try {
        const user = getUser();
        const userData = await apiCall(`/users/${user.username}`);

        // Level Lock Verification
        const currentLevel = Math.floor(userData.score / 100) + 1;
        const unlockLevels = {
            "Arrays": 1,
            "Linked Lists": 1,
            "Stack and Queue": 2,
            "Trees": 3,
            "Graphs": 4,
            "Dynamic Programming": 5
        };
        
        if (currentLevel < (unlockLevels[topic] || 1)) {
            alert(`You must master prior concepts to reach Level ${unlockLevels[topic]} and unlock this subject!`);
            window.location.href = '/dashboard.html';
            return;
        }

        const problems = await apiCall(`/topics/${encodeURIComponent(topic)}/problems`);
        const pathContainer = document.getElementById('problem-path');
        pathContainer.innerHTML = '';

        let previousCompleted = true;

        problems.forEach((problem, index) => {
            const isCompleted = userData.completedProblems && userData.completedProblems.includes(problem.id);
            const isLocked = !previousCompleted;

            const node = document.createElement('a');
            
            let typeClass = 'type-basic';
            let lockedText = '🔒 Locked';
            let completeText = '✔️ Completed';
            let activeText = '▶ Start Mission';

            if (problem.type === 'concept') {
                typeClass = 'type-concept';
            } else if (problem.type === 'boss') {
                typeClass = 'type-boss';
            }

            node.className = `mission-node pop-anim ${typeClass} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;
            node.style.animationDelay = `${(index % 10) * 0.1}s`;

            if (!isLocked) {
                node.href = `/problem.html?id=${encodeURIComponent(problem.id)}&ref=topic`;
            } else {
                node.href = '#';
                node.onclick = (e) => { e.preventDefault(); alert('Complete the previous level in this series to unlock!'); };
            }

            let statusText = activeText;
            if (isLocked) statusText = lockedText;
            if (isCompleted) statusText = completeText;

            node.innerHTML = `
                <div style="font-size:0.9rem; color:var(--gold); text-transform:uppercase; font-weight:900; letter-spacing:1px; margin-bottom:5px;">
                    ${topic}
                </div>
                <div style="font-size:1.4rem; font-weight:800; margin-bottom:10px;">
                    ${problem.title}
                </div>
                <div style="font-size:1rem; font-weight:700; background:rgba(0,0,0,0.2); padding:5px 15px; border-radius:15px;">
                    ${statusText}
                </div>
            `;
            
            pathContainer.appendChild(node);
            
            if (!isCompleted) {
                previousCompleted = false;
            }
        });
    } catch (e) {
        console.error(e);
        alert('Failed to load topic correctly.');
    }
}

document.addEventListener('DOMContentLoaded', loadTopic);
