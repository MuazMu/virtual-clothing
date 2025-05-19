# Virtual Clothing Try-On Platform

A Next.js application that enables users to create 3D avatars from photos and try on virtual clothing items.

## Features

- Avatar creation from user photos
- 3D clothing try-on with Three.js
- AI fashion advice using OpenRouter API (Gemini 2.5 Pro)
- Shopping cart with product links
- Responsive design with Tailwind CSS

## Getting Started

First, clone the repository and install dependencies:

```bash
git clone <repository-url>
cd virtual-clothing
npm install
```

Create a `.env.local` file with the following variables:

```
# API URL (leave blank for internal API routes)
NEXT_PUBLIC_API_URL=

# OpenRouter API Key
OPENROUTER_API_KEY=your_openrouter_api_key
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploying to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fvirtual-clothing)

### Option 2: Manual Deploy

1. Push your code to GitHub, GitLab, or Bitbucket
2. Import your project in the [Vercel Dashboard](https://vercel.com/import)
3. Add the required environment variables:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key

### Environment Variables

Configure these environment variables in the Vercel dashboard:

| Name | Description | Required |
|------|-------------|----------|
| `OPENROUTER_API_KEY` | API key for OpenRouter AI service | Yes |

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Three.js & React Three Fiber
- Zustand
- Tailwind CSS
- OpenRouter API (Gemini 2.5 Pro)

## License

[MIT](LICENSE)
