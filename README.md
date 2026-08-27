# Product Cost Estimator

A mobile-first web application for garland craft business cost estimation. Built with React 18, TypeScript, Vite, and Tailwind CSS.

## Features

- **Materials Management**: Track raw materials (pipecleaners, beads, pearls, floral wire, green tape, hot glue, etc.) with custom units and bulk pricing
- **Bulk Pricing Model**: Enter bulk quantity + total cost → auto-calculates per-unit cost
- **5 Decimal Precision**: Bulk cost supports up to 5 decimal places for precise pricing
- **Product Recipes**: Create bill of materials with quantities per material
- **Cost Breakdown**: Material cost + Labor (hours × rate) + Markup % = Final selling price
- **Save/Edit/Delete/Reuse**: Full CRUD for product recipes
- **Photo Attachment**: Add photos to products
- **Data Persistence**: localStorage with auto-save and export/import JSON
- **Cloud Sync (JSONBin.io)**: Sync data across devices without a backend server
- **Auto-Sync**: Optional automatic synchronization on data changes
- **Conflict Resolution**: Choose how to handle sync conflicts (local-wins, remote-wins, manual)
- **Mobile-First Design**: Optimized for mobile use with bottom navigation
- **GitHub Pages Ready**: Static site deployment with HashRouter

## Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router v6 (HashRouter for GitHub Pages)
- React Context + useReducer for state management
- localStorage for persistence
- JSONBin.io for serverless cloud JSON storage
- Lucide React for icons

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to GitHub Pages

1. Push to main/master branch
2. Enable GitHub Pages in repository settings (source: GitHub Actions)
3. The workflow will automatically build and deploy

The app will be available at `https://<username>.github.io/ProductCostEstimator/`

## Usage

1. **Materials Page**: Add/edit raw materials with bulk pricing (supports 5 decimal places)
2. **Products Page**: Create product recipes using materials
3. **Calculator Page**: Quick cost calculations without saving
4. **Dashboard**: Overview of products, stats, and quick actions
5. **Cloud Sync**: Configure in Settings → Cloud Sync Settings to sync across devices

## Data Storage

All data is stored in localStorage in your browser. Use the Export/Import feature in the header menu to backup or migrate data.

### Cloud Sync with JSONBin.io

For cross-device synchronization, configure JSONBin.io in Settings → Cloud Sync Settings:

1. Create a free account at [jsonbin.io](https://jsonbin.io)
2. Create a new bin (JSON storage container)
3. Copy your **Bin ID** and **Master Key** (API Key)
4. Enter them in the Cloud Sync settings
5. Enable "Enable Cloud Sync" and optionally "Auto Sync"

Your data will sync automatically (if Auto Sync enabled) or manually via the "Sync Now" button. No backend server required - JSONBin.io handles the storage and API.
