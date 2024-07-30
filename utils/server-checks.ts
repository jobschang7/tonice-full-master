import crypto from 'crypto';

interface ValidatedData {
  [key: string]: string;
}

interface User {
  id?: string;
  username?: string;
}

export function validateTelegramWebAppData(telegramInitData: string): { validatedData: ValidatedData | null, user: User } {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const BYPASS_AUTH = process.env.BYPASS_TELEGRAM_AUTH === 'true';

  console.log("validateTelegramWebAppData");
  console.log("telegramInitData", telegramInitData);


  let validatedData: ValidatedData | null = null;
  let user: User = {};

  if (BYPASS_AUTH) {
    validatedData = { temp: '' };
    user = { id: 'undefined', username: 'Unknown User' }
  } else {
    const initData = new URLSearchParams(telegramInitData);
    const hash = initData.get('hash');
    initData.delete('hash');

    const sortedParams = Array.from(initData).sort((a, b) => a[0].localeCompare(b[0]));
    let dataCheckString = sortedParams.map(([key, value]) => `${key}=${value}`).join('\n');

    const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN!).digest();
    const calculatedHash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

    if (calculatedHash === hash) {
      validatedData = Object.fromEntries(sortedParams);
      const userString = validatedData['user'];
      if (userString) {
        try {
          user = JSON.parse(userString);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }

  return { validatedData, user };
}