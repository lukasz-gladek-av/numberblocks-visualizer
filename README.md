# Numberblocks Step Squad 3D Visualization

Interaktywna edukacyjna aplikacja 3D pokazująca "step squad" z Numberblocks - schody złożone z kolorowych klocków, gdzie dla liczby N wyświetlamy kolumny od 1 do N bloków.

## Funkcjonalności

### Core
- ✅ Wizualizacja 3D schodów (N kolumn, każda z N blokami)
- ✅ Przycisk + dodawania kolumn (max 20)
- ✅ Przycisk - odejmowania kolumn (min 1)
- ✅ Auto-zoom dostosowujący widok do liczby kolumn
- ✅ 3D rotacja myszką (OrbitControls)
- ✅ Liczby nad kolumnami pokazujące ilość bloków
- ✅ Wyświetlacz sumy bloków: N × (N+1) / 2
- ✅ Responsywny UI na mobile i desktop

### Kolory i Obramowanie (Phase 1 - 2026)
- ✅ Oficjalne kolory Numberblocks dla liczb 1-20
- ✅ Liczba 7: efekt tęczowy (7 różnych kolorów)
- ✅ Liczba 9: gradient szary (3 skupienia ciemności)
- ✅ Liczba 10: biały z czerwonym obramowaniem
- ✅ Liczba 20: piaskowy/apricot z pomarańczowym obramowaniem
- ✅ Liczby nastoletnie (11-19): rozłożenie na 10+jednostki z właściwymi kolorami
- ✅ Obramowanie krawędziowe (12 linii) wokół grup bloków tego samego koloru
- ✅ Obramowanie nie przenika przez bloki - czysty efekt wizualny

### Przyszłe (Phase 2)
- [ ] Twarze (oczy, usta) dla każdej liczby
- [ ] Akcesoria (okulary, kapelusze)
- [ ] Wyrażenia twarzy

## Struktura projektu

```
numberblock_step_squad/
├── index.html                  # Główny plik HTML
├── package.json                # Zależności (three.js, vite)
├── styles/
│   └── main.css               # Style UI i responsywność
├── js/
│   ├── main.js                # Entry point
│   ├── scene.js               # Three.js setup, kamera, renderer
│   ├── staircase.js           # Zarządzanie strukturą schodów
│   ├── blocks.js              # createBlock(), createColumn() - tworzenie z BorderFrame
│   ├── numberblockConfig.js   # Konfiguracja liczb 1-20 (Phase 1)
│   ├── colors.js              # Schemat kolorów (re-export config system)
│   ├── faces.js               # Placeholder dla twarzy (Phase 2)
│   └── controls.js            # UI interakcje i handlery
└── .gitignore                 # Ignorowane pliki
```

## Uruchamianie

### Pierwszy raz
```bash
npm install
npm run dev
```

### Następne sesje
```bash
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:5173/`

## Build do produkcji
```bash
npm run build
```

## Kolory Numberblocks (Oficjalne - Phase 1)

### Liczby 1-9 (Jednostki)
| Liczba | Kolor | Hex | Obramowanie |
|--------|-------|-----|-------------|
| 1 | Red | #FF2E3B | — |
| 2 | Orange | #FF8C00 | — |
| 3 | Yellow | #FFD700 | — |
| 4 | Green | #32CD32 | — |
| 5 | Cyan | #00BFFF | — |
| 6 | Indigo | #7B68EE | — |
| 7 | **Rainbow** | Red, Orange, Yellow, Green, Cyan, Indigo, Magenta | — |
| 8 | Magenta | #FF69B4 | — |
| 9 | **Grey Gradient** | Light → Medium → Dark | — |

### Liczby 10 i wyżej
| Liczba | Bloki | Obramowanie |
|--------|-------|-------------|
| 10 | White #FFFFFF | Red #FF2E3B (12 krawędzi) |
| 11-19 | 10 White + jednostki | Red border (część 10) |
| 20 | Apricot #FFCC99 | Orange #FF8C00 (12 krawędzi) |

### Notatka
Liczby nastoletnie (11-19) są rozkładane na komponenty:
- Dolna część: 10 bloków białych z czerwonym obramowaniem
- Górna część: Bloki odpowiadające cyfrze jednostek (np. 14 = 10 białych + 4 zielone)

## Implementacja - Kluczowe decyzje (Phase 1)

