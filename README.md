# Angular Client

Angular application that connects to the NestJS authenticated API.

## Prerequisites

### Node.js Version
This project requires Node.js version 22.12.0.

**Install using NVM (recommended):**

**Windows (nvm-windows):**
```bash
nvm install 22.12.0
nvm use 22.12.0
```

**macOS/Linux:**
```bash
nvm install 22.12.0
nvm use 22.12.0
```

Verify installation:
```bash
node --version  # Should show v22.12.0
```

### Required CLIs

**Install Angular CLI globally:**
```bash
npm install -g @angular/cli
```

**Verify installation:**
```bash
ng version
```

## Supabase Setup

This project requires a Supabase project for authentication tokens.

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing one)
3. Wait for the project to be fully provisioned

### 2. Get JWT Token from Supabase Dashboard

**For Development:**
- Go to Settings → API
- Copy the "anon public" key
- Update `src/environments/environment.ts` with this token

## Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Update `src/environments/environment.ts` with your Supabase values:
```typescript
export const environment = {
  production: false,
  jwtToken: 'your-supabase-anon-key',
  nestUrl: 'http://127.0.0.1:3000'
};
```

3. Start the development server:
```bash
npm start
```

4. Open http://localhost:4200

## Railway.com Deployment

### Step 1: Deploy to Railway
1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Angular project

### Step 2: Set Environment Variables in Railway Dashboard
Go to your Railway project → Variables tab and add:

```
JWT_TOKEN=your-supabase-anon-key
NEST_URL=https://your-nestjs-api-url.railway.app
```

**Where to get these values:**
- `JWT_TOKEN`: Supabase project → Settings → API → anon public key
- `NEST_URL`: Your deployed NestJS API URL from Railway

### Step 3: Railway Configuration Files
- `railway.json`: Service configuration
- `Dockerfile`: Container build instructions
- `scripts/build-env.js`: Injects environment variables at build time for production

## Development vs Production

- **Local Development**: Values are hardcoded in `environment.ts` (committed to git)
- **Production (Railway)**: Values are injected from Railway environment variables at build time into `environment.prod.ts`