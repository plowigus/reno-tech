# Renotech - Nowoczesna Strona Serwisu Renault

Projekt to nowoczesna strona internetowa dla serwisu specjalizującego się w elektronice samochodowej marek Renault i Dacia. Strona została zaprojektowana z myślą o płynnych animacjach, ciemnej estetyce (dark mode) i wysokiej responsywności.

## 🚀 Przegląd Projektu

Strona główna składa się z kilku kluczowych sekcji, które prowadzą użytkownika przez ofertę serwisu. Wykorzystuje zaawansowane techniki animacji scrollowania (scroll-driven animations) aby zbudować angażujące doświadczenie użytkownika.

## 📂 Główne Sekcje

### 1. Hero
Sekcja powitalna z dynamicznym tłem i głównym hasłem. Odpowiada za pierwsze wrażenie i szybkie przekierowanie do oferty lub kontaktu.

### 2. Services (Usługi)
Centralna część strony prezentująca ofertę. Wykorzystuje mechanizm **pinned scroll** (przypięcia podczas przewijania).
- **Lista Usług**: Karty usług przesuwają się pionowo (scroll list), podczas gdy sekcja "Dlaczego my" pozostaje przypięta po lewej stronie.
- **Interakcje**:
    - **Snap**: Lista usług automatycznie "przyciąga" się do najbliższego elementu po zatrzymaniu przewijania.
    - **Bounce**: Delikatny efekt odbicia przy pozycjonowaniu elementów.
    - **Layout**: Zoptymalizowany, aby mieścić 3 usługi w widoku, zapewniając szybki przegląd oferty.

### 3. Shop (Sklep)
W pełni funkcjonalna sekcja e-commerce prezentująca asortyment produktów.

- **Strona Główna Sklepu**: Siatka produktów z nowoczesnymi kartami (zdjęcia, ceny, nazwy).
- **Strona Produktu**: Szczegółowy widok pojedynczego produktu z zaawansowanym layoutem:
    - **Galeria "Sticky"**: Zdjęcie produktu pozostaje widoczne podczas przewijania opisu.
    - **Wybór Wariantu**: Interaktywny selektor rozmiarów dla odzieży (S-XXL) oraz automatyczne wykrywanie rozmiaru uniwersalnego dla akcesoriów.
    - **Optymalizacja**: Zdjęcia w formacie kwadratu (1:1) dla lepszej prezentacji na różnych urządzeniach.

### 4. Nawigacja i Layout
Zmodernizowany interfejs użytkownika zapewniający intuicyjną obsługę:

- **Globalny Navbar**: Pasek nawigacji dostępny na każdej podstronie.
- **Glassmorphism**: Stylistyka półprzezroczystego szkła (backdrop-blur) nadająca nowoczesny i lekki wygląd.
- **Pozycjonowanie Absolute**: Navbar nakłada się na sekcję Hero, ale nie podąża za użytkownikiem podczas przewijania (absolute positioning), co pozwala skupić się na treści.
- **Hero Section**: Idealnie wycentrowane treści powitalne z animacjami Matrix i interaktywnym logo.

## 💬 System Czatu (V2)

W pełni funkcjonalny, nowoczesny system wiadomości czasu rzeczywistego, zaprojektowany z myślą o estetyce i wydajności (Instagram-like).

### Kluczowe Funkcje
-   **Real-time Messaging**: Natychmiastowe przesyłanie wiadomości dzięki integracji z [Pusher](https://pusher.com/).
-   **Instagram Aesthetic**:
    -   Zaokrąglone dymki wiadomości (`rounded-2xl`) z łączeniem rogów dla sekwencji wiadomości od tego samego nadawcy.
    -   Ciemny motyw: Nadawca (`bg-red-700`), Odbiorca (`bg-zinc-800`).
    -   Avatary wyświetlane tylko przy ostatniej wiadomości w sekwencji (odbiorca).
-   **Stabilność UX**:
    -   **Zero Layout Shift**: Wyeliminowano "skakanie" okna przy wysyłaniu (usunięcie server-side revalidation).
    -   **Smooth Navigation**: Przełączanie rozmów bez przewijania strony głównej (`scroll: false`).
    -   **Safe Auto-Scroll**: Inteligentne przewijanie do najnowszej wiadomości bez naruszania pozycji całej strony (`scrollTop` on container).
-   **Funkcjonalności**:
    -   Lista znajomych i konwersacji w bocznym panelu.
    -   Statusy dostępności (online/offline).
    -   Obsługa emoji (Apple style picker).
    -   De-duplikacja wiadomości (ochrona przed podwójnym renderowaniem przy szybkim internecie).

## 🛠️ Stack Technologiczny

Projekt zbudowany jest w oparciu o nowoczesne technologie webowe:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Język**: [TypeScript](https://www.typescriptlang.org/)
- **Style**: [Tailwind CSS](https://tailwindcss.com/)
- **Animacje**: [GSAP](https://gsap.com/) (GreenSock Animation Platform) z wtyczką ScrollTrigger
- **Ikony**: [Lucide React](https://lucide.dev/)

## 📦 Uruchomienie

Aby uruchomić projekt lokalnie:

1. Zainstaluj zależności:
```bash
npm install
```

2. Uruchom serwer deweloperski:
```bash
npm run dev
```

Strona będzie dostępna pod adresem `http://localhost:3000`.


