# Password Manager

A lightweight, client-side password manager built with React. This application provides secure password storage, generation, and management with a focus on mobile-first responsive design.

## Features

### 🔐 Security
- **Client-side encryption** using Web Crypto API (AES-GCM 256-bit)
- **Master password protection** with PBKDF2 key derivation (100,000+ iterations)
- **No data transmission** - everything stays in your browser
- **Auto-lock functionality** after 5 minutes of inactivity
- **Secure password generation** using cryptographically secure randomness

### 📱 User Experience
- **Mobile-first responsive design** - works great on all devices
- **One-click password copying** with visual feedback
- **Password strength indicators** and validation
- **Search and filter** passwords by title, username, or URL
- **Sort options** by title, username, URL, or date
- **Intuitive interface** with modern UI/UX

### 🎲 Password Generation
- **Configurable length** (8-64 characters)
- **Character type options** (uppercase, lowercase, numbers, symbols)
- **Ambiguous character exclusion** (0O1lI|)
- **Real-time strength analysis**
- **Secure random generation** using crypto.getRandomValues()

## Technology Stack

- **React 18** - Modern React with hooks
- **Create React App** - Zero-configuration build setup
- **CSS Modules** - Scoped styling for components
- **Web Crypto API** - Browser-native encryption
- **localStorage** - Client-side data persistence
- **UUID** - Unique identifier generation

## Getting Started

### Prerequisites

- Node.js 14 or higher
- Modern web browser with Web Crypto API support

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd w201a-password-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Usage

### First Time Setup

1. **Create a Master Password**: Choose a strong master password (minimum 8 characters with uppercase, lowercase, numbers, and symbols)
2. **Confirm Password**: Re-enter your master password to confirm
3. **Create Vault**: Click "Create Vault" to initialize your secure password storage

### Managing Passwords

#### Adding a New Password
1. Click the "➕ Add Password" button
2. Fill in the required fields (Title and Password are mandatory)
3. Use the "🎲 Generate Password" button to create a secure password
4. Click "Save Password" to store it securely

#### Editing a Password
1. Click the edit button (✏️) on any password card
2. Modify the fields as needed
3. Click "Update Password" to save changes

#### Deleting a Password
1. Click the delete button (🗑️) on any password card
2. Confirm the deletion in the dialog

#### Copying Passwords
1. Click the "Copy" button next to any password, username, or notes
2. The text will be copied to your clipboard with visual confirmation

### Password Generation

1. Click "🎲 Generate Password" in the add/edit form
2. Configure the password settings:
   - **Length**: Use the slider to set password length (8-64 characters)
   - **Character Types**: Select which character types to include
   - **Exclude Ambiguous**: Option to exclude confusing characters
3. Click "Generate New" to create a new password
4. Click "Use This Password" to apply it to your form

### Searching and Filtering

- Use the search bar to find passwords by title, username, or URL
- Sort passwords by title, username, URL, creation date, or last updated
- The search is case-insensitive and searches across all text fields

## Security Considerations

### What's Secure
- ✅ All encryption happens in your browser
- ✅ Master password never leaves your device
- ✅ Passwords are encrypted individually with unique IVs
- ✅ Uses industry-standard AES-GCM encryption
- ✅ PBKDF2 key derivation with 100,000+ iterations
- ✅ Auto-lock prevents unauthorized access

### Important Warnings
- ⚠️ **No password recovery** - if you forget your master password, all data is lost
- ⚠️ **Local storage only** - passwords are not synced across devices
- ⚠️ **Browser dependent** - data is tied to your browser and device
- ⚠️ **No cloud backup** - consider exporting data regularly

### Best Practices
1. **Choose a strong master password** and remember it
2. **Export your data regularly** as a backup
3. **Use the auto-lock feature** to protect against unauthorized access
4. **Keep your browser updated** for security patches
5. **Don't share your master password** with anyone

## Browser Compatibility

### Minimum Requirements
- Chrome 60+
- Firefox 57+
- Safari 11+
- Edge 79+

### Required Features
- Web Crypto API support
- localStorage support
- ES6+ JavaScript features
- CSS Grid and Flexbox support

## Data Storage

### localStorage Structure
```javascript
{
  "vault_salt": "base64-encoded-salt",
  "vault_data": [
    {
      "id": "uuid",
      "title": "Website Name",
      "username": "user@example.com",
      "encryptedPassword": "base64-encrypted-data",
      "iv": "base64-iv",
      "url": "https://example.com",
      "notes": "encrypted-notes",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

### Encryption Details
- **Algorithm**: AES-GCM 256-bit
- **Key Derivation**: PBKDF2 with SHA-256
- **Iterations**: 100,000+
- **Salt**: 16 bytes (128 bits)
- **IV**: 12 bytes (96 bits) per password entry

## Development

### Project Structure
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
├── index.js            # Application entry point
└── index.css           # Global styles and CSS variables
```

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Uses [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) for encryption
- Inspired by modern password managers like Bitwarden and 1Password
- Icons and emojis used for UI elements

## Support

For issues, questions, or contributions, please use the GitHub issue tracker.

---

**Remember**: This is a client-side application. Your data never leaves your device, but this also means there's no cloud backup or password recovery. Use responsibly and keep backups of your data.