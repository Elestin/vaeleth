# Vaeleth - Divine Realm Builder

A modern browser-based RPG where players create deities and fantasy races to shape a persistent world through strategic weekly actions.

## 🎮 Game Overview

Vaeleth is a multiplayer strategy game where you:
- **Create a Deity**: Choose your divine domain and name
- **Design a Fantasy Race**: Allocate points for unique characteristics  
- **Execute Weekly Actions**: Exploration, construction, diplomacy, warfare
- **Shape the World**: Your actions create a persistent timeline
- **Interact with Others**: Real-time chat and multiplayer mechanics

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Firebase account (for backend services)

### Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd vaeleth
npm install
```

2. **Configure Firebase:**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Firebase credentials
# VITE_FIREBASE_API_KEY=your-api-key
# VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# etc.
```

3. **Start development server:**
```bash
npm run dev
```

4. **Visit http://localhost:5173**

### Build for Production
```bash
npm run build
npm run preview  # Preview production build
```

## 🏗️ Architecture

### Modern Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with fantasy theme
- **State Management**: Zustand with subscriptions
- **Backend**: Firebase (Auth, Realtime Database, Firestore)
- **Icons**: Lucide React
- **Build**: Vite with code splitting

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements (Button, Input, etc.)
│   ├── auth/           # Authentication components
│   ├── game/           # Game-specific components
│   └── layout/         # Layout and navigation
├── services/           # Firebase and API services
├── store/              # Zustand state management
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
├── data/               # Game configuration (JSON)
└── utils/              # Helper functions
```

## 🎯 Game Features

### Core Gameplay Loop
1. **Deity Creation** - Choose divine domain (Death, Fire, Nature, etc.)
2. **Race Creation** - 100-point system for traits (Swift, Magic Affinity, Flight, etc.)
3. **Weekly Actions** - Spend resources on exploration, construction, diplomacy
4. **Turn Resolution** - Actions resolve weekly, creating world events
5. **Timeline & Map** - Track world history and territorial control

### Multiplayer Features
- **Real-time Chat** - Discuss strategy and form alliances
- **Diplomatic System** - Trade routes, treaties, declarations of war
- **Shared World** - All player actions affect the same persistent world
- **Timeline Events** - Public record of all major actions and outcomes

### Resource System
- **Action Points** - Core currency for all actions
- **Wealth** - For construction and trade
- **Magic** - For research and supernatural abilities  
- **Influence** - For diplomacy and espionage
- **Command** - For military and large projects

## 🔒 Security Features

- **Environment Variables** - Firebase keys secured server-side
- **Firebase Rules** - Users can only access their own data
- **Input Validation** - All user inputs sanitized
- **Authentication** - Email/password with secure sessions

## ♿ Accessibility

- **WCAG 2.1 AA Compliant** - Screen reader support
- **Keyboard Navigation** - Full keyboard accessibility
- **High Contrast** - Color-blind friendly palette
- **Reduced Motion** - Respects user motion preferences
- **Semantic HTML** - Proper ARIA labels and roles

## 🛠️ Development

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production  
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
```

### Code Style
- **TypeScript** - Strict mode enabled
- **ESLint** - Enforced code standards
- **Prettier** - Consistent formatting
- **Conventional Commits** - Structured commit messages

### Testing Strategy
- Unit tests for game logic and utilities
- Integration tests for Firebase services  
- E2E tests for critical user paths
- Accessibility testing with axe-core

## 🚀 Deployment

### Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Vercel
```bash
npm install -g vercel
vercel
# Follow prompts to deploy
```

### Docker
```bash
docker build -t vaeleth .
docker run -p 3000:3000 vaeleth
```

## 🗺️ Roadmap

### Phase 1: Core Game ✅
- [x] Authentication system
- [x] Deity and race creation
- [x] Weekly actions interface
- [x] Real-time chat
- [x] Timeline system

### Phase 2: Enhanced Gameplay 🔄
- [ ] Turn resolution engine
- [ ] AI-driven world events
- [ ] Advanced diplomacy system
- [ ] Territory control mechanics
- [ ] Mobile-responsive design

### Phase 3: Advanced Features 📋
- [ ] Guild/alliance system
- [ ] Achievement system
- [ ] Tutorial and onboarding
- [ ] Guest mode
- [ ] Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Firebase** - Backend infrastructure
- **React Team** - Frontend framework
- **Tailwind CSS** - Utility-first styling
- **Lucide** - Beautiful icons
- **Community** - Bug reports and feature suggestions

---

**Built with 💜 for fantasy strategy enthusiasts**