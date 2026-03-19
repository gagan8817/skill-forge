checkAuth();

async function loadTopicsList() {
    try {
        const user = getUser();
        const userData = await apiCall(`/users/${user.username}`);

        const currentLevel = Math.floor(userData.score / 100) + 1;
        const topics = await apiCall('/topics');
        const topicsList = document.getElementById('topics-list');
        
        const unlockLevels = {
            "Arrays": 1,
            "Linked Lists": 1,
            "Stack and Queue": 2,
            "Trees": 3,
            "Graphs": 4,
            "Dynamic Programming": 5
        };

        const topicMeta = {
            "Arrays": { icon: "📊", desc: "Master the fundamentals of arrays, indexing, and array operations" },
            "Linked Lists": { icon: "🔗", desc: "Learn about nodes, pointers, and dynamic data structures" },
            "Stack and Queue": { icon: "🥞", desc: "Understand LIFO and FIFO principles with practical structures" },
            "Trees": { icon: "🌳", desc: "Explore hierarchical data, BST properties, and traversals" },
            "Graphs": { icon: "🕸️", desc: "Navigate vertices, edges, and complex network mapping" },
            "Dynamic Programming": { icon: "🧠", desc: "Solve complex problems precisely by breaking them down into subproblems" }
        };

        topicsList.innerHTML = '';
        
        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            const requiredLevel = unlockLevels[topic] || 1;
            const isTopicLocked = currentLevel < requiredLevel;

            // Fetch problems under each topic to dynamically calculate their unique progress percentage values per topic.
            const problems = await apiCall(`/topics/${encodeURIComponent(topic)}/problems`);
            const totalNodes = problems.length;
            let completedNodes = 0;

            if (userData.completedProblems) {
                completedNodes = problems.filter(p => userData.completedProblems.includes(p.id)).length;
            }

            const percent = totalNodes === 0 ? 0 : Math.round((completedNodes / totalNodes) * 100);
            const isFullyCompleted = percent === 100 && totalNodes > 0;
            const meta = topicMeta[topic] || { icon: "📚", desc: "Explore algorithms for this specific mastery module." };

            const card = document.createElement('a');
            
            if (!isTopicLocked) {
                card.href = `/topic.html?t=${encodeURIComponent(topic)}`;
            } else {
                card.href = '#';
                card.onclick = (e) => { 
                    e.preventDefault(); 
                    alert(`🔒 Locked! You must reach Level ${requiredLevel} to unlock ${topic}.`); 
                };
            }

            card.className = `topic-card pop-anim ${isFullyCompleted ? 'completed' : ''} ${isTopicLocked ? 'locked' : ''}`;
            card.style.animationDelay = `${i * 0.1}s`;

            let actionIconHtml = '';
            if (isFullyCompleted) {
                actionIconHtml = `<div style="color:#10b981; font-size:1.2rem;">✔️</div>`;
            } else if (isTopicLocked) {
                actionIconHtml = `<div style="color:#888; font-size:1.2rem;">🔒</div>`;
            }

            card.innerHTML = `
                <div class="topic-icon-box">${meta.icon}</div>
                <div class="topic-content">
                    <div class="topic-title-row">
                        <h3>${topic}</h3>
                        ${actionIconHtml}
                    </div>
                    <div class="topic-desc">${meta.desc}</div>
                    
                    <div class="topic-prog-labels">
                        <span>${completedNodes} / ${totalNodes} Nodes</span>
                        <span>${percent}%</span>
                    </div>
                    <div class="topic-prog-track">
                        <div class="topic-prog-fill" style="width: ${percent}%;"></div>
                    </div>
                </div>
            `;
            
            topicsList.appendChild(card);
        }
        
    } catch (e) {
        console.error(e);
        alert('Failed to load topics accurately spanning from DB.');
    }
}

document.addEventListener('DOMContentLoaded', loadTopicsList);
