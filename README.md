# Numberblocks Step Squad 3D Visualization

Interaktywna edukacyjna aplikacja 3D pokazująca "step squad" z Numberblocks - schody złożone z kolorowych klocków, gdzie dla liczby N wyświetlamy kolumny od 1 do N bloków.

## Funkcjonalności

- ✅ Wizualizacja 3D schodów (N kolumn, każda z N blokami)
- ✅ Oficjalne kolory Numberblocks (1-10 z cyklem)
- ✅ Efekt tęczowy na kolumnie 7 i jej wielokrotnościach (17, 27...)
- ✅ Przycisk + dodawania kolumn (max 20)
- ✅ Przycisk - odejmowania kolumn (min 1)
- ✅ Auto-zoom dostosowujący widok do liczby kolumn
- ✅ 3D rotacja myszką (OrbitControls)
- ✅ Liczby nad kolumnami pokazujące ilość bloków
- ✅ Wyświetlacz sumy bloków: N × (N+1) / 2
- ✅ Responsywny UI na mobile i desktop

## Struktura projektu

```
numberblock_step_squad/
├── index.html              # Główny plik HTML
├── package.json            # Zależności (three.js, vite)
├── styles/
│   └── main.css           # Style UI i responsywność
├── js/
│   ├── main.js            # Entry point
│   ├── scene.js           # Three.js setup, kamera, renderer
│   ├── staircase.js       # Klasa Staircase, zarządzanie strukturą
│   ├── blocks.js          # Tworzenie bloków i kolumn
│   ├── colors.js          # Schemat kolorów Numberblocks
│   └── controls.js        # UI interakcje i handlery
└── .gitignore            # Ignorowane pliki
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

## Kolory Numberblocks

| Kolumna | Kolor | Hex |
|---------|-------|-----|
| 1 | Red | #de151d |
| 2 | Orange | #e89223 |
| 3 | Yellow | #e6c40c |
| 4 | Green | #38b500 |
| 5 | Cyan | #23b0db |
| 6 | Indigo | #4B0082 |
| 7 | Rainbow | Mix (Red, Orange, Yellow, Green, Blue, Indigo, Violet) |
| 8 | Magenta | #FF1493 |
| 9 | Grey | #808080 |
| 10 | White | #FFFFFF |

Wzór powtarza się co 10 kolumn (kolumna 11 = red, kolumna 17 = rainbow, itd.)

## Implementacja - Kluczowe decyzje

### 1. Pozycjonowanie bloków
Wszystkie bloki są prawidłowo pozycjonowane na ziemi (y=0). Wysokość bloku wynosi 0.9 jednostki, z 0.05 jednostkami przerwy między blokami.

### 2. Efekt tęczowy
Kolumna 7 i jej wielokrotności mają efekt tęczowy - każdy blok w kolumnie otrzymuje inny kolor z tablicy RAINBOW_COLORS.

### 3. Auto-zoom
Funkcja `adjustCameraForColumns()` w `scene.js` dostosowuje pozycję kamery na podstawie liczby kolumn, aby zawsze wszystkie kolumny były widoczne.

### 4. Czyszczenie etykiet
Podczas przebudowy schodów całkowicie czyścimy labelGroup używając while loop zamiast forEach, aby uniknąć duplikatów.

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
7591296 - Initial implementation: Numberblocks Step Squad 3D Visualization
```

Wszystkie pliki są gotowe do kontynuowania pracy!

## Testy

Aplikacja została przetestowana:
- ✅ Początkowy stan: 5 kolumn, 15 bloków
- ✅ Przycisk +: dodaje kolumny do maksimum 20 (210 bloków)
- ✅ Przycisk -: usuwa kolumny do minimum 1 (1 blok)
- ✅ Kolumna 7: efekt tęczowy
- ✅ Kolumna 10: biały kolor
- ✅ Auto-zoom: prawidłowo dostosowuje widok
- ✅ 3D rotacja: płynne obroty myszką
- ✅ Etykiety: bez duplikatów
- ✅ Pozycjonowanie: bloki na ziemi, nie zagłębiające się

## Kontakt / Uwagi

Projekt wykonany z Three.js i Vite. Patrz komentarze w kodzie źródłowym.
