# ⚔️ Lore Engine

An AI-powered RPG with dynamic storytelling across 4 unique settings, powered by OpenRouter. Supports local multiplayer for up to 4 players.

## 🌍 Live Demo
👉 [lore-engine.netlify.app](https://lore-engine.netlify.app)

## 📸 Screenshot
![Lore Engine](./public/screenshot.png)

## ✨ Features
- 🌍 4 unique settings (Post-Apocalyptic, Fantasy, Sci-Fi, Cyberpunk)
- 👥 Local multiplayer (up to 4 players, shared story with rotating turns)
- 🧙 Character creation with attributes, classes and perks
- 📖 AI-generated dynamic storytelling (OpenRouter, model auto-routing)
- ⚔️ Turn-based combat system with D20/D6 dice mechanics
- 🎲 Animated dice rolls with advantage system per class
- 🛡️ Shield system per character class
- 🎒 Inventory system with usable items (heal, shield, weapon-specific attack bonuses, ammo)
- ⬆️ Level-Up system with XP
- 💀 Game Over screen with fade-in animation, sound and run summary
- 📊 Statistics screen (fights won, total XP, total currency, group overview)
- 🏆 Achievements system (10 achievements, persists independently of save resets)
- 🎵 Procedural ambient music per setting (Web Audio API, no external audio files) with volume control
- 🔄 "New Game" reset without needing devtools
- 💾 Auto-save via localStorage
- 🎨 Setting-specific color themes and UI

## 🚀 Roadmap
- [ ] 🛠️ Item crafting/combination system

## 🛠️ Tech Stack
- React + Vite
- Tailwind CSS v4
- OpenRouter API (AI Narrator, auto-routing)
- Web Audio API (sound effects & ambient music)
- localStorage (Save System, separate persistence for achievements)
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
- **Problem:** Google Gemini's free tier had strict rate limits that significantly slowed down development
- **Solution:** Switched to OpenRouter with auto-routing for more reliable availability
- **Takeaway:** Always plan a fallback for external APIs

### 📖 Story Persistence After Opening Inventory
- **Problem:** Opening the inventory caused the story to reload and tell a different story
- **Solution:** Story state saved in gameState + loading state only set to `true` when no story exists yet
- **Takeaway:** React components lose local state on unmount — important data belongs in global state

### 💾 localStorage undefined Bug
- **Problem:** `undefined` was being saved to localStorage and caused errors on load
- **Solution:** Added null checks when reading and writing
- **Takeaway:** Always use defensive programming with external storage

### 🏁 Stale Closure Race Condition in Multiplayer State
- **Problem:** During the transition between combat and story, player rotation could unexpectedly skip an extra step forward — reproducible, but hard to pin down
- **Cause:** The central `updateState` merge (`{...safeState, ...updates}`) used a state snapshot frozen per render. Two time-delayed `onUpdateState` calls within the same function referenced the same stale snapshot — the second call unintentionally restored an already-cleared field (`lastCombatResult`)
- **Solution:** Explicitly set the affected field to `null` in the final update call, plus a `useRef` guard against duplicate effect execution caused by React StrictMode
- **Takeaway:** With multiple time-delayed state updates in the same closure, carefully check which state snapshot is actually being used — especially with async code

### 🔊 Browser Autoplay Policy
- **Problem:** Sounds/music via the Web Audio API don't start automatically unless triggered by a direct user interaction (e.g. on page reload)
- **Solution:** Music is deliberately started via an explicit toggle button instead of automatically on load
- **Takeaway:** Modern browsers consistently block audio autoplay — design for a UI interaction as the trigger instead of fighting it

## 📬 Contact

- **GitHub:** [@VampireNoob](https://github.com/VampireNoob)
- **Instagram:** [@vampirenoob](https://www.instagram.com/vampirenoob)