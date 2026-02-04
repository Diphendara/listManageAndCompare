# ListManageAndCompare

An offline-first React Native web app for managing inventory items and custom lists. All data persists locally with automatic backup functionality. Perfect for tracking collectibles, inventory, or personalized card decks.

**Version**: 1.0  
**Last Updated**: February 4, 2026

---

## 📋 Table of Contents

- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
  - [Windows Setup](#windows-setup)
  - [macOS Setup](#macos-setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- **Inventory Management**: Add, edit, delete, and search items with quantities and tags
- **Custom Lists**: Create personalized lists with full editor support
- **Comparisons**: Compare your inventory against desired lists to see what you have and what's missing
- **Import/Export**: 
  - Import multiple inventory files (JSON/TXT)
  - Export inventory and lists in JSON or TXT format
  - Batch import/export support with format selection
- **Offline-First**: All data stored locally, no cloud dependency
- **Automatic Backups**: Timestamped backups created automatically with every save
- **Responsive Design**: Works on desktop and mobile browsers
- **Title Case Display**: Clean formatting throughout the app

---

## 🖥️ System Requirements

### Minimum Requirements

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher (comes with Node.js)
- **RAM**: 2GB minimum
- **Disk Space**: 500MB for node_modules and dependencies

### Recommended

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **RAM**: 4GB or more
- **macOS**: M1/M2 or Intel Mac with latest updates
- **Windows**: Windows 10/11 with latest updates

---

## 💻 Installation

### Windows Setup

#### Step 1: Install Node.js and npm

1. **Download Node.js**:
   - Go to [nodejs.org](https://nodejs.org)
   - Download the LTS (Long Term Support) version
   - Run the installer (.msi file)

2. **Follow the installer**:
   - Accept the license agreement
   - Keep default installation path: `C:\Program Files\nodejs`
   - Check "Add to PATH" (should be checked by default)
   - Complete the installation

3. **Verify installation**:
   - Open **Command Prompt** (press `Win + R`, type `cmd`, press Enter)
   - Run these commands:
     ```bash
     node --version
     npm --version
     ```
   - You should see version numbers (e.g., v20.10.0)

#### Step 2: Clone or Extract the Project

**Option A: Using Git (Recommended)**

1. Install Git from [git-scm.com](https://git-scm.com)
2. Open Command Prompt and navigate to your desired directory:
   ```bash
   cd C:\Users\YourUsername\Documents
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/Diphendara/listManageAndCompare.git
   cd listManageAndCompare
   ```

**Option B: Manual Download**

1. Download the project ZIP file
2. Extract it to a folder (e.g., `C:\Users\YourUsername\Documents\listManageAndCompare`)
3. Open Command Prompt and navigate to the folder:
   ```bash
   cd C:\Users\YourUsername\Documents\listManageAndCompare
   ```

#### Step 3: Install Dependencies

```bash
npm install
```

This will download and install all required packages (React, React Native, Expo, etc.).
Wait for the process to complete (usually 2-5 minutes).

#### Step 4: Start the Development Server

```bash
npm start
```

You should see output like:
```
Starting Metro Bundler
Web is running at http://localhost:8081
Press 'w' to open web, 'a' to open Android, 'i' to open iOS
```

Press **`w`** to open the app in your default web browser.

---

### macOS Setup

#### Step 1: Install Node.js and npm

**Option A: Using Homebrew (Easiest)**

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js**:
   ```bash
   brew install node
   ```

3. **Verify installation**:
   ```bash
   node --version
   npm --version
   ```

**Option B: Direct Download**

1. Go to [nodejs.org](https://nodejs.org)
2. Download the macOS LTS version (choose based on your Mac's chip: Intel or ARM)
3. Run the installer (.pkg file)
4. Follow the installation wizard

#### Step 2: Clone or Extract the Project

**Option A: Using Git**

1. Open Terminal and navigate to your desired directory:
   ```bash
   cd ~/Documents
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/Diphendara/listManageAndCompare.git
   cd listManageAndCompare
   ```

**Option B: Manual Download**

1. Download the project ZIP file
2. Extract it (usually auto-extracts)
3. Open Terminal and navigate:
   ```bash
   cd ~/Documents/listManageAndCompare
   ```

#### Step 3: Install Dependencies

```bash
npm install
```

Wait for completion (2-5 minutes typically).

#### Step 4: Start the Development Server

```bash
npm start
```

Press **`w`** to open the app in your default web browser.

---

## 🚀 Running the Project

### Development Mode

```bash
npm start
```

This starts the Expo development server. You can:
- Press `w` to open in web browser
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Press `q` to quit

### Web Only

```bash
npm run web
```

Opens the app directly in your web browser at `http://localhost:8081`

### Run Tests

```bash
npm test
```

Runs all unit tests (56 tests across utilities, models, and services).

### Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
ListManageAndCompare/
├── src/
│   ├── app/                    # Main app component
│   ├── components/             # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── SearchBar.tsx
│   │   ├── TextArea.tsx
│   │   ├── Toast.tsx
│   │   └── MultiFileImportButton.tsx
│   ├── screens/                # Main screen pages
│   │   ├── inventory/          # Inventory management
│   │   ├── lists/              # Custom lists
│   │   ├── comparisons/        # Compare lists
│   │   └── settings/           # App settings
│   ├── services/               # Business logic
│   │   ├── inventoryService.ts
│   │   ├── storageService.ts
│   │   └── customListsService.ts
│   ├── parsers/                # Text parsing
│   │   ├── itemParser.ts
│   │   └── listItemParser.ts
│   ├── models/                 # Data types
│   │   ├── Item.ts
│   │   ├── Inventory.ts
│   │   └── CustomList.ts
│   └── utils/                  # Helper functions
├── __tests__/                  # Test files (56 tests)
├── app.json                    # Expo configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## 📜 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start Dev Server | `npm start` | Launch Expo dev server (web/mobile) |
| Web Only | `npm run web` | Start web-only development server |
| Run Tests | `npm test` | Execute all unit tests |
| Build | `npm run build` | Create production build |

---

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
npm test
```

**Test Statistics**:
- **56 tests total** across 11 test suites
- **Utilities tested**: Parsing, formatting, merging, date handling
- **Models tested**: Item, Inventory, CustomList
- **Services tested**: Storage, memory adapter, inventory persistence

Test files are located in `__tests__/` directory.

---

## 📖 Usage Guide

### Inventory Management

1. Navigate to **Inventory** tab
2. Use **Search** to find items by name or tag
3. **Add items** using format: `5x Sword #weapon`
4. **Tag items** for organization (optional): `#armor`, `#healing`, etc.
5. **Download** as JSON or TXT format
6. **Import** from files

### Create Custom Lists

1. Go to **Custom Lists** tab
2. Click **Create New List**
3. Name your list (e.g., "My Collection")
4. Add items in format: `quantity x name`
5. Mark lists as **In Use** to track them
6. Download or share

### Compare Lists

1. Navigate to **Comparisons** tab
2. Paste your desired list in the textarea
3. App shows:
   - ✅ Cards you have (filtered from inventory)
   - ❌ Cards you're missing
4. Copy results to clipboard
5. Download in TXT format

### Settings

- Manage backups
- View inventory statistics
- Configure backup frequency

---

## 🔧 Troubleshooting

### "Command not found: npm"

**Windows**:
1. Open Command Prompt and run: `node --version`
2. If this fails, Node.js wasn't installed correctly
3. Reinstall Node.js and restart your computer

**macOS**:
1. Open Terminal and run: `node --version`
2. If this fails, run: `brew install node`
3. Or reinstall from [nodejs.org](https://nodejs.org)

### Port 8081 already in use

If you see "Port 8081 is already in use":

**Windows**:
```bash
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

**macOS**:
```bash
lsof -i :8081
kill -9 <PID>
```

### Dependencies installation fails

1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete `node_modules` and `package-lock.json`:
   - Windows: `rmdir /s /q node_modules` then delete `package-lock.json`
   - macOS: `rm -rf node_modules package-lock.json`

3. Reinstall:
   ```bash
   npm install
   ```

### Tests fail after changes

```bash
npm test -- --clearCache
npm test
```

### Web app won't load

1. Check if dev server is running (terminal shows Metro Bundler output)
2. Try clearing browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
3. Restart the dev server: Stop (Ctrl+C) and run `npm start` again

---

## 🤝 Contributing

To contribute improvements:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test: `npm test`
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Create a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 📞 Support

For issues, questions, or suggestions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Contact the development team

---

## 🎉 Getting Started Checklist

- [ ] Node.js v18+ installed
- [ ] Project cloned/extracted
- [ ] `npm install` completed
- [ ] `npm start` running successfully
- [ ] Web browser showing the app
- [ ] Tests passing (`npm test`)
- [ ] Ready to use! 🚀

---

**Happy listing! Manage your inventory with ease.** ✨
