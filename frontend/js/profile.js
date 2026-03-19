checkAuth();

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
}

async function loadProfile() {
    try {
        const user = getUser();
        const userData = await apiCall(`/users/${user.username}`);

        document.getElementById('p-initials').textContent = getInitials(userData.displayName || user.username);
        document.getElementById('p-name').textContent = userData.displayName || user.username.split('@')[0];
        document.getElementById('p-email').textContent = user.username;

        const currentLevel = Math.floor(userData.score / 100) + 1;
        document.getElementById('p-level').textContent = currentLevel;
        document.getElementById('p-badges').textContent = userData.badges ? userData.badges.length : 0;
        
        let completedBosses = 0;
        if(userData.completedProblems) {
            completedBosses = userData.completedProblems.filter(p => p.includes('boss')).length;
        }
        document.getElementById('p-topics').textContent = completedBosses;

        // Custom image mapped aesthetic badges layout mapping natively to backend inventory count:
        const allBadgesDef = [
            { name: 'First Step', icon: '🚀' },
            { name: 'First Answer', icon: '⚡' },
            { name: 'Array Master', icon: '🏆' },
            { name: 'List Legend', icon: '🔗' },
            { name: 'Stack Ace', icon: '🥞' },
            { name: 'Sort Wizard', icon: '🧙' },
            { name: 'Queue King', icon: '👑' },
            { name: 'Tree Climber', icon: '🌳' },
            { name: 'Sharp Mind', icon: '🧠' }
        ];

        const acquiredCount = userData.badges ? userData.badges.length : 0;
        
        let badgesHtml = '';
        allBadgesDef.forEach((b, idx) => {
            const isAcquired = idx < acquiredCount;
            badgesHtml += `
                <div class="badge-node ${isAcquired ? 'acquired' : ''}">
                    <div class="b-icon">${b.icon}</div>
                    <div class="b-lbl">${b.name}</div>
                </div>
            `;
        });
        document.getElementById('collection-grid').innerHTML = badgesHtml;

        const acc = userData.totalAnswers > 0 ? Math.round((userData.correctAnswers / userData.totalAnswers)*100) : 100;
        
        document.getElementById('la-score').textContent = userData.score || 0;
        document.getElementById('la-accuracy').textContent = acc + '%';
        
        const topicsCount = completedBosses > 0 ? completedBosses : (userData.badges ? Math.max(1, Math.floor(userData.badges.length / 2)) : 0);
        document.getElementById('la-topics').textContent = topicsCount;

        let strengthsHtml = '';
        if (acc >= 70) {
            strengthsHtml += `<li>High precision and exceptional logical accuracy</li>`;
        } else {
            strengthsHtml += `<li>Persistence and dedication to learning</li>`;
        }
        if (userData.streak > 2) {
            strengthsHtml += `<li>Consistent daily activity routines</li>`;
        }
        if (strengthsHtml === '') strengthsHtml = `<li>Getting started with fundamentals</li>`;
        
        let weakHtml = '';
        if (acc < 50) {
            weakHtml += `<li>Needs improvement in Arrays & core algorithms</li>`;
        } else if (acc >= 50 && acc < 75) {
            weakHtml += `<li>Debugging edge cases in sorting mechanisms</li>`;
        } else {
            weakHtml += `<li>No major weak areas flagged yet</li>`;
        }

        let recsHtml = '';
        if (acc < 65) {
            recsHtml += `<li>Review explanations carefully after each wrong answer</li>`;
            recsHtml += `<li>Focus heavily on Arrays fundamentals first</li>`;
        } else if (acc >= 65 && acc <= 85) {
            recsHtml += `<li>Good speed! Try progressing to harder problems</li>`;
            recsHtml += `<li>Take time tracing logic through dry-runs</li>`;
        } else {
            recsHtml += `<li>Excellent progress! Keep tackling the Boss Challenges</li>`;
        }

        document.getElementById('la-strengths-list').innerHTML = strengthsHtml;
        document.getElementById('la-weak-list').innerHTML = weakHtml;
        document.getElementById('la-recs-list').innerHTML = recsHtml;

    } catch (e) {
        console.error(e);
        alert('Failed loading profile mappings layout parameters natively.');
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);
