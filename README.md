# Lore Engine

An AI-powered RPG with dynamic storytelling across 4 unique settings, powered by Google Gemini.

## Features
- 🌍 4 unique settings (Post-Apocalyptic, Fantasy, Sci-Fi, Cyberpunk)
- 🧙 Character creation with attributes and classes
- 📖 AI-generated dynamic storytelling (Google Gemini 3.6 Flash)
- ⚔️ Turn-based combat system with D20/D6 dice mechanics
- 🎲 Animated dice rolls
- 💾 Auto-save via localStorage

## Tech Stack
- React + Vite
- Tailwind CSS v4
- Google Gemini API (AI Narrator)
- localStorage (Save System)

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables
Create a `.env.local` file:

```
VITE_GEMINI_API_KEY=your_api_key_here

```

## Live Demo
👉 [lore-engine.netlify.app](https://lore-engine.netlify.app)

## Roadmap
- [ ] Inventory system
- [ ] Story history persistence
- [ ] Language selection
- [ ] Local co-op (2 players)

## Known Issues & Lessons Learned

### 🔄 API Rate Limits
- **Problem:** Google Gemini Free Tier hat strenge Rate Limits die das Entwickeln stark behindert haben
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