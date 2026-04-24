# 🧠 Synapse Study - Medical Flashcards

**Synapse Study** is a high-performance, read-only frontend application designed specifically for medical students to master complex subjects like Immunology, Pathology, and Surgery through interactive digital flashcards.

![Synapse Study Logo](logo.jpg)

## ✨ Features

- **3D Interactive Cards**: Smooth 3D flipping animation using CSS transitions to reveal answers.
- **Universal Dashboard Engine**: Automatically generates complex UI dashboard layouts directly from custom CSV files for subjects like Microbiology or Immunology.
- **Dynamic Filtering**: Flashcards are automatically categorized based on input data; filter by subjects like "Antigen", "Antibody", or "Complement".
- **Visual Excellence**: Dark-themed, tech-focused aesthetic with neon glowing elements, matching the Synapse Study brand.
- **Data-Driven**: Efficiently loads hundreds of cards from `data.json` and `dashboards_data.json`.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.
- **Smart Feedback**: Integrated SweetAlert2 notifications for a premium user experience.

## 🛠️ Tech Stack

- **Core**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Styling**: Bootstrap 5.3 + Custom CSS3 Animations
- **Utilities**: SweetAlert2 (Popups), Google Fonts (Outfit)
- **Data Management**: Node.js automated conversion script for CSV/Excel data.

## 📂 Project Structure

```text
├── dashboard_excel_files/      # Source CSV files for the Universal Dashboards
├── flash_cards_excel_files/    # Source CSV/Excel files for Flashcards
├── data.json                   # Generated card database
├── dashboards_data.json        # Generated dashboard database
├── update.js                   # Node.js automation script
├── index.html                  # Main flashcard application UI
├── dashboard.html              # Universal Dashboard Application UI
├── script.js                   # Navigation and filter logic for flashcards
├── dashboard.js                # Dynamic parsing engine for dashboards
├── style.css                   # Premium animations and core themes
├── dashboard.css               # Specific layouts for dashboard modules
└── logo.jpg                    # Official Synapse Study branding
```

## 🚀 Getting Started

### 1. View the App
To view the application locally, you need a local web server (to avoid CORS issues with the `fetch` API). The easiest way:
```bash
npm start
```
*Alternatively, use the "Live Server" extension in VS Code.*

### 2. Updating Flashcards and Dashboards
Whenever you have new content in Excel or CSV format:
1. Export your content as a `.csv` file.
2. If it's a Flashcard, place the file in the `flash_cards_excel_files` folder.
3. If it's a Dashboard Module (e.g., Immunology), place the file in the `dashboard_excel_files` folder. Make sure Column 1 is "Name" and Column 2 is "Tag" (your filters).
4. Run the update command:
   ```bash
   npm run update
   ```
5. Clear your browser cache and refresh to see the new content!

## 📄 License
Created by [Khant Kyaw Lin](https://github.com/KhantKyawLin/Synapse_Study). For educational use only.
