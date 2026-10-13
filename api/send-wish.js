export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const reply = (status, body) => res.status(status).json(body);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(405, { success: false, error: 'طريقة الطلب غير مدعومة.' });
  }

  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return reply(400, { success: false, error: 'البيانات المرسلة غير صحيحة.' });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const nameLength = Array.from(name).length;
  const messageLength = Array.from(message).length;

  if (nameLength < 2 || nameLength > 40) {
    return reply(422, { success: false, error: 'الاسم لازم يكون من 2 إلى 40 حرفًا.' });
  }
  if (messageLength < 2 || messageLength > 240) {
    return reply(422, { success: false, error: 'الرسالة لازم تكون من 2 إلى 240 حرفًا.' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('Birthday guestbook: Telegram environment variables are missing.');
    return reply(500, { success: false, error: 'إعدادات تيليجرام لسه مش مكتملة على Vercel.' });
  }

  const escapeHtml = (value) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const safeName = escapeHtml(name);
  const safeMessage = escapeHtml(message);
  const sentAt = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
  const text = `🎂 <b>تهنئة جديدة لعيد ميلاد Karem Jamal</b>\n\n` +
    `👤 <b>الاسم:</b> ${safeName}\n` +
    `💌 <b>التهنئة:</b>\n${safeMessage}\n\n` +
    `🕒 <b>وقت الإرسال:</b> ${sentAt}`;

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(12000)
    });

    const telegramResult = await telegramResponse.json().catch(() => null);
    if (!telegramResponse.ok || !telegramResult || !telegramResult.ok) {
      console.error('Telegram API rejected the greeting. HTTP status:', telegramResponse.status);
      return reply(502, { success: false, error: 'تيليجرام ما استلمش الرسالة. تأكد من إعدادات البوت وحاول تاني.' });
    }

    return reply(200, { success: true });
  } catch (error) {
    console.error('Birthday guestbook Telegram request failed:', error?.name || 'UnknownError');
    return reply(502, { success: false, error: 'تعذر الاتصال بتيليجرام. جرّب تاني بعد شوية.' });
  }
}
