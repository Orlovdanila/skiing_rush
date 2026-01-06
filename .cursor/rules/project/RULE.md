---
description: "Snow Rush 2026 — правила проекта для Cursor Agent"
alwaysApply: true
---

# Cursor Adapter

> Этот файл — адаптер для Cursor. Основные правила в `AGENTS.md`.

## Главное правило
**Следуй `@AGENTS.md`** — единственный источник правды.

## Быстрая справка

### Stack
- Phaser 3.80+, TypeScript 5.3+, Vite 5.x

### Проверка после изменений
1. `npx tsc --noEmit` — типы
2. `npm run build` — сборка

### Code Style
- ES Modules only (не CommonJS)
- Строгая типизация (без `any`)
- Константы в `UPPER_SNAKE_CASE`

### Phaser-специфика
- `PoolManager` для частых объектов
- Проверять `scene.isActive()` перед UI
- Уничтожать объекты в `shutdown()`

### AICODE-маркеры
Перед правкой: `grep -r "AICODE-" src/`
- `AICODE-NOTE:` — учесть контекст
- `AICODE-ASK:` — спросить пользователя

## Если видишь проблему с правилами
→ Предложи исправить `AGENTS.md` (не этот файл)
