Karem Jamal Birthday Website — Vercel + Telegram

FILES
- index.html: website structure
- style.css: cinematic black/purple responsive design
- script.js: countdown, animations, gift, sharing and greeting form
- api/send-wish.js: Vercel serverless function that sends greetings to Telegram
- README.txt: setup guide

SETUP TELEGRAM
1) Create a Telegram bot:
   - Open Telegram and talk to @BotFather.
   - Send /newbot and follow its instructions.
   - Keep the bot token private. Never put it in HTML, CSS, or browser JavaScript.

2) Find your chat ID:
   - Open your new bot in Telegram and press Start (send /start).
   - Privately open this URL in a browser, replacing YOUR_BOT_TOKEN with your real token:
     https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   - Find chat -> id in the response. Do not share the URL or screenshot if it contains your token.
   - If no updates appear, send /start to the bot and refresh.

3) Add secrets in Vercel:
   - Open https://vercel.com/dashboard and choose your website project.
   - Go to Settings -> Environment Variables.
   - Add TELEGRAM_BOT_TOKEN with the bot token as its value.
   - Add TELEGRAM_CHAT_ID with your chat ID as its value.
   - Select the environments you use (at least Production; Preview too if needed) and save.
   - Redeploy the project after adding/changing variables. Environment variables are only available to server-side functions; do not prefix them with NEXT_PUBLIC_ or VITE_.

4) Deploy this whole folder to your Vercel project, keeping the api folder at the project root:
   api/send-wish.js must be at the root-level api directory, beside index.html.
   Then test the greeting form on the published HTTPS website. Send /start to your bot first.

NOTES
- The form sends POST requests to /api/send-wish, which runs server-side on Vercel.
- This version does not require PHP or an extra Java server.
- If Vercel is connected to a Git repository, commit/push these updated files and wait for deployment; otherwise upload/deploy the project using your normal Vercel workflow.
- The displayed guestbook is still stored in each visitor's browser localStorage. Telegram receives each successful greeting, but to show the same messages to every visitor you would need a database.
- Public forms can receive spam. Add server-side rate limiting or CAPTCHA before sharing widely.
