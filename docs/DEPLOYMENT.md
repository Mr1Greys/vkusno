# Деплой на Vercel (из GitHub)

Целевой репозиторий: `https://github.com/Mr1Greys/vkusno.git`

## Первый пуш в GitHub

Если проект ещё не привязан к этому remote:

```bash
git init   # если репозиторий ещё не инициализирован
git remote add origin https://github.com/Mr1Greys/vkusno.git
git add .
git commit -m "Initial commit: PWA, Vercel-ready"
git branch -M main
git push -u origin main
```

(Создайте пустой репозиторий `vkusno` на GitHub без README, если нужен чистый первый пуш.)

## Локально перед пушем

1. Установить зависимости: `npm install`
2. Сгенерировать PWA-иконки с логотипа: `npm run icons:pwa`  
   (берётся `public/images/logos/выпечкаиточка.png` или `logo.png`)
3. Проверить сборку: `npm run build`

Сгенерированные `public/icons/*.png` и `public/favicon-32x32.png` нужно закоммитить — так иконки «на рабочий стол» попадут в прод без повторной генерации на Vercel.

`.env` не коммитится (см. `.gitignore`). Для продакшена переменные задаются в Vercel.

## Подключение Vercel → GitHub

1. [Vercel Dashboard](https://vercel.com) → Add New → Project → Import репозитория `Mr1Greys/vkusno`.
2. **Root directory** — корень репозитория (где `package.json`).
3. **Build Command:** `npm run build` (по умолчанию).  
   **Install Command:** `npm install` (`postinstall` выполнит `prisma generate`).
4. **Environment Variables** — добавить для Production (и при необходимости Preview):

   | Переменная | Описание |
   |------------|----------|
   | `DATABASE_URL` | Строка PostgreSQL (Vercel Postgres, Neon, Supabase и т.д.) |
   | `JWT_SECRET` | Случайная строка ≥ 32 символов |
   | `NEXT_PUBLIC_APP_URL` | Публичный URL сайта, например `https://ваш-проект.vercel.app` |
   | `ADMIN_INIT_KEY` | Секрет для первичной настройки админки (если используется) |

5. Deploy. После сборки `next-pwa` создаст в `public/` файлы `sw.js` и `workbox-*.js` — их не нужно коммитить (в `.gitignore`).

## Домен

В проекте Vercel → **Settings → Domains**: бесплатный поддомен `*.vercel.app` включается автоматически. Свой домен — привязка DNS по инструкции Vercel.

## PWA «на рабочий стол»

После деплоя по HTTPS установка доступна из меню браузера (Chrome / Safari). Иконки задаются в `public/manifest.json` и в `app/layout.tsx`; перегенерация: `npm run icons:pwa`.
