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