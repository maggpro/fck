let tg = window.Telegram.WebApp;
let user = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    tg.expand();

    // Получаем данные пользователя
    const initData = tg.initData;
    if (initData) {
        try {
            const response = await fetch(`/api/user/${initData.user.id}`);
            user = await response.json();

            if (!user) {
                // Создаем нового пользователя
                user = {
                    telegramId: initData.user.id.toString(),
                    username: initData.user.username || 'Anonymous',
                    referralCode: generateReferralCode()
                };
                await fetch('/api/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(user)
                });
            }

            updateUI();
        } catch (error) {
            console.error('Error initializing user:', error);
        }
    }
});

// Обработчик клика
document.getElementById('clickButton').addEventListener('click', async () => {
    if (!user) return;

    try {
        const response = await fetch('/api/click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ telegramId: user.telegramId })
        });

        const data = await response.json();
        user.clicks = data.clicks;
        updateUI();
        updateLeaderboard();
    } catch (error) {
        console.error('Error processing click:', error);
    }
});

// Обработчик реферального кода
document.getElementById('submitReferral').addEventListener('click', async () => {
    if (!user) return;

    const referralCode = document.getElementById('referralInput').value.trim();
    if (!referralCode) return;

    try {
        const response = await fetch('/api/referral', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                telegramId: user.telegramId,
                referralCode: referralCode
            })
        });

        if (response.ok) {
            alert('Referral code applied successfully!');
        } else {
            alert('Invalid referral code');
        }
    } catch (error) {
        console.error('Error applying referral code:', error);
        alert('Error applying referral code');
    }
});

// Обновление UI
function updateUI() {
    document.getElementById('clicks').textContent = user.clicks || 0;
    document.getElementById('referralCode').textContent = user.referralCode || '-';
}

// Обновление таблицы лидеров
async function updateLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const leaderboard = await response.json();

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

// Генерация реферального кода
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Обновляем таблицу лидеров каждые 30 секунд
setInterval(updateLeaderboard, 30000);
updateLeaderboard();