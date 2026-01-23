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

### 3. Shop (Sklep) - W budowie
Planowana sekcja e-commerce/sklepu, która pozwoli na zakup akcesoriów i usług online. Obecnie w fazie rozwoju.

## 🛠️ Stack Technologiczny

Projekt zbudowany jest w oparciu o nowoczesne technologie webowe:

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
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
