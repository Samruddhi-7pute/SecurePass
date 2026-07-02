# SecurePass — Password Security Toolkit

A modern, browser-based password generator and security analyzer that creates high-entropy passwords locally and provides detailed resistance analysis against common attack vectors.

## Features

✨ **Secure Password Generation**
- Generate strong passwords with customizable character sets
- Choose from uppercase, lowercase, numbers, and symbols
- Exclude similar characters (i, l, 1, L, o, O, 0) for clarity
- Adjustable password length (8-128 characters)

📊 **Security Analysis**
- Real-time entropy calculation
- Brute-force resistance analysis
- Dictionary attack resistance evaluation
- Credential-stuffing vulnerability assessment
- Password strength indicators

🔐 **100% Local & Private**
- All password generation happens in your browser
- No data sent to servers
- No tracking or data collection
- Your passwords never leave your device

🎨 **Modern UI**
- Clean, responsive design
- Dark-themed interface with smooth animations
- QR code generation for password sharing
- Copy-to-clipboard functionality
- Security tips and best practices

## How to Use

1. **Open the Application**
   - Simply open `securepass.html` in your web browser

2. **Generate a Password**
   - Click the "Generate" button to create a new password
   - Adjust the password length using the slider (8-128 characters)
   - Toggle character types: Uppercase, Lowercase, Numbers, Symbols
   - Enable "Exclude Similar" to avoid confusing characters

3. **View Security Analysis**
   - Entropy bits show how many possible combinations exist
   - Resistance section displays:
     - ✓ Brute force attacks (60+ bits recommended)
     - ✓ Dictionary attacks
     - ✓ Credential stuffing
   - Estimated crack times help gauge password strength

4. **Copy Your Password**
   - Click the copy icon to copy the password to your clipboard
   - Click the QR code icon to generate and share a QR code
   - Optionally download the QR code as a PNG

## Security & Privacy

- **No Server Communication**: Everything runs locally in your browser
- **No Data Collection**: We don't track, store, or analyze your passwords
- **No Cookies**: No persistent tracking across sessions
- **Open Source Principles**: Transparent code you can audit
- **Best Practices**: Follows NIST password guidelines

## Technical Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **Vanilla JavaScript**: No dependencies, lightweight, fast
- **Web Crypto API**: Cryptographically secure random number generation
- **QRCode.js**: QR code generation library

## File Structure

```
├── securepass.html          # Main HTML file
├── css/
│   └── styles.css          # Styling and animations
├── js/
│   └── app.js              # Core application logic
└── README.md               # This file
```

## Key Technologies

- **CSPRNG**: Uses `crypto.getRandomValues()` for cryptographically secure randomness
- **Entropy Calculation**: Measures password strength in bits using log₂(pool size × length)
- **Crack Time Estimation**: Calculates resistance based on 10 billion guesses/second scenario

## Security Tips

💡 **Password Best Practices**:
- Never reuse the same password across different accounts
- Enable multi-factor authentication wherever available
- Use a password manager to store generated passwords
- Longer passwords beat complex ones (add 4 characters > add 1 symbol)
- Rotate passwords immediately after a service breach
- Avoid dictionary words, names, or personal dates

## Browser Compatibility

- Chrome/Edge 37+
- Firefox 57+
- Safari 11+
- Opera 24+

Requires Web Crypto API support (available in all modern browsers)

## Getting Started

1. Clone or download this repository
2. Open `securepass.html` in your web browser
3. Start generating secure passwords!

No installation, no dependencies, no setup required.

## License
This project is intended for educational and personal use only.

**Stay secure. Generate locally. Trust your browser.**
