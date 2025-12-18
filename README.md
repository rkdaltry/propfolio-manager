# PropFolio Manager - Institutional Grade Real Estate Intelligence

PropFolio Manager is a high-performance wealth management engine designed for professional property portfolio holders. It transforms the management of multiple assets into a strategic equity-growing machine.

## 🚀 Institutional Grade Feature Set

### 1. 🏁 Intelligence Hub (Phase 7)
- **Neural Document Ingestion**: Advanced "Magic Upload" interface for property documents.
- **AI-Driven OCR**: Automated data extraction from tenancy agreements and utility bills.
- **One-Click Data Sync**: Seamlessly sync extracted tenant data to your active portfolio.

### 2. 🔍 Command Palette (Phase 8)
- **Spotlight-Style Search**: Press **Cmd+K** to instantly find properties, tenants, or commands.
- **Glassmorphism UI**: High-fidelity search interface with real-time portfolio indexing.

### 3. 🗺️ Precision Geo-Mapping (Phase 6)
- **Characteristic Mainland Map**: High-fidelity UK mainland visualization for spatial orientation.
- **Investment Hotspots**: Strategic heatmap overlays for yield and vacancy analysis.

### 4. 📈 Equity Resilience Engine
- **"What-If" Stress Tester**: Simulate interest rate rises and vacancy shocks on your portfolio.
- **Yield Alpha Analysis**: Deep-dive metrics on net yield vs. market benchmarks.

### 5. 💎 Premium institutional Aesthetics
- **Core Design System**: Sophisticated glassmorphism components with backdrop blur and micro-animations.
- **Smooth Navigation**: High-performance sidebar and header architecture for rapid workflow.

## 🛠️ Tech Stack

- **Framework**: React 19.2 + Vite 6
- **Language**: TypeScript
- **Styling**: TailwindCSS 4.0 + Custom Glassmorphism
- **AI Integration**: Google Gemini AI
- **Database**: Firebase Firestore / Storage
- **Auth**: Firebase Auth (Google + Email)
- **Charts**: Recharts
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Google Gemini API key (if using AI features)

### Installation

1. Navigate to the project directory:
   ```bash
   cd /Users/rashedkhan/.gemini/antigravity/scratch/portfolio-manager-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (if needed):
   ```bash
   # Create .env.local with your configuration
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Build

Create a production build:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## 📁 Project Structure

```
portfolio-manager-app/
├── src/                # Source files
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── ...
├── public/             # Static assets
└── ...
```

## 🎨 Styling

This app uses TailwindCSS for styling. The configuration includes:
- Custom color schemes
- Responsive design utilities
- Modern UI components

## 📝 Notes

- This app uses TailwindCSS v4, which has a different configuration approach
- Git repository is preserved for version control
- Originally named "propfolio-manager-2" (typo corrected in reorganization)

## 🔗 Related

- Original location: `playground/propfolio-manager-2/`

---

**Version**: 0.0.0  
**Last Updated**: December 12, 2025
