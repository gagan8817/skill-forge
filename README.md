# 🎮 SkillForge

> A gamified Data Structures & Algorithms learning platform that transforms coding education into an epic adventure.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

🔗 **Live Demo:** [https://skill-forge-uemf.onrender.com](https://skill-forge-uemf.onrender.com)

---

## ✨ Features

### 🏠 Home Dashboard
- **Welcome Greeting** with dynamic time-based messages (Good Morning / Evening)
- **Current Rank Card** displaying Level, XP, and progress bar
- **Quick Stats** for Streak, Badges, and Topics completed
- **Daily Login Reward** — Claim 20 XP every 24 hours
- **Journey Map** — A unified mission pathway covering all topics sorted by difficulty

### 📖 Topics (Learning Path)
- Beautiful topic cards with progress tracking per topic
- Topics include: Arrays, Linked Lists, Stack & Queue, Trees, Graphs, Dynamic Programming
- Level-based unlocking system (e.g., Stack & Queue unlocks at Level 2)
- Real-time node completion percentages

### 🏆 Hall of Fame (Leaderboard)
- **Podium View** — Top 3 players displayed on a stunning visual podium with avatars
- Remaining players listed with rank, badges, and XP
- Global ranking across all users

### 👤 Profile
- Avatar card with gradient header and initials display
- Stats overview: Level, Badges, Topics
- **Learning Analysis** — Dynamic strengths, weak areas, and recommendations based on accuracy
- **Badge Collection** — 3x3 grid showing earned and locked badges
- Secure logout

### 🎯 Gamification System
- **XP & Leveling** — 100 XP per level (Level 1 = 100 XP, Level 2 = 200 XP, etc.)
- **Streak Tracking** — Consecutive daily login tracking
- **Badge Awards** — Earned for completing concepts, quizzes, and boss challenges
- **Progressive Difficulty** — Concept → Basic Quiz → Intermediate → Expert → Boss Challenge
- **Boss Challenges** — Final challenge per topic with danger-level difficulty
- **Congratulations Screen** — Celebration animation on level-up

---

## 🛠️ Tech Stack

| Layer      | Technology              |
|------------|------------------------|
| Frontend   | HTML5, CSS3, JavaScript |
| Backend    | Node.js, Express.js    |
| Database   | JSON file-based storage |
| Styling    | Custom CSS (Dark Theme) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or above)

### Installation

```bash
# Clone the repository
git clone https://github.com/gagan8817/skill-forge.git

# Navigate to the project
cd skill-forge

# Install dependencies
npm install

# Start the server
npm start
```

The app will be running at **http://localhost:3000**

---

## 📁 Project Structure

```
skill-forge/
├── backend/
│   └── server.js          # Express server with all API endpoints
├── frontend/
│   ├── css/
│   │   └── style.css      # Global styles and design system
│   ├── js/
│   │   ├── api.js          # API helper functions & auth
│   │   ├── auth.js         # Authentication logic
│   │   ├── dashboard.js    # Home screen & journey map logic
│   │   ├── topics_list.js  # Topics grid rendering
│   │   ├── topic.js        # Individual topic view
│   │   ├── problem.js      # Quiz/problem solving logic
│   │   └── profile.js      # Profile & learning analysis
│   ├── index.html          # Login/Signup page
│   ├── dashboard.html      # Home screen
│   ├── topics.html         # Topics listing
│   ├── topic.html          # Individual topic view
│   ├── problem.html        # Quiz interface
│   ├── leaderboard.html    # Hall of Fame
│   └── profile.html        # User profile
├── data/
│   ├── users.json          # User data storage
│   └── problems.json       # Questions & problems database
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint                          | Description                  |
|--------|----------------------------------|------------------------------|
| POST   | `/api/auth/signup`               | Register a new user          |
| POST   | `/api/auth/login`                | Login existing user          |
| GET    | `/api/users/:username`           | Get user profile data        |
| POST   | `/api/users/:username/add-xp`    | Award XP to user             |
| POST   | `/api/users/:username/complete`  | Mark problem as completed    |
| POST   | `/api/users/:username/claim-reward` | Claim daily 20 XP reward  |
| GET    | `/api/topics`                    | Get all available topics     |
| GET    | `/api/topics/:topic/problems`    | Get problems for a topic     |
| GET    | `/api/problems/:id`              | Get a specific problem       |
| GET    | `/api/leaderboard`               | Get global leaderboard       |

---

## 🎨 Design Philosophy

- **Mobile-First** dark theme UI inspired by modern gaming apps
- **Glassmorphism** and gradient effects for premium feel
- **Micro-animations** for engaging user interactions
- **Bottom Navigation Bar** for seamless app-like navigation
- **Gamified Progression** to keep learners motivated

