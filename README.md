# Flow UX AI

AI-powered UX analysis tool for detecting issues in design screenshots. Analyze Figma designs with AI to detect UX issues and export actionable reports.

## Features

- 🚀 **Instant Analysis** - Get comprehensive UX feedback in seconds
- 🎯 **Pixel-Perfect Detection** - AI identifies contrast issues, spacing problems, and accessibility gaps
- 📄 **Actionable Reports** - Export detailed findings to Markdown with precise coordinates
- ♿ **WCAG Compliant** - Ensure your designs meet accessibility standards automatically

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Animations**: Framer Motion
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deployment on Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **That's it!** Your project will be deployed automatically.

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

## Environment Variables

Currently, no environment variables are required. If you add backend features later, add them in:

- **Local**: `.env.local`
- **Vercel**: Project Settings → Environment Variables

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── screens/          # Screen components
│   ├── review/           # Review components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and types
└── public/               # Static assets
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT

