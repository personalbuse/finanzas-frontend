# finanzas-frontend

Web application for a stock market investment simulator. Built with React, TypeScript, Tailwind CSS, and Vite. Served via Nginx with a reverse proxy to the backend API.

## Architecture

```
src/
  pages/                    # Page components (routes)
    auth/                   # Login, Register, ForgotPassword, ResetPassword
    Dashboard.tsx           # Main dashboard with market overview
    stocks/Stocks.tsx       # Stock browsing and buying
    portfolio/Portfolio.tsx # Portfolio management
    transactions/           # Transaction history
    learn/                  # Educational modules
    profile/Profile.tsx     # User settings
    admin/Admin.tsx         # Admin panel (KPIs, user management)
  components/               # Reusable UI components
    layout/                 # Header, Footer
    routing/PrivateRoute.tsx # Auth guard wrapper
    onboarding/             # First-time user experience
    charts/                 # Exchange rate charts
    seo/SEOHead.tsx         # Meta tags and structured data
    notifications/          # Toast notification system
  provider/                 # React context providers
    AuthProvider.tsx        # Authentication state
    ThemeProvider.tsx        # Dark/light mode
    LanguageProvider.tsx    # i18n (English/Spanish)
  services/
    api.ts                  # Axios instance with auth interceptor
  store/                    # Zustand state management
    useStore.ts             # User and auth state
    useAuthStore.ts         # Auth persistence
  locales/                  # Translation files
    en.json                 # English
    es.json                 # Spanish
```

## Tech Stack

- React 18 + TypeScript
- Vite 5 (build tool)
- Tailwind CSS 3 (styling)
- React Router 6 (routing)
- Zustand (state management)
- Axios (HTTP client)
- i18next (internationalization)
- react-toastify (notifications)
- Recharts (charts)
- Lucide React (icons)

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
# Clone the repository
git clone https://github.com/personalbuse/finanzas-frontend.git
cd finanzas-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs on `http://localhost:5173` and expects the backend API at `http://localhost:8000/api/v1` (proxied through Vite).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Pages

| Route | Page | Description |
|-------|------|-------------|
| /login | Login | User authentication |
| /register | Register | Multi-step registration with email verification |
| /forgot-password | ForgotPassword | Password reset request |
| /reset-password | ResetPassword | Password reset with token |
| /dashboard | Dashboard | Market overview with exchange rates |
| /stocks | Stocks | Browse, search, and buy stocks |
| /portfolio | Portfolio | View holdings, buy/sell stocks |
| /transactions | Transactions | Transaction history |
| /learn | Learn | Educational modules |
| /learn/{id} | LessonDetail | Module content |
| /profile | Profile | Account settings, dark mode toggle |
| /admin | Admin | Admin panel (only for users with admin role) |

## Features

- Real-time stock prices via Finnhub API
- Portfolio tracking with profit/loss calculation
- Currency conversion (USD, COP, EUR)
- Educational modules about investing
- Two-factor authentication via email
- Dark/light mode
- English/Spanish internationalization
- Responsive design (mobile + desktop)
- Rate-limited API requests

## Environment Variables

The application uses Vite environment variables prefixed with `VITE_`. These are set at build time.

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | (empty) | Backend API URL if using separate domains |

When frontend and backend are served through the same Nginx proxy, `VITE_API_URL` is not required. The Nginx config proxies `/api` requests to the backend service.

## Deployment

The production build creates a static site served by Nginx. The Nginx config (`nginx.conf`) includes:

- Reverse proxy for `/api` requests to the backend
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Static asset caching with immutable cache headers
- SPA fallback routing (`index.html` for all routes)

### Dokploy

Set the following environment variable in your Dokploy service if the backend service name differs:

```
BACKEND_UPSTREAM=http://backend:8000
```

If using separate subdomains for frontend and backend, rebuild the container with:

```
VITE_API_URL=https://api.yourdomain.com/api/v1
```
