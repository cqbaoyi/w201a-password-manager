# Password Manager

A lightweight, client-side password manager built with React. Secure password storage, generation, and management with mobile-first responsive design.

## Features

- **Client-side encryption** using Web Crypto API (AES-GCM 256-bit)
- **Master password protection** with PBKDF2 key derivation (100,000+ iterations)
- **One-click password copying** with visual feedback
- **Password generation** with configurable length and character types
- **Search and filter** passwords by title, username, or URL
- **Auto-lock** after 5 minutes of inactivity
- **Mobile-first responsive design**

## Technology Stack

- React 18 with functional components and hooks
- CSS Modules for styling
- Web Crypto API for encryption
- localStorage for data persistence

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Open [http://localhost:3000](http://localhost:3000)**

## Usage

1. **Create vault** with a strong master password (8+ chars, mixed case, numbers, symbols)
2. **Add passwords** using the "➕ Add Password" button
3. **Generate secure passwords** with the built-in generator
4. **Search/filter** using the search bar
5. **Copy passwords** with one click

## Security

- ✅ All encryption happens in your browser
- ✅ Master password never leaves your device
- ✅ Passwords encrypted individually with unique IVs
- ⚠️ **No password recovery** - remember your master password
- ⚠️ **Local storage only** - no cloud sync

## Project Structure

```
src/
├── components/          # React components
│   ├── LoginScreen.js   # Master password entry
│   ├── PasswordVault.js # Main vault interface
│   ├── PasswordCard.js  # Individual password display
│   ├── PasswordForm.js  # Add/edit password form
│   ├── PasswordGenerator.js # Password generation UI
│   └── CopyButton.js    # Copy to clipboard component
├── utils/               # Utility functions
│   ├── crypto.js        # Encryption/decryption
│   ├── storage.js       # localStorage wrapper
│   ├── passwordGenerator.js # Password generation logic
│   └── validation.js    # Input validation
├── App.js              # Main application component
└── index.js            # Application entry point
```

## Browser Requirements

- Chrome 60+, Firefox 57+, Safari 11+, Edge 79+
- Web Crypto API support
- localStorage support

---

**Remember**: This is a client-side application. Your data never leaves your device, but there's no cloud backup or password recovery. Use responsibly.