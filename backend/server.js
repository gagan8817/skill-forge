const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

const USERS_FILE = path.join(__dirname, '../data/users.json');
const PROBLEMS_FILE = path.join(__dirname, '../data/problems.json');

const readData = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            return filePath === USERS_FILE ? [] : {};
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return filePath === USERS_FILE ? [] : {};
    }
};

const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
    }
};

// Help update streak based on DD/MM/YYYY
const updateObjectActivity = (user) => {
    const today = new Date().toDateString();
    if (!user.lastActiveDate) {
        user.lastActiveDate = today;
        user.streak = 1;
    } else if (user.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (user.lastActiveDate === yesterday.toDateString()) {
            user.streak = (user.streak || 1) + 1;
        } else {
            user.streak = 1; // Reset streak
        }
        user.lastActiveDate = today;
    }
    if(user.streak == null) user.streak = 1;
    return user;
};

// Auth
app.post('/api/auth/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const users = readData(USERS_FILE);
    if (users.find(u => u.username === username)) return res.status(400).json({ error: 'Username already exists' });

    let newUser = { 
        username, 
        displayName: username.split('@')[0], 
        password, score: 0, completedProblems: [], badges: [],
        totalAnswers: 0, correctAnswers: 0,
        streak: 1, lastActiveDate: new Date().toDateString()
    };
    users.push(newUser);
    writeData(USERS_FILE, users);

    res.status(201).json({ message: 'Success', user: newUser });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    let users = readData(USERS_FILE);
    
    let userIndex = users.findIndex(u => u.username === username && u.password === password);
    if (userIndex === -1) return res.status(401).json({ error: 'Invalid config' });

    users[userIndex] = updateObjectActivity(users[userIndex]);
    writeData(USERS_FILE, users);

    res.json({ message: 'Login successful', user: users[userIndex] });
});

// User: Record Activity / Get details
app.post('/api/users/:username/activity', (req, res) => {
    let users = readData(USERS_FILE);
    let userIndex = users.findIndex(u => u.username === req.params.username);
    if (userIndex !== -1) {
        users[userIndex] = updateObjectActivity(users[userIndex]);
        writeData(USERS_FILE, users);
        res.json({ streak: users[userIndex].streak });
    } else {
        res.status(404).json({error: 'Not found'});
    }
});

app.get('/api/users/:username', (req, res) => {
    const users = readData(USERS_FILE);
    const user = users.find(u => u.username === req.params.username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ 
        username: user.username, 
        displayName: user.displayName || user.username.split('@')[0],
        score: user.score, 
        completedProblems: user.completedProblems || [], 
        badges: user.badges || [],
        totalAnswers: user.totalAnswers || 0,
        correctAnswers: user.correctAnswers || 0,
        streak: user.streak || 0,
        lastClaimDate: user.lastClaimDate || null
    });
});

app.post('/api/users/:username/profile', (req, res) => {
    const { displayName, password } = req.body;
    const users = readData(USERS_FILE);
    const userIndex = users.findIndex(u => u.username === req.params.username);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    if (displayName) users[userIndex].displayName = displayName;
    if (password) users[userIndex].password = password;
    writeData(USERS_FILE, users);
    res.json({ message: 'Profile updated', user: users[userIndex] });
});

app.get('/api/leaderboard', (req, res) => {
    const users = readData(USERS_FILE);
    const sorted = users
        .map(u => ({ username: u.username, displayName: u.displayName || u.username.split('@')[0], score: u.score, badges: u.badges || [] }))
        .sort((a, b) => b.score - a.score);
    res.json(sorted);
});

// App Stats wrapper
app.get('/api/stats', (req, res) => {
    const problems = readData(PROBLEMS_FILE);
    let totalLevels = 0;
    Object.keys(problems).forEach(k => { totalLevels += problems[k].length; });
    res.json({ totalLevels });
});

app.get('/api/topics', (req, res) => {
    const problems = readData(PROBLEMS_FILE);
    res.json(Object.keys(problems));
});

app.get('/api/topics/:topic/problems', (req, res) => {
    const problems = readData(PROBLEMS_FILE);
    res.json(problems[req.params.topic] || []);
});

app.get('/api/problems/:id', (req, res) => {
    const problems = readData(PROBLEMS_FILE);
    for (const topic in problems) {
        const problem = problems[topic].find(p => p.id === req.params.id);
        if (problem) return res.json({ topic, ...problem }); 
    }
    res.status(404).json({ error: 'Problem not found' });
});

app.post('/api/users/:username/add-xp', (req, res) => {
    const { xp, isCorrect } = req.body;
    const users = readData(USERS_FILE);
    const userIndex = users.findIndex(u => u.username === req.params.username);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    
    users[userIndex].score = (users[userIndex].score || 0) + Number(xp);
    if(users[userIndex].totalAnswers == null) users[userIndex].totalAnswers = 0;
    if(users[userIndex].correctAnswers == null) users[userIndex].correctAnswers = 0;
    
    users[userIndex].totalAnswers += 1;
    if(isCorrect) users[userIndex].correctAnswers += 1;

    writeData(USERS_FILE, users);
    res.json({ score: users[userIndex].score });
});

app.post('/api/users/:username/complete', (req, res) => {
    const { problemId, badge } = req.body;
    const users = readData(USERS_FILE);
    const userIndex = users.findIndex(u => u.username === req.params.username);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    const user = users[userIndex];
    if (!user.completedProblems) user.completedProblems = [];
    if (!user.badges) user.badges = [];

    let isNew = false;
    if (!user.completedProblems.includes(problemId)) {
        user.completedProblems.push(problemId);
        isNew = true;
    }
    if (badge && !user.badges.includes(badge)) user.badges.push(badge);

    users[userIndex] = user;
    writeData(USERS_FILE, users);
    res.json({ score: user.score, completedProblems: user.completedProblems, badges: user.badges, isNewUnlock: isNew });
});

app.post('/api/users/:username/claim-reward', (req, res) => {
    const users = readData(USERS_FILE);
    const userIndex = users.findIndex(u => u.username === req.params.username);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    
    const user = users[userIndex];
    const today = new Date().toDateString();
    
    if (user.lastClaimDate === today) {
        return res.status(400).json({ error: 'Reward already claimed today' });
    }
    
    user.lastClaimDate = today;
    user.score = (user.score || 0) + 20;
    users[userIndex] = user;
    writeData(USERS_FILE, users);
    
    res.json({ message: 'Daily 20 XP Claimed!', score: user.score });
});

app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        let filePath = req.path === '/' ? '/index.html' : req.path;
        if (!filePath.endsWith('.html') && !filePath.includes('.')) filePath += '.html';
        
        const fullPath = path.join(__dirname, '../frontend', filePath);
        if (fs.existsSync(fullPath)) {
            res.sendFile(fullPath);
        } else {
            res.status(404).send('File not found');
        }
    }
});

app.listen(PORT, '0.0.0.0', () => { console.log(`Server listening on ${PORT}`); });
