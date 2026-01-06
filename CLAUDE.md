# Claude Code Adapter

> Этот файл — адаптер для Claude Code. Основные правила в `AGENTS.md`.

## Главное правило
**Следуй `AGENTS.md`** — это единственный источник правды для проекта.

## Проверка перед изменениями
```bash
grep -r "AICODE-" src/     # Найти маркеры
npx tsc --noEmit           # Проверить типы
npm run build              # Проверить сборку
```

## Slash-команды проекта
- `/project:check` — полная проверка (tsc + build)
- `/project:fix-types` — автоисправление ошибок типизации
- `/project:commit <msg>` — проверка + коммит
- `/project:plan <задача>` — режим планирования
- `/project:review <файл>` — code review
- `/project:aicode` — поиск AICODE-маркеров
- `/project:add-error <desc>` — добавить ошибку в AGENTS.md

## Разрешённые команды
Настроены в `.claude/settings.json`:
- Edit, npm/tsc/vitest, git операции, базовый bash

## Если видишь проблему с правилами
→ Предложи исправить `AGENTS.md` (не этот файл)
