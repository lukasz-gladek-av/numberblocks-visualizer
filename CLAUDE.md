# CLAUDE.md - Mapa Aplikacji i Referencja

Dokument pomocniczy zawierający informacje o strukturze aplikacji, selektorach i kluczowych funkcjach dla Claude'a.

## 📍 Struktura HTML i Selektory UI

**Plik:** `index.html`

```html
<canvas id="threejs-canvas"></canvas>
<div class="container">
  <div id="total-display" class="total-display">5 kolumn: 15 klocków</div>
  <div class="controls">
    <button id="btn-plus" class="btn btn-plus" aria-label="Dodaj kolumnę">+</button>
    <button id="btn-minus" class="btn btn-minus" aria-label="Usuń kolumnę">−</button>
  </div>
</div>
```

### Kluczowe Selektory
- `#threejs-canvas` - Główna scena 3D (Three.js renderer)
- `#total-display` - Wyświetlacz suma: "X kolumn: Y klocków"
- `#btn-plus` (`.btn-plus`) - Przycisk dodaj kolumnę
- `#btn-minus` (`.btn-minus`) - Przycisk usuń kolumnę
- `.controls` - Kontener przycisków

## 📁 Struktura Plików JS

### Core Aplikacji
- **main.js** - Entry point, inicjalizuje aplikację
- **scene.js** - Three.js setup (scena, kamera, renderer, oświetlenie)
- **staircase.js** - Klasa `Staircase`, zarządzanie strukturą kolumn
- **controls.js** - Obsługa zdarzeń UI (klik +/-)

### System Kolumn (Phase 1)
- **numberblockConfig.js** - Konfiguracja dla liczb 1-20
  - `getNumberblockConfig(number)` → `{ number, displayName, blocks[], face }`
  - `getOneBlocksForNumber(digit)` → bloki dla jednostek
  - `decomposeNumber(number)` → `{ tens, ones }`
  - Eksportuje: `NUMBERBLOCK_COLORS`, `NUMBERBLOCK_BORDER_COLORS`

- **blocks.js** - Tworzenie bloków i kolumn
  - `createBlock(color)` → `THREE.Mesh` - pojedynczy blok z zaokrąglonymi krawędziami
  - `createColumn(columnNumber, positionX)` → `THREE.Group` - kolumna z obramowaniem
    - Grupuje kolejne bloki o tym samym kolorze i borderColor
    - Tworzy obramowanie (LineSegments) wokół grup
    - Obramowanie: 12 krawędzi (4 dno + 4 góra + 4 pionowe)

- **colors.js** - System kolorów
  - Re-eksportuje `getNumberblockConfig` z `numberblockConfig.js`
  - Utrzymuje backward compatibility

### Placeholder Phase 2
- **faces.js** - Placeholder dla twarzy (oczy, usta, akcesoria)
  - `createEyes(faceConfig)` - TODO
  - `createMouth(faceConfig)` - TODO
  - `addFaceToColumn(column, faceConfig)` - TODO
  - `getFaceConfigForNumber(number)` - Helper

## 🎨 System Kolorów (Phase 1)

### Definicje w `numberblockConfig.js`

```javascript
const COLORS = {
  RED: 0xFF2E3B,           // 1
  ORANGE: 0xFF8C00,        // 2
  YELLOW: 0xFFD700,        // 3
  GREEN: 0x32CD32,         // 4
  CYAN: 0x00BFFF,          // 5
  INDIGO: 0x7B68EE,        // 6
  MAGENTA: 0xFF69B4,       // 8
  GREY_LIGHT: 0xD3D3D3,    // 9
  GREY_MEDIUM: 0xA9A9A9,   // 9
  GREY_DARK: 0x808080,     // 9
  WHITE: 0xFFFFFF,         // 10, teens
  APRICOT: 0xFFCC99,       // 20
};

const BORDER_COLORS = {
  RED: 0xFF2E3B,           // 10 i teens
  ORANGE: 0xFF8C00,        // 20
};
```

### Liczby Specjalne

#### Number 7 (Rainbow)
```javascript
case 7:
  return {
    blocks: [
      RED, ORANGE, YELLOW, GREEN, CYAN, INDIGO, MAGENTA
    ]
  };
```
Każdy blok ma inny kolor.

#### Number 9 (Grey Gradient)
```javascript
case 9:
  return {
    blocks: [
      GREY_LIGHT (3x), GREY_MEDIUM (3x), GREY_DARK (3x)
    ]
  };
```
Grupowane po 3 bloki jednej odcieni.

#### Number 10 (White + Red Border)
```javascript
case 10:
  return {
    blocks: createSolidBlocks(10, COLORS.WHITE, BORDER_COLORS.RED)
  };
```
10 białych bloków z czerwonym obramowaniem na wszystkich.

#### Numbers 11-19 (Teens - Place-Value)
```javascript
if (number >= 11 && number <= 19) {
  const ones = number - 10;
  const tenBlocks = createSolidBlocks(10, COLORS.WHITE, BORDER_COLORS.RED);
  const oneBlocks = getOneBlocksForNumber(ones);
  return {
    blocks: [...tenBlocks, ...oneBlocks]
  };
}
// Przykład: 14 = [10 białych z red border] + [4 zielone]
```

