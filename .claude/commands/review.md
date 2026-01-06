# Code Review

Файл или PR: $ARGUMENTS

Проведи code review:

1. Проверь:
   - Соответствие code style из CLAUDE.md
   - Корректность типизации
   - Потенциальные баги
   - Performance issues (особенно в update loops)
   - Memory leaks (неуничтоженные объекты Phaser)

2. Для каждой проблемы укажи:
   - Файл и строку
   - В чём проблема
   - Как исправить

3. Выведи итог:
   - ✅ Approved - если всё хорошо
   - ⚠️ Needs changes - если есть замечания
   - ❌ Rejected - если критические проблемы
