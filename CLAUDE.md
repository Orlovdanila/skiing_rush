# Claude Code Adapter

> Этот файл — адаптер для Claude Code. Основные правила в `AGENTS.md`.

## Главное правило
**Следуй `AGENTS.md`** — это единственный источник правды для проекта.

## Перед началом задачи
1. **Открой `summary_plan.md`** — проверь раздел "Next Tasks" и "Заглушки в коде"
2. **Убедись что задача не реализована** — не создавай дубли
3. **После реализации** — обнови статус в summary_plan.md

## Проверка перед изменениями
```bash
grep -r "AICODE-" src/     # Найти маркеры
grep -r "TODO:" src/       # Найти заглушки
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
