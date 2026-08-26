# Product Cost Estimator

A mobile-first web application for garland craft business cost estimation. Built with React 18, TypeScript, Vite, and Tailwind CSS.

## Features

- **Materials Management**: Track raw materials (pipecleaners, beads, pearls, floral wire, green tape, hot glue, etc.) with custom units and bulk pricing
- **Bulk Pricing Model**: Enter bulk quantity + total cost → auto-calculates per-unit cost
- **Product Recipes**: Create bill of materials with quantities per material
- **Cost Breakdown**: Material cost + Labor (hours × rate) + Markup % = Final selling price
- **Save/Edit/Delete/Reuse**: Full CRUD for product recipes
- **Photo Attachment**: Add photos to products
- **Data Persistence**: localStorage with auto-save and export/import JSON
- **Mobile-First Design**: Optimized for mobile use with bottom navigation
- **GitHub Pages Ready**: Static site deployment with HashRouter

## Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router v6 (HashRouter for GitHub Pages)
- React Context + useReducer for state management
- localStorage for persistence
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

1. **Materials Page**: Add/edit raw materials with bulk pricing
2. **Products Page**: Create product recipes using materials
3. **Calculator Page**: Quick cost calculations without saving
4. **Dashboard**: Overview of products, stats, and quick actions

## Data Storage

All data is stored in localStorage in your browser. Use the Export/Import feature in the header menu to backup or migrate data.
