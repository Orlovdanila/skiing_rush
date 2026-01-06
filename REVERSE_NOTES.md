# Реверс "Santa Goes Skiing" — итоговые заметки

## Стек/движок
- Обфусцированный бандл `html5.js` (Haxe/OpenFL → JS, WebGL/Canvas).
- Вспомогательные скрипты: `tc_core.js` (cookie/query), `browserDetect.js`, `cookie.min.js` (GDPR), `social.js`, `dialog.js`, `loader.min.js`, `colourConversion.min.js`.

## Ассеты и скины
- Структура по темам: `assets/xmas_bootstrap`, `xmas_ui`, `xmas_ski`, `xmas_audio`.
- Bitmap-шрифты, UI-спрайты кнопок/иконок, спрайты препятствий/флагов/декора, аудио (music/sfx).
- Брендинг через CDN bucket + CSS vars; `manifest.json` для PWA.

## Контент и конфиги
- API `GET /api/game/content` — тексты меню/CTA/правила/URL бренда.
- JSON уровней: секции с `distance`, `playerSpeed.start/end`, включение ворот/обstacles/coins/decals; `obstacleSets` по сложностям.
- Туториал как первая секция без препятствий.

## Игровая логика
- Управление: тапы по сторонам / стрелки A/D, движение вниз с инерцией по X (дуги при смене направления).
- Комбо ворот (gate multiplier), пропуск сбрасывает комбо.
- Столкновение с препятствием — Game Over; сбор coins/presents — очки.
- Сцены: Boot/Preload → Menu → Game → GameOver/Leaderboard.

## Аналитика и cookie
- GA4 ID `G-GRTXHNVQRP`, параметры `instance_name=yourbrand`, `skin=xmas`.
- Consent: cookie `__ppcp` (e/s/t/a флаги); при разрешении обновляется GA4 и fbq.
- Client-id формата `{timestamp}.{random}` в cookie.

## Кастомизация/white-label
- Меняют skin ассетами и контентом API, иконки/названия через manifest.
- Шаринг/FB login опциональны (обёртки в `social.js`).

## Пригодность для Telegram Mini App
- Плюсы: тач-управление, статика, PWA, один canvas/UI-слой.
- Минусы: тяжёлый бандл (2+ MB), закрытый Haxe-код, нет TG auth.
- Адаптация: убрать cookie-бар/GA/Pixel, заменить шаринг на TG, авторизация и лидерборд через TG SDK/CloudStorage или свой бэкенд, haptics через Telegram API.

## Что взять для Snow Rush 2026
- Архитектура секций, конфиг уровня JSON, инерционное управление, объектные пулы, bitmap-шрифты.
- Улучшить: TypeScript + Phaser/Pixi, бандл <500 KB, явные бустеры с таймерами, дневные челленджи/ачивки, TG-нативная аналитика/лидерборд.