#### Number 20 (Apricot + Orange Border)
```javascript
case 20:
  return {
    blocks: createSolidBlocks(20, COLORS.APRICOT, BORDER_COLORS.ORANGE)
  };
```
20 bloków piaskowych/apricot z pomarańczowym obramowaniem.

## 🎬 Kluczowe Funkcje

### `createColumn(columnNumber, positionX)`
Źródło: `js/blocks.js`

```javascript
createColumn(columnNumber, positionX = 0) → THREE.Group
```

**Proces:**
1. Pobiera konfigurację z `getNumberblockConfig(columnNumber)`
2. Iteruje przez `config.blocks[]`
3. Tworzy każdy blok za pomocą `createBlock(color)`
4. Grupuje kolejne bloki o tym samym `color` i `borderColor`
5. Dla grup z `borderColor`: tworzy obramowanie (12 krawędzi LineSegments)
6. Pozycjonuje kolumnę na x = `positionX`

**Obramowanie (LineSegments):**
- 4 krawędzie na dnie grupy bloków
- 4 krawędzie na górze grupy bloków
- 4 krawędzie pionowe (łączące dno i górę)
- Brak przechodzenia przez bloki - czysty efekt wizualny

### `adjustCameraForColumns(columnCount)`
Źródło: `js/scene.js`

Auto-zoom kamery dostosowujący widok do liczby kolumn.

### Event Listeners
Źródło: `js/controls.js`

```javascript
#btn-plus.click() → staircase.addColumn()
#btn-minus.click() → staircase.removeColumn()
```

## 🔄 Interakcja z Aplikacją

### Poruszanie się
- **Obracanie:** Przeciąg myszą na canvas
- **Zoom:** Scroll na canvas
- **Dodaj kolumnę:** Klik na `#btn-plus` (limit max 20)
- **Usuń kolumnę:** Klik na `#btn-minus` (limit min 1)

### Wyświetlane Informacje
- Liczby nad kolumnami (1, 2, 3, ... N)
- Suma bloków w `#total-display`: "N kolumn: M klocków"
- Formula: M = N × (N + 1) / 2

## 📊 Dane Kolumn (Config Object)

Każda liczba ma konfigurację:

```javascript
{
  number: 14,
  displayName: "Fourteen",
  blocks: [
    { color: 0xFFFFFF, borderColor: 0xFF2E3B, blockType: 'ten' },
    // ... 10 białych bloków
    { color: 0x32CD32, borderColor: null, blockType: 'one' },
    // ... 4 zielone bloki
  ],
  face: {
    eyeCount: 2,
    eyeShape: 'oval',
    eyeColor: 0x000000,
    mouthType: 'smile',
    accessories: []
  } // Phase 2
}
```

## 🎯 Phase 2 - Twarze (Placeholder)

Plik: `js/faces.js`

**Planowana implementacja:**
- Oczy: Ovals lub squares (zależnie od liczby)
- Usta: Uśmiech lub neutralne
- Pozycjonowanie: Na przedniej ściance górnego bloku kolumny
- Technologia: 2D sprites (rekomendacja)

**Liczby specjalne:**
- 1, 11: jedno oko
- 4, 9, 16: oczy kwadratowe
- Pozostałe: dwa oczy owalneOtherwise: two oval eyes

## 📝 Uwagi Programistyczne

### Block Properties
- **blockSize:** 0.9 jednostek
- **gap:** 0.01 jednostek (między blokami)
- **frameThickness:** (LineSegments, zależy od renderowania)

### Material
Bloki: `THREE.MeshStandardMaterial`
- `roughness: 0.18`
- `metalness: 0.03`
- `emissive: color` (subtelny efekt)
- `emissiveIntensity: 0.08`

### Camera
- **FOV:** 55°
- **Domyślna pozycja:** (0, 4.5, 15)
- **Target:** (0, 4.5, 0)
- **Min distance:** 5, Max distance: 50

## 🐛 Debug Tips

### Sprawdzenie Konfiguracji
```javascript
getNumberblockConfig(10)
// → { number: 10, blocks: [...], face: {...} }
```

### Sprawdzenie Kolorów
```javascript
getNumberblockConfig(14).blocks
// → [WHITE, WHITE, ..., GREEN, GREEN, GREEN, GREEN]
```

### Console Logs
Kolumny logują konfig podczas tworzenia w `createColumn()`.

## 🔗 Powiązane Dokumenty

- `README.md` - Dokumentacja główna
- `.claude/plans/...` - Plan refaktoryzacji Phase 1
- Git: commit `c7231f1` - Refaktoryzacja kolumn

---

**Ostatnia aktualizacja:** 2026-01-17 (Phase 1 complete)
**Status:** Phase 1 (Kolory i Obramowanie) ✅ | Phase 2 (Twarze) 📋
