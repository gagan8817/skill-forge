checkAuth();

async function loadDashboard() {
    try {
        const user = getUser();
        const userData = await apiCall(`/users/${user.username}`);

        // Set greeting logically
        const hour = new Date().getHours();
        let greeting = 'Good Evening,';
        if (hour < 12) greeting = 'Good Morning,';
        else if (hour < 17) greeting = 'Good Afternoon,';
        document.getElementById('time-greeting').textContent = greeting;

        // Core Username & Level parsing
        document.getElementById('dash-username').textContent = userData.displayName;
        const currentLevel = Math.floor(userData.score / 100) + 1;
        const progressXP = userData.score % 100;

        document.getElementById('dash-level').textContent = currentLevel;
        document.getElementById('dash-xp').textContent = progressXP;

        const progFill = document.getElementById('dash-prog-fill');
        const progText = document.getElementById('dash-prog-text');
        progFill.style.width = `${progressXP}%`;
        progText.textContent = `${100 - progressXP} XP to next level`;

        // Load specific layout metrics 
        document.getElementById('stat-streak').textContent = userData.streak || 1;
        document.getElementById('stat-badges').textContent = userData.badges ? userData.badges.length : 0;
        
        let completedBosses = 0;
        if(userData.completedProblems) {
            completedBosses = userData.completedProblems.filter(p => p.includes('boss')).length;
        }
        document.getElementById('stat-topics').textContent = completedBosses;

        // Verify daily claim reward state constraints
        const today = new Date().toDateString();
        const rewardBtn = document.getElementById('reward-btn');
        const rTitle = document.getElementById('reward-title');
        const rSub = document.getElementById('reward-subtitle');
        
        if (userData.lastClaimDate === today) {
            rewardBtn.className = 'reward-card claimed';
            rTitle.textContent = 'Reward Claimed';
            rSub.textContent = 'Come back tomorrow';
            rewardBtn.onclick = null;
        } else {
            rewardBtn.className = 'reward-card pop-anim';
            rTitle.textContent = 'Claim Daily Reward';
            rSub.textContent = '+20 XP completely free today!';
            
            rewardBtn.onclick = async () => {
                try {
                    const res = await apiCall(`/users/${user.username}/claim-reward`, 'POST');
                    alert(res.message);
                    location.reload(); 
                } catch(e) {
                    alert('Error: ' + e.message);
                }
            };
        }

        // ==========================================
        // ACTIVE MISSIONS - RENDER UNIFIED PATH HERE
        // ==========================================
        const missionsPath = document.getElementById('missions-path');
        missionsPath.innerHTML = '';
        
        const topics = await apiCall('/topics');
        const unlockLevels = {
            "Arrays": 1,
            "Linked Lists": 1,
            "Stack and Queue": 2,
            "Trees": 3,
            "Graphs": 4,
            "Dynamic Programming": 5
        };

        let allMissions = [];
        for (const topic of topics) {
            const problems = await apiCall(`/topics/${encodeURIComponent(topic)}/problems`);
            problems.forEach(p => allMissions.push({ topic, ...p }));
        }

        allMissions.sort((a, b) => {
            const getRank = (title) => {
                if (title.includes('Concept')) return 1;
                if (title.includes('Basic')) return 2;
                if (title.includes('Intermediate')) return 3;
                if (title.includes('Expert')) return 4;
                if (title.includes('BOSS')) return 5;
                return 6;
            };
            return getRank(a.title) - getRank(b.title);
        });

        let topicPreviousCompleted = {}; 

        allMissions.forEach((mission, index) => {
            const requiredLevel = unlockLevels[mission.topic] || 1;
            const isCompleted = userData.completedProblems && userData.completedProblems.includes(mission.id);
            const levelLock = currentLevel < requiredLevel;
            
            if (topicPreviousCompleted[mission.topic] === undefined) {
                topicPreviousCompleted[mission.topic] = true;
            }

            const isLocked = !topicPreviousCompleted[mission.topic] || levelLock;

            const node = document.createElement('a');

            let typeClass = 'type-basic';
            let lockedText = '🔒 Locked';
            let completeText = '✔️ Completed';
            let activeText = '▶ Start Mission';

            if (mission.type === 'concept') {
                typeClass = 'type-concept';
            } else if (mission.type === 'boss') {
                typeClass = 'type-boss';
            }

            node.className = `mission-node pop-anim ${typeClass} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;
            node.style.animationDelay = `${(index % 10) * 0.1}s`;

            if (!isLocked) {
                node.href = `/problem.html?id=${encodeURIComponent(mission.id)}&ref=dashboard`;
            } else {
                node.href = '#';
                node.onclick = (e) => { 
                    e.preventDefault(); 
                    if (levelLock) {
                        alert(`You must reach Level ${requiredLevel} to unlock ${mission.topic} missions!`);
                    } else {
                        alert('Complete the previous active mission in this topic to unlock this one!'); 
                    }
                };
            }
            
            let statusText = activeText;
            if (isLocked) statusText = lockedText;
            if (isCompleted) statusText = completeText;

            node.innerHTML = `
                <div style="font-size:0.9rem; color:var(--gold); text-transform:uppercase; font-weight:900; letter-spacing:1px; margin-bottom:5px;">
                    ${mission.topic}
                </div>
                <div style="font-size:1.4rem; font-weight:800; margin-bottom:10px;">
                    ${mission.title}
                </div>
                <div style="font-size:1rem; font-weight:700; background:rgba(0,0,0,0.2); padding:5px 15px; border-radius:15px;">
                    ${statusText}
                </div>
            `;
            
            missionsPath.appendChild(node);

            topicPreviousCompleted[mission.topic] = isCompleted;
        });

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
