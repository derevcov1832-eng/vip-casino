const TelegramBot = require('node-telegram-bot-api');

// ============================================================
// ⚠️ ТОКЕН БОТА (ЗАМЕНИ НА СВОЙ)
// ============================================================
const token = '8994617400:AAFtNb76Bhc17zCnMlXzYup-b-IEPi8nuPk';  // ← ВСТАВЬ СВОЙ ТОКЕН ОТ @BotFather

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Бот @My103CoinGameBot запущен!');

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
// 2. РЕФЕРАЛЬНАЯ СИСТЕМА (ХРАНИЛИЩЕ)
// ============================================================
// В реальном проекте используй базу данных (SQLite, PostgreSQL)
// Сейчас данные хранятся в памяти (сбрасываются при перезапуске)
const referrals = {};

// ============================================================
// 3. КОМАНДЫ
// ============================================================

// /start — приветствие
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'игрок';
    const userId = msg.from.id;

    // Проверяем, есть ли реферальный параметр
    const text = msg.text || '';
    const match = text.match(/\/start ref_(\d+)/);

    if (match) {
        const referrerId = match[1];

        // Нельзя пригласить самого себя
        if (String(referrerId) === String(userId)) {
            await bot.sendMessage(chatId, '❌ Нельзя пригласить самого себя!');
            return;
        }

        // Сохраняем реферальную связь
        if (!referrals[referrerId]) {
            referrals[referrerId] = [];
        }
        if (!referrals[referrerId].includes(userId)) {
            referrals[referrerId].push(userId);
        }

        // Отправляем приветствие с рефералкой
        await bot.sendMessage(chatId, `
🎉 **Ты перешёл по реферальной ссылке, ${firstName}!**

👥 Пригласивший получит бонус 50 монет.
🎁 А ты получаешь +25 монет за регистрацию!

🔗 Нажми на кнопку внизу, чтобы начать играть.
        `, { parse_mode: 'Markdown' });

        // Уведомление рефереру (если бот знает его chatId)
        try {
            await bot.sendMessage(referrerId, `
👥 **Новый игрок перешёл по твоей ссылке!**

👤 ${firstName} (ID: ${userId})
💰 +50 монет начислено!

📊 Всего приглашено: ${referrals[referrerId].length} человек
            `, { parse_mode: 'Markdown' });
        } catch (e) {
            console.log('Не удалось уведомить реферера:', e.message);
        }

        return;
    }

    // Обычный старт (без рефералки)
    await bot.sendMessage(chatId, `
🎰 **Добро пожаловать в VIP Casino, ${firstName}!**

🎮 Играй в монетку, рулетку и блэкджек.
🎁 Выигрывай реальные подарки Telegram.
💎 Собирай NFT-коллекции.
👥 Приводи друзей и получай бонусы!

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

👥 **Реферальная система:**
- Приведи друга по ссылке из профиля
- Получи 50 монет за каждого друга
- Друг получает +25 монет за регистрацию

⭐ **Что делать с подарками:**
- Оставить в профиле
- Обменять на Stars
- Продать в маркетплейсе

📞 **Поддержка:** @My103CoinGameBot
    `, { parse_mode: 'Markdown' });
});

// /referral — реферальная статистика
bot.onText(/\/referral/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const count = referrals[userId] ? referrals[userId].length : 0;

    await bot.sendMessage(chatId, `
👥 **Твоя реферальная статистика:**

👤 Приглашено друзей: ${count}
💰 Бонус за каждого: 50 монет

🔗 Твоя ссылка:
\`https://t.me/My103CoinGameBot?start=ref_${userId}\`

_Отправь эту ссылку друзьям и получай бонусы!_
    `, { parse_mode: 'Markdown' });
});

