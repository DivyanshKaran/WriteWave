# WriteWave - Japanese Learning Platform

A modern Japanese character learning application built with Next.js App Router, featuring interactive writing practice, OCR feedback, and gamified learning.

## 🚀 Features

- **Interactive Learning**: Practice Hiragana, Katakana, and Kanji with step-by-step stroke order guidance
- **AI-Powered OCR**: Real-time character recognition and feedback using OpenCV.js
- **Gamified Experience**: XP points, levels, daily streaks, and achievement badges
- **Progress Tracking**: Detailed analytics, learning heatmaps, and mastery tracking
- **Community Features**: Study groups, discussions, and leaderboards
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Accessibility**: WCAG compliant with screen reader support

## 🏗️ Architecture

### Next.js App Router Structure

```
src/
├── app/                          # App Router pages
│   ├── (auth)/                   # Authentication route group
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/              # Main app route group
│   │   ├── learn/
│   │   ├── progress/
│   │   ├── community/
│   │   └── profile/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Feature-based components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── layout/                   # Layout components
│   │   ├── AppShell.tsx
│   │   ├── Header.tsx
│   │   └── index.ts
│   ├── learn/                    # Learning components
│   │   ├── CanvasDrawing.tsx
│   │   ├── CharacterCard.tsx
│   │   └── index.ts
│   ├── progress/                 # Progress components
│   │   ├── XPCard.tsx
│   │   ├── StreakCard.tsx
│   │   └── index.ts
│   └── community/                # Community components
│       ├── StudyGroups.tsx
│       ├── DiscussionList.tsx
│       └── index.ts
├── lib/                          # Utility libraries
│   ├── api/                      # API client and services
│   │   ├── client.ts
│   │   ├── services.ts
│   │   └── endpoints.ts
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useI18n.ts
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   │   ├── ocr.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   └── constants/                # App constants
│       ├── characters.ts
│       ├── api.ts
│       └── index.ts
├── stores/                       # Zustand state management
│   ├── userStore.ts              # Authentication state
│   ├── progressStore.ts          # Progress and achievements
│   ├── characterStore.ts         # Character learning data
│   ├── uiStore.ts                # UI state (modals, toasts)
│   └── index.ts
├── types/                        # TypeScript type definitions
│   ├── user.ts                   # User and auth types
│   ├── character.ts              # Character and learning types
│   ├── progress.ts               # Progress and achievement types
│   ├── api.ts                    # API request/response types
│   └── index.ts
└── styles/                       # Global styles
    └── globals.css
```

### State Management

The application uses **Zustand** for state management with the following stores:

- **UserStore**: Authentication, user profile, and session management
- **ProgressStore**: XP, levels, streaks, achievements, and analytics
- **CharacterStore**: Character learning data, mastery levels, and progress
- **UIStore**: Modals, toasts, theme, and form state

### Key Technologies

- **Next.js 15**: App Router, Server Components, and optimizations
- **React 19**: Latest React features and concurrent rendering
- **TypeScript**: Full type safety with path aliases
- **Tailwind CSS**: Utility-first CSS with custom Japanese theme
- **Framer Motion**: Smooth animations and transitions
- **Zustand**: Lightweight state management
- **OpenCV.js**: Client-side OCR for character recognition
- **Axios**: HTTP client for API communication

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**: Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Path Aliases

The project uses TypeScript path aliases for clean imports:

```typescript
import { Button } from '@/components/ui'
import { useUserStore } from '@/stores'
import type { User } from '@/types'
import { api } from '@/lib/api'
```

Available aliases:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/stores/*` → `./src/stores/*`
- `@/types/*` → `./src/types/*`

## 🎨 Design System

### Japanese Theme Colors

- **Primary**: `#0066ff` (Japanese-inspired blue)
- **Success**: `#00a86b` (Growth and progress)
- **Warning**: `#ff9500` (Attention and focus)
- **Error**: `#dc143c` (Correction and learning)

### Typography

- **Sans**: Inter (Latin text)
- **Heading**: Space Grotesk (Headings and emphasis)
- **Japanese**: Noto Sans JP (Japanese characters)

### Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

## 📱 Features

### Character Learning

- Interactive canvas for handwriting practice
- Real-time OCR feedback and correction
- Stroke order animations and guidance
- Progressive difficulty levels
- Mastery tracking and spaced repetition

### Progress System

- XP points and level progression
- Daily streak tracking
- Achievement badges and milestones
- Learning heatmaps and analytics
- Leaderboards and community rankings

### Community

- Study groups and collaborative learning
- Discussion forums and Q&A
- User profiles and progress sharing
- Mentorship and peer support

## 🔧 Configuration

### Next.js Configuration

The `next.config.ts` includes:
- OpenCV.js webpack configuration
- Image optimization settings
- Security headers
- Environment variables
- Experimental features

### Tailwind Configuration

The `tailwind.config.ts` includes:
- Custom Japanese theme colors
- Typography settings
- Animation keyframes
- Responsive breakpoints
- Custom utility classes

### TypeScript Configuration

The `tsconfig.json` includes:
- Path aliases for clean imports
- Strict type checking
- Next.js optimizations
- Modern ES features

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://api.writewave.app
NEXT_PUBLIC_OPENCV_URL=/opencv.js
```

### Vercel Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push

## 📚 Learning More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [Framer Motion Documentation](https://www.framer.com/motion)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**WriteWave** - Master Japanese writing with AI-powered feedback and gamified learning.