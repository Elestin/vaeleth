# Vaeleth - Divine Realm Game

## Quick Start Guide (Windows)

### First Time Setup

1. **Run Initial Setup**
   ```
   setup-vaeleth.bat
   ```
   This will:
   - Check Node.js installation
   - Install project dependencies
   - Create environment configuration file

2. **Configure Firebase**
   - Edit the `.env` file created by setup
   - Add your Firebase project configuration
   - Enable Authentication and Realtime Database in Firebase Console

3. **Start Development Server**
   ```
   start-vaeleth.bat
   ```
   This will automatically open the game at http://localhost:5173

### Available Scripts

| Script | Purpose |
|--------|---------|
| `setup-vaeleth.bat` | Initial project setup (run once) |
| `start-vaeleth.bat` | Start development server |
| `build-vaeleth.bat` | Build for production |

### Manual Commands

If you prefer using npm directly:
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Check TypeScript types
```

### System Requirements

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Firebase Project**: Required for backend services

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable **Authentication** with Email/Password provider
4. Enable **Realtime Database**
5. Copy configuration values to your `.env` file

### Troubleshooting

**"Batch file closes immediately"**
- Run `debug-batch.bat` to check Node.js installation
- Make sure you're in the correct directory (where package.json exists)
- Try running as administrator
- Check if antivirus is blocking the script

**"Node.js not found"**
- Install Node.js from https://nodejs.org/ (version 18+)
- Restart command prompt after installation
- Add Node.js to PATH environment variable

**"Build fails with TypeScript errors"**
- Run `npm run typecheck` to see detailed errors
- Ensure all dependencies are installed with `npm install`

**"Firebase connection fails"**
- Verify `.env` file has correct Firebase configuration
- Check Firebase project settings and enabled services
- Ensure Firebase Authentication and Realtime Database are enabled

**"Port 5173 already in use"**
- Close other Vite development servers
- Or modify `vite.config.ts` to use different port

**"Permission denied errors"**
- Run command prompt as administrator
- Check folder permissions
- Temporarily disable antivirus file protection

### Development Tips

- Game saves automatically to Firebase
- Hot reload is enabled - changes appear instantly
- Use browser dev tools to inspect game state
- Tutorial system guides new players through features

### File Structure

```
vaeleth/
├── src/
│   ├── components/     # React components
│   ├── services/       # Game logic & Firebase
│   ├── store/          # State management
│   ├── types/          # TypeScript definitions
│   └── data/           # Game data (JSON)
├── public/             # Static assets
├── dist/               # Production build (generated)
└── *.bat               # Windows batch scripts
```

### Support

For issues or questions:
- Check console for error messages
- Verify Firebase configuration
- Ensure all dependencies are installed
- Check Node.js version compatibility