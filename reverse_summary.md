# Snow Rush 2026 — реверс (веб-сборка)

## Стек и рантайм
- HTML5 экспорт Construct 3 (main.js + c3main.js, dispatchworker/jobworker, OffscreenCanvas/WebGL, vsync, landscape 1920×1080).
- PWA-манифест: fullscreen, icons/*, start_url index.html.

## Сцены и объекты (data.json)
- Layout’ы: Preloader (2770×2160, sheet "Preloader sheet 1"), основной "Snow Rush 2026" (main sheet).
- Behaviors: Bullet, Solid, Sin, ScrollTo; таймлайн "Timeline 1".
- Ключевые ассеты: trees-sheet*, present_puf*, snow_puf*, snow_vfx_rix*, sparkle_vfx*, magnet_vfx*, shield_vfx*, rix-sheet* (игрок/объекты).
- Аудио (webm/opus): Music_main, Music_pr, loose_music, skiis, click, hitHurt*, Go/1/2/3, Present_1-4, magnet, shield.

## Логика (наблюдения по структуре)
- Движение: постоянный скролл вниз, инерция по X через Bullet/Sin, ScrollTo на камере.
- Бустеры: Magnet (притяжение подарков, vfx + звук), Shield (защита/хиты, vfx + звук).
- Сбор/столкновения: подарки дают очки, препятствия (trees/rocks) завершают забег при отсутствии щита.
- Управление: встроенные Construct touch/keyboard хэндлеры (лево/право).

## HAR rixmas2026.har
- Все запросы на rixmas2026.playrix.com; скрипты: modernjscheck.js, supportcheck.js, main.js, c3main.js, dispatchworker.js, jobworker.js.
- Ассеты: webp-спрайты (shared, rix, trees, magnet/shield/snow vfx, presents), webm-аудио выше; иконки icons/icon-*.png.
- Аналитика/куки: сетевых вызовов GA/FB/Yandex нет, Set-Cookie отсутствуют.

## Кастомизация и TG Mini App
- Легко менять: спрайты (webp), аудио (webm), иконки/manifest; логика обфусцирована (Construct), правки через .c3p недоступны → лучше пересборка на Phaser/Pixi+TS.
- Убрать PWA/installs и любые cookie/consent (их нет); добавить аналитику через Telegram WebApp/Amplitude; лидерборд через TG CloudStorage/свой API; haptics через TG.
- Blueprint: сцены Boot/Menu/Game/GameOver; постоянный вертикальный вектор + плавный turn; спавнер секций сложности; бустеры Magnet/Shield; отсчёт 3-2-1-Go; бандл <1–1.5 МБ (webp+opus).