### 1. System Konfiguracji Oparty na Obiektach
`numberblockConfig.js` zawiera pełne definicje dla liczb 1-20:
```javascript
getNumberblockConfig(number) → {
  number,
  displayName: "Name",
  blocks: [ { color, borderColor, blockType }, ... ],
  face: { eyeCount, eyeShape, eyeColor, ... } // Phase 2
}
```

Każdy blok w konfiguracji ma:
- `color` (hex) - kolor bloku
- `borderColor` (hex | null) - kolor obramowania grupy (null = bez obramowania)
- `blockType` (string) - typ bloku ('one' dla jednotek, 'ten' dla dziesiątek)

### 2. Rozkład Liczb Nastoletnih (Place-Value Decomposition)
Liczby 11-19 są zbudowane przez konkatenację:
```javascript
// Przykład: 14 = Ten + Four
const tenBlocks = createSolidBlocks(10, WHITE, RED_BORDER);
const oneBlocks = getOneBlocksForNumber(4); // Green blocks
return { blocks: [...tenBlocks, ...oneBlocks] };
```

### 3. Obramowanie (Solidne Ściany)
Obramowanie tworzy się z cienkich brył z lekkim zaokrągleniem (RoundedBoxGeometry):
- Boki + góra/dół grupy (bez frontu/tyłu)
- Grubość ramki: 0.06, wsunięta do środka (nie wychodzi poza klocki)
- Bloki w grupie z obramowaniem są minimalnie pomniejszane (0.99)
- Cienie dla ramki są wyłączone, aby uniknąć artefaktów

### 4. Pozycjonowanie bloków
Wszystkie bloki są prawidłowo pozycjonowane na ziemi (y=0). Wysokość bloku wynosi 0.9 jednostki, z 0.01 jednostkami przerwy między blokami.

### 5. Auto-zoom
Funkcja `adjustCameraForColumns()` w `scene.js` dostosowuje pozycję kamery na podstawie liczby kolumn, aby zawsze wszystkie kolumny były widoczne.

## Możliwości rozszerzenia (todo)

- [ ] Animacje dodawania/usuwania kolumn (GSAP)
- [ ] Dźwięki przy kliknięciu
- [ ] Tryb demonstracyjny pokazujący wzór (1+2+3+...=suma)
- [ ] Export do PNG
- [ ] Różne układy (kwadrat, trójkąt)
- [ ] Ciemny motyw
- [ ] Różne poziomy trudności/zakresy liczb

## Git history

```
c7231f1 - Refactor columns to object-based config system with border support
7591296 - Initial implementation: Numberblocks Step Squad 3D Visualization
```

### Ostatnia refaktoryzacja (c7231f1 - 2026-01-17)
Refaktoryzacja Phase 1 - System konfiguracji i obramowanie krawędziowe:
- Nowy system: `numberblockConfig.js` z pełnymi definicjami liczb 1-20
- Obsługa specjalnych liczb: 7 (rainbow), 9 (grey gradient), 10 (white+red), 20 (apricot+orange)
- Rozkład liczb nastoletnih: 11-19 = 10 + jednostki
- Obramowanie zmienione na solidne ściany z RoundedBoxGeometry (boki + góra/dół)
- Pliki dodane: `numberblockConfig.js`, `faces.js` (placeholder Phase 2)

## Testy

### Phase 1 - Kolory i Obramowanie (c7231f1)
- ✅ Liczba 1: Red (#FF2E3B)
- ✅ Liczba 7: Rainbow - 7 różnych kolorów (Red, Orange, Yellow, Green, Cyan, Indigo, Magenta)
- ✅ Liczba 9: Grey Gradient - 3 skupienia (3 light, 3 medium, 3 dark)
- ✅ Liczba 10: White (#FFFFFF) z czerwonym obramowaniem (12 krawędzi)
- ✅ Liczba 14: 10 białych + 4 zielone (rozkład place-value)
- ✅ Liczba 20: Apricot (#FFCC99) z pomarańczowym obramowaniem
- ✅ Obramowanie jest pełne, nie wychodzi poza klocki i nie migocze
- ✅ Początko stan: 5 kolumn, 15 bloków
- ✅ Przycisk +: dodaje kolumny do maksimum 20 (210 bloków)
- ✅ Przycisk -: usuwa kolumny do minimum 1 (1 blok)
- ✅ Auto-zoom: prawidłowo dostosowuje widok
- ✅ 3D rotacja: płynne obroty myszką
- ✅ Etykiety: bez duplikatów
- ✅ Pozycjonowanie: bloki na ziemi, nie zagłębiające się

## Kontakt / Uwagi

Projekt wykonany z Three.js i Vite. Patrz komentarze w kodzie źródłowym.
