# Snow Rush 2026 - Project Guidelines

> **Единый источник правды** для всех AI-агентов (Cursor, Claude Code) и разработчиков.

---

## Перед началом любой задачи

**ОБЯЗАТЕЛЬНО** выполни эти шаги перед реализацией:

### 1. Сверься с планом
```bash
# Открой summary_plan.md и проверь:
# - Раздел "Статус реализации" — что уже сделано
# - Раздел "Next Tasks" — приоритетные задачи
# - Раздел "Заглушки в коде" — где стоят TODO
```

### 2. Проверь маркеры в коде
```bash
grep -r "AICODE-" src/     # Контекст и вопросы
grep -r "TODO:" src/       # Заглушки
grep -r "FIXME:" src/      # Известные баги
```

### 3. Убедись что задача не реализована
- Проверь существующие файлы (не создавай дубли)
- Проверь импорты (может уже есть нужный класс)

### 4. После реализации
```bash
npx tsc --noEmit           # Проверка типов
npm run build              # Проверка сборки
```

→ **Обнови `summary_plan.md`**: отметь задачу как ✅ DONE

---

## Stack
- Phaser 3.80+ (game engine)
- TypeScript 5.3+
- Vite 5.x (bundler)
- Node.js backend с rate limiting

## Команды
```bash
npm run dev      # Запуск dev-сервера (http://localhost:5173)
npm run build    # Сборка проекта (tsc + vite build)
npm run preview  # Превью билда
npx tsc --noEmit # Проверка типов без сборки
```

## Структура проекта
```
src/
├── scenes/     # Phaser сцены (Boot, Menu, Game, GameOver)
├── entities/   # Игровые объекты (Player, Gift, Obstacle, Booster)
├── managers/   # Менеджеры (Audio, Input, Pool, Score, Spawn, Booster)
├── ui/         # UI компоненты (HUD, Countdown)
├── config/     # Конфигурация игры и сложности
└── api/        # API клиент (leaderboard, anticheat)
server/         # Бэкенд (Express + SQLite)
public/assets/  # Статика (sprites, audio, icons)
```

## Code Style

### Обязательно
- ES Modules (`import/export`), НЕ CommonJS
- Деструктуризация: `import { Scene } from 'phaser'`
- Строгая типизация, избегать `any`
- Классы для entities и managers
- Константы в `UPPER_SNAKE_CASE`

### ❌ НЕ делай
- `require()` — только `import`
- Глобальные переменные
- Мутировать конфиги напрямую — используй spread/копирование
- Забывать уничтожать Phaser объекты в `shutdown()`

### ✅ Делай
- `PoolManager` для часто создаваемых объектов (подарки, препятствия)
- Проверяй `this.scene.isActive()` перед обновлением UI
- Arrow functions для callbacks с `this`
- Проверяй типы через `npx tsc --noEmit` после изменений

## Проверка работы

**ВАЖНО:** После изменений ВСЕГДА выполняй:
1. `npx tsc --noEmit` — проверка типов
2. `npm run build` — проверка сборки

## Git Workflow
- Коммиты на английском: `feat:`, `fix:`, `refactor:`, `chore:`
- PR с описанием что изменено и почему

---

## AICODE-маркеры

Долговременная память в коде для AI и разработчиков.

### `AICODE-NOTE:` — контекст для будущих изменений
```typescript
// AICODE-NOTE: Скорость нельзя > 15, иначе игрок проваливается сквозь препятствия
private readonly MAX_SPEED = 15;
```

### `AICODE-ASK:` — вопрос, требующий уточнения
```typescript
// AICODE-ASK: Нужен ли звук при подборе бустера?
this.collectBooster(booster);
```

### Правила работы
1. **Перед правкой** — `grep -r "AICODE-" src/`
2. **ASK** — спросить, обновить/удалить после ответа
3. **NOTE** — учесть контекст, обновить если устарел

| Маркер | Когда добавлять |
|--------|----------------|
| NOTE | Workaround, особенность Phaser, магические числа |
| ASK | Несколько вариантов, нужно подтверждение |

---

## Источники информации

| Файл | Содержимое |
|------|------------|
| `AGENTS.md` | Правила разработки (этот файл) |
| `summary_plan.md` | План, статус, Next Tasks, заглушки |
| `src/config/gameConfig.ts` | Константы игры |
| `src/config/difficultyConfig.ts` | Настройки сложности |

---

## Мета-правило

Если правила в этом файле:
- Противоречат друг другу
- Устарели
- Можно улучшить

→ **ОБЯЗАТЕЛЬНО** предложи исправление.
