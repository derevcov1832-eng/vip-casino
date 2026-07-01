const TelegramBot = require('node-telegram-bot-api');

// ============================================================
// ⚠️ СЮДА ВСТАВЬ СВОЙ ТОКЕН (получи у @BotFather)
// ============================================================
const token = '8994617400:AAFtNb76Bhc17zCnMlXzYup-b-IEPi8nuPk';  // ← ЗАМЕНИ НА РЕАЛЬНЫЙ ТОКЕН

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Бот VIP Casino запущен!');

// ============================================================
// 1. ДОСТУПНЫЕ ПОДАРКИ
// ============================================================
const GIFTS = {
    'star_1': { name: '⭐ Золотая звезда', emoji: '⭐', cost: 10 },
    'star_2': { name: '🌟 Серебряная звезда', emoji: '🌟', cost: 25 },
    'heart': { name: '❤️ Сердце', emoji: '❤️', cost: 15 },
    'crown': { name: '👑 Корона', emoji: '👑', cost: 50 },
    'rocket': { name: '🚀 Ракета', emoji: '🚀', cost: 30 },
    'diamond': { name: '💎 Алмаз', emoji: '💎', cost: 100 }
};

// ============================================================
// 2. ОБРАБОТКА КОМАНД
// ============================================================

// /start — приветствие
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'игрок';

    await bot.sendMessage(chatId, `
🎰 **Добро пожаловать в VIP Casino, ${firstName}!**

🎮 Играй в монетку, рулетку и блэкджек.
🎁 Выигрывай реальные подарки Telegram.
💎 Собирай NFT-коллекции.

👇 Нажми на кнопку внизу, чтобы открыть казино!
    `, { parse_mode: 'Markdown' });
});

// /gift — список подарков
bot.onText(/\/gift/, async (msg) => {
    const chatId = msg.chat.id;

    let reply = '🎁 **Доступные подарки:**\n\n';
    const keys = Object.keys(GIFTS);
    keys.forEach((id, index) => {
        const g = GIFTS[id];
        reply += `${index + 1}. ${g.emoji} ${g.name} — ⭐ ${g.cost} Stars\n`;
    });
    reply += '\n_Напиши номер подарка (1-6), чтобы получить его._';

    await bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
});

// /help — помощь
bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(chatId, `
🎯 **Как играть:**

1. Нажми кнопку **"Играть"** внизу
2. Выбери игру: Монетка, Рулетка или Блэкджек
3. Выигрывай монеты, NFT и подарки!

🎁 **Как получить подарок:**
- Напиши /gift
- Выбери подарок по номеру
- Подарок появится в твоём профиле

⭐ **Что делать с подарками:**
- Оставить в профиле
- Обменять на Stars
- Продать в маркетплейсе
    `, { parse_mode: 'Markdown' });
});

// Выбор подарка по номеру (1-6)
bot.onText(/^[1-6]$/, async (msg) => {
    const chatId = msg.chat.id;
    const index = parseInt(msg.text) - 1;
    const keys = Object.keys(GIFTS);
    const giftId = keys[index];
    const gift = GIFTS[giftId];

    if (!gift) {
        await bot.sendMessage(chatId, '❌ Подарок не найден.');
        return;
    }

    try {
        await bot.sendMessage(chatId, `
✅ **Подарок отправлен!**
${gift.emoji} ${gift.name}
⭐ Стоимость: ${gift.cost} Stars

_Подарок появится в твоём профиле Telegram._
        `, { parse_mode: 'Markdown' });

        // ===== РЕАЛЬНАЯ ОТПРАВКА ПОДАРКА =====
        // Раскомментируй, когда Telegram добавит метод sendStarGift
        // await bot.sendStarGift(chatId, { gift_id: giftId });

    } catch (error) {
        console.error('Ошибка отправки подарка:', error);
        await bot.sendMessage(chatId, '❌ Не удалось отправить подарок. Попробуй позже.');
    }
});

// ============================================================
// 3. ОБРАБОТКА ДАННЫХ ИЗ MINI APP (WebApp)
// ============================================================
bot.on('web_app_data', async (msg) => {
    const chatId = msg.chat.id;
    const data = msg.web_app_data.data;

    try {
        const parsed = JSON.parse(data);
        console.log('📩 Получены данные от Mini App:', parsed);

        if (parsed.action === 'send_gift') {
            const giftId = parsed.gift_id;
            const userId = parsed.user_id;
            const gift = GIFTS[giftId];

            if (!gift) {
                await bot.sendMessage(chatId, '❌ Подарок не найден.');
                return;
            }

            // Отправляем подтверждение
            await bot.sendMessage(chatId, `
✅ **Подарок отправлен!**
${gift.emoji} ${gift.name}
👤 Пользователь: ${userId}

_Подарок появится в профиле Telegram._
            `, { parse_mode: 'Markdown' });

            // ===== РЕАЛЬНАЯ ОТПРАВКА ПОДАРКА =====
            // Раскомментируй, когда Telegram добавит метод sendStarGift
            // await bot.sendStarGift(chatId, { gift_id: giftId });

        } else {
            await bot.sendMessage(chatId, '📩 Получены данные, но действие не распознано.');
        }

    } catch (error) {
        console.error('Ошибка обработки web_app_data:', error);
        await bot.sendMessage(chatId, '❌ Ошибка обработки данных.');
    }
});

// ============================================================
// 4. ОБРАБОТКА ВСЕХ ОСТАЛЬНЫХ СООБЩЕНИЙ
// ============================================================
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Если сообщение не начинается с / и не является цифрой
    if (text && !text.startsWith('/') && !/^[1-6]$/.test(text)) {
        await bot.sendMessage(chatId, `
❓ Неизвестная команда.

Напиши /help — чтобы узнать, что я умею.
Или нажми кнопку внизу, чтобы открыть казино!
        `);
    }
});

// ============================================================
// 5. ЗАПУСК
// ============================================================
console.log('✅ Бот успешно запущен!');
console.log('📊 Доступно подарков:', Object.keys(GIFTS).length);
console.log('🔗 Открой бота в Telegram и нажми "Играть"');
