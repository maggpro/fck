import './styles.css';
import axios from 'axios';

const tg = window.Telegram.WebApp;
let user = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    createUI();
    tg.expand();

    // Получаем данные пользователя
    const initData = tg.initData;
    if (initData) {
        try {
            const response = await axios.get(`/api/user/${initData.user.id}`);
            user = response.data;
            updateUI();
        } catch (error) {
            console.error('Error initializing user:', error);
        }
    }
});

function createUI() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="game-area">
                <h1>Fck Game</h1>
                <div class="stats">
                    <p>Clicks: <span id="clicks">0</span></p>
                    <p>Referrals: <span id="referrals">0</span></p>
                </div>
                <button id="clickButton" class="primary-button">CLICK ME!</button>
            </div>

            <div class="leaderboard">
                <h2>Leaderboard</h2>
                <div id="leaderboardList"></div>
            </div>
        </div>
    `;

    // Добавляем обработчики событий
    document.getElementById('clickButton').addEventListener('click', handleClick);

    // Обновляем таблицу лидеров каждые 30 секунд
    updateLeaderboard();
    setInterval(updateLeaderboard, 30000);
}

async function handleClick() {
    if (!user) return;

    try {
        const response = await axios.post('/api/click', {
            telegramId: user.telegramId
        });

        user.clicks = response.data.clicks;
        updateUI();
        updateLeaderboard();
    } catch (error) {
        console.error('Error processing click:', error);
    }
}

function updateUI() {
    if (!user) return;

    document.getElementById('clicks').textContent = user.clicks;
    document.getElementById('referrals').textContent = user.referralCount || 0;
}

async function updateLeaderboard() {
    try {
        const response = await axios.get('/api/leaderboard');
        const leaderboard = response.data;

        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = leaderboard
            .map((user, index) => `
                <div class="leaderboard-item">
                    <span>${index + 1}. ${user.username}</span>
                    <span>${user.clicks} clicks</span>
                </div>
            `)
            .join('');
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}