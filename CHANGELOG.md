# Changelog

Лог изменений проекта. Ведётся AI и разработчиками для отслеживания и возможного отката.

---

## 2025-01-08

### Классический паттерн камеры (v3)

**Задача:** Реализовать классический паттерн камеры как в референсе:
- Карта шире экрана (~2x)
- Deadzone в центре (~25%)
- Камера следует за игроком
- Край карты = край экрана → камера останавливается

**Изменения:**

1. **gameConfig.ts** - новые параметры камеры:
   ```typescript
   initialZoom: 1.0,           // Без зума
   gameZoom: 1.0,
   deadzoneRatio: 0.125,       // 25% центр
   fieldWidthMultiplier: 2.0   // Карта = 2x экрана
   ```

2. **GameScene.ts**:
   - `calculateGameWidth()` - карта = screenWidth * 2
   - `initializeCameraX()` / `updateCameraX()` - границы 0 до gameWidth
   - Игрок спавнится в центре карты (gameWidth / 2)

3. **Player.ts** - границы карты от 0 до gameWidth

4. **SpawnManager.ts** - laneToX() без смещения (карта с 0)

**Файлы:**
- `src/config/gameConfig.ts`
- `src/scenes/GameScene.ts`
- `src/entities/Player.ts`
- `src/managers/SpawnManager.ts`

---

### Камера и границы игрока (v2 - финальное исправление)

**Проблема:** При `visibleWidth > gameWidth` возникало невалидное состояние `minScrollX > maxScrollX`, из-за чего игрок уезжал за левую границу экрана.

**Решение:**

1. **GameScene.ts** (initializeCameraX, updateCameraX):
   - Когда камера видит всё поле (`visibleWidth >= gameWidth`) → фиксируем `scrollX = 0`
   - Добавлена защита: если `minScrollX > maxScrollX` → сбрасываем к 0
   ```typescript
   if (visibleWidth >= this.gameWidth) {
     minScrollX = maxScrollX = 0;  // Было: centerScrollX (некорректное значение)
   }
   if (minScrollX > maxScrollX) {
     minScrollX = maxScrollX = 0;  // Safety fallback
   }
   ```

2. **Player.ts** (строки 65-91):
   - Границы игрока = пересечение ВИДИМОЙ области камеры И игрового поля
   ```typescript
   const minX = Math.max(screenLeft + margin, fieldLeft + margin);
   const maxX = Math.min(screenRight - margin, fieldRight - margin);
   ```

**Файлы:**
- `src/scenes/GameScene.ts`
- `src/entities/Player.ts`

---

### Камера и границы игрока (v1 - частичное)

**Проблемы:**
- Игрок смещен влево на старте
- Камера не следует влево (застревала на стартовой позиции)
- Можно было ехать бесконечно вправо за пределы дорожек

**Изменения:**

1. **Player.ts** (строки 65-81):
   - Границы игрока привязаны к `gameWidth` (игровому полю), а не к ширине экрана
   - Добавлен bounce-эффект при ударе о границу (отражение угла с damping 0.7)
   ```typescript
   const fieldLeft = (this.scene.scale.width - gameScene.gameWidth) / 2;
   const fieldRight = fieldLeft + gameScene.gameWidth;
   // + bounce logic
   ```

2. **GameScene.ts** (initializeCameraX, updateCameraX):
   - Исправлена логика границ камеры
   - Если `visibleWidth >= gameWidth` → камера центрирована на поле
   - Если `visibleWidth < gameWidth` → камера может двигаться от `fieldLeft` до `fieldRight - visibleWidth`
   ```typescript
   if (visibleWidth >= this.gameWidth) {
     const centerScrollX = fieldLeft - (visibleWidth - this.gameWidth) / 2;
     minScrollX = maxScrollX = centerScrollX;
   } else {
     minScrollX = fieldLeft;
     maxScrollX = fieldRight - visibleWidth;
   }
   ```

**Файлы:**
- `src/entities/Player.ts`
- `src/scenes/GameScene.ts`

---

## Формат записи

```markdown
## YYYY-MM-DD

### Краткое название изменения

**Проблема:** Что было не так
**Решение:** Что сделано
**Файлы:** Список изменённых файлов

При необходимости - код до/после для отката.
```
