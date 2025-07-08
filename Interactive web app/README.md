# NYC Music History — Interactive Educational Web App

This project is a full-stack educational web application designed to teach users about the historical development of music in New York City. By combining storytelling, interactive quizzes, and intuitive navigation, the platform engages users in exploring key moments and movements in NYC’s musical heritage.

---

## Overview

**NYC Music History** is built using a Python Flask server and rendered with HTML templates to deliver a seamless, interactive learning experience. Users navigate through different time periods and genres—from the Harlem Renaissance to the Punk movement—through visually distinct pages and quizzes that reinforce key information.

---

## Features

- **Interactive Timeline**: Navigate through key historical periods in NYC music history.
- **Dynamic Content**: Each section features its own themed layout and multimedia content.
- **Knowledge Checks**: Integrated quizzes enhance engagement and comprehension.
- **Modular Routing**: Flask server uses clearly defined routes for each topic.
- **Custom UI/UX Design**: Purpose-built frontend with educational storytelling in mind.

---

## Technologies Used

- **Python (Flask)** – Backend server and routing
- **HTML / CSS / Jinja2** – Templating and frontend layout
- **JavaScript** – For interactivity enhancements
- **Flask Sessions** – To manage user progress and navigation state

---

## Example Routes

- `/` – Home page (map-based UI entry point)
- `/harlem-renaissance` – Intro to the Harlem Renaissance
- `/harlem-renaissance/harlem` – Deeper dive into Harlem’s cultural impact
- `/harlem-renaissance/harlem_quiz` – Quiz on Harlem Renaissance
- `/punk` – Overview of NYC punk music
- `/punk/cbgb` – Focus on CBGB and punk venues

---

## Getting Started

To run this application locally:

```bash
git clone https://github.com/yourusername/nyc-music-history.git
cd nyc-music-history
pip install flask
python server.py
```

Visit `http://localhost:5000` in your browser to begin exploring the site.

