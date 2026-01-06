# Создание коммита

Сообщение коммита: $ARGUMENTS

1. Проверь статус изменений: `git status`
2. Покажи diff изменений: `git diff --stat`
3. Запусти проверку типов: `npx tsc --noEmit`
4. Если проверка прошла успешно:
   - `git add .`
   - `git commit -m "$ARGUMENTS"`
5. Если есть ошибки типизации - сообщи и НЕ коммить

Формат сообщений: feat:, fix:, refactor:, chore:, docs:
