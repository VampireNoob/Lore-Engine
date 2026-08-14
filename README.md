# ⚔️ Lore Engine

An AI-powered RPG with dynamic storytelling across 4 unique settings, powered by OpenRouter.

## 🌍 Live Demo
👉 [lore-engine.netlify.app](https://lore-engine.netlify.app)

## 📸 Screenshot
![Lore Engine](./public/screenshot.png)

## ✨ Features
- 🌍 4 unique settings (Post-Apocalyptic, Fantasy, Sci-Fi, Cyberpunk)
- 🧙 Character creation with attributes, classes and perks
- 📖 AI-generated dynamic storytelling (OpenRouter / DeepSeek)
- ⚔️ Turn-based combat system with D20/D6 dice mechanics
- 🎲 Animated dice rolls with advantage system per class
- 🛡️ Shield system per character class
- 🎒 Inventory system with usable items (heal, shield, weapons)
- ⬆️ Level-Up system with XP
- 💾 Auto-save via localStorage
- 🎨 Setting-specific color themes and UI

## 🚀 Roadmap
- [ ] Local multiplayer (up to 4 players)
- [ ] Language selection (DE/EN)
- [ ] 💀 Game Over Screen
- [ ] 🏆 Achievements system (First Victory, Level 5, 100 Caps...)
- [ ] 🎵 Background music per setting
- [ ] 📊 Statistics screen (fights won, total XP, etc.)

## 🛠️ Tech Stack
- React + Vite
- Tailwind CSS v4
- OpenRouter API (AI Narrator)
- localStorage (Save System)
- Netlify (Deployment)

## 🚀 Getting Started

```bash
npm install
npm run dev
```

## 🔑 Environment Variables
Create a `.env.local` file:

```
VITE_GEMINI_API_KEY=your_api_key_here

```

## 🐛 Known Issues & Lessons Learned

### 🔄 API Rate Limits
- **Problem:** Google Gemini Free Tier hatte strenge Rate Limits die das Entwickeln stark behindert haben
- **Lösung:** Wechsel zu OpenRouter mit Auto-Routing für stabilere Verfügbarkeit
- **Lerneffekt:** Immer einen Fallback-Plan für externe APIs einplanen

### 📖 Story-Persistenz nach Inventar
- **Problem:** Nach dem Öffnen des Inventars wurde die Story neu geladen und erzählte eine andere Geschichte
- **Lösung:** Story-State im gameState gespeichert + Loading-State nur auf `true` wenn noch keine Story vorhanden
- **Lerneffekt:** React-Komponenten verlieren lokalen State beim Unmounten — wichtige Daten gehören in den globalen State

### 💾 localStorage undefined Bug
- **Problem:** `undefined` wurde in localStorage gespeichert und verursachte beim Laden Fehler
- **Lösung:** Null-Checks beim Lesen und Schreiben eingebaut
- **Lerneffekt:** Immer defensive Programmierung bei externem Storage betreiben