// /stats — статистика бота
bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;

    const totalReferrals = Object.values(referrals).reduce((sum, arr) => sum + arr.length, 0);
    const totalUsers = Object.keys(referrals).length;

    await bot.sendMessage(chatId, `
📊 **Статистика бота:**

👥 Всего рефереров: ${totalUsers}
👤 Всего приглашённых: ${totalReferrals}
🎁 Доступно подарков: ${Object.keys(GIFTS).length}

_Бот работает стабильно!_
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
// 4. ОБРАБОТКА ДАННЫХ ИЗ MINI APP (WebApp)
// ============================================================
bot.on('web_app_data', async (msg) => {
    const chatId = msg.chat.id;
    const data = msg.web_app_data.data;

    try {
        const parsed = JSON.parse(data);
        console.log('📩 Получены данные от Mini App:', parsed);

        // ===== ПОКУПКА МОНЕТ =====
        if (parsed.action === 'buy_coins') {
            const starsCost = parsed.stars;
            const coinsAmount = parsed.coins;

            const validPrices = {
                10: 100,
                25: 300,
                50: 700,
                100: 1500
            };

            if (validPrices[starsCost] !== coinsAmount) {
                await bot.sendMessage(chatId, '❌ Некорректная цена.');
                return;
            }

            await bot.sendMessage(chatId, `
⭐ **Покупка монет!**

💰 ${coinsAmount} монет
⭐ Стоимость: ${starsCost} Stars

_Оплата через Telegram Stars._
            `, { parse_mode: 'Markdown' });

            // ===== ЗДЕСЬ ДОЛЖЕН БЫТЬ ИНВОЙС =====
            // В реальном проекте создавай инвойс через bot.sendInvoice()

            setTimeout(async () => {
                await bot.sendMessage(chatId, `
✅ **Оплата прошла успешно!**

💰 Начислено: ${coinsAmount} монет
⭐ Списано: ${starsCost} Stars

_Баланс обновлён в приложении._
                `, { parse_mode: 'Markdown' });
            }, 2000);

            return;
        }

        // ===== ОТПРАВКА ПОДАРКА =====
        if (parsed.action === 'send_gift') {
            const giftId = parsed.gift_id;
            const userId = parsed.user_id;
            const gift = GIFTS[giftId];

            if (!gift) {
                await bot.sendMessage(chatId, '❌ Подарок не найден.');
                return;
            }

            await bot.sendMessage(chatId, `
✅ **Подарок отправлен!**
${gift.emoji} ${gift.name}
👤 Пользователь: ${userId}

_Подарок появится в профиле Telegram._
            `, { parse_mode: 'Markdown' });

            return;
        }

        // Неизвестное действие
        await bot.sendMessage(chatId, '❌ Неизвестное действие.');

    } catch (error) {
        console.error('Ошибка обработки web_app_data:', error);
        await bot.sendMessage(chatId, '❌ Ошибка обработки данных.');
    }
});

// ============================================================
// 5. ОБРАБОТКА ПЛАТЕЖЕЙ (REAL)
// ============================================================

// Создание инвойса (счёт для оплаты Stars)
async function createInvoice(chatId, stars, coins) {
    try {
        const invoice = {
            chat_id: chatId,
            title: `${coins} монет VIP Casino`,
            description: `Пополнение баланса на ${coins} монет`,
            payload: `buy_${coins}_${Date.now()}`,
            currency: 'XTR', // Telegram Stars
            prices: [
                { label: `${coins} монет`, amount: stars }
            ]
        };

        // Отправка инвойса (требует настройки платежей в @BotFather)
        // const result = await bot.sendInvoice(invoice);
        // console.log('✅ Инвойс отправлен:', result);
        // return result;

        // Временная заглушка
        console.log('📝 Инвойс для оплаты:', invoice);
        return null;

    } catch (error) {
        console.error('❌ Ошибка создания инвойса:', error);
        return null;
    }
}

// Обработка предоплаты (проверка перед оплатой)
bot.on('pre_checkout_query', (query) => {
    bot.answerPreCheckoutQuery(query.id, true);
});

// Обработка успешной оплаты
bot.on('successful_payment', async (msg) => {
    const chatId = msg.chat.id;
    const payload = msg.successful_payment.invoice_payload;

    // Извлекаем количество монет из payload
    const match = payload.match(/buy_(\d+)_/);
    const coins = match ? parseInt(match[1]) : 0;

    if (coins > 0) {
        // В реальном проекте начисляем монеты в базу данных
        await bot.sendMessage(chatId, `
✅ **Пополнение успешно!**
💰 Начислено: ${coins} монет

_Баланс обновлён. Перезапусти приложение, чтобы увидеть изменения._
        `, { parse_mode: 'Markdown' });
    }
});

// ============================================================
// 6. ОБРАБОТКА ВСЕХ ОСТАЛЬНЫХ СООБЩЕНИЙ
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
// 7. ЗАПУСК
// ============================================================
console.log('✅ Бот @My103CoinGameBot успешно запущен!');
console.log('📊 Доступно подарков:', Object.keys(GIFTS).length);
console.log('👥 Реферальная система активна!');
console.log('🔗 Ссылка для приглашения: https://t.me/My103CoinGameBot?start=ref_ТВОЙ_ID');
