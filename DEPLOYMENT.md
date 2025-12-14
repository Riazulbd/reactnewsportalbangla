# বাংলা সংবাদ পোর্টাল - Docker Production Deployment

## প্রাইভেট ডিপ্লয়মেন্ট অপশন

### Option 1: Docker Hub Private Repository

```bash
# 1. Docker Hub এ লগইন
docker login

# 2. Images বিল্ড এবং ট্যাগ
docker build -t YOUR_USERNAME/newsportal-frontend:latest .
docker build -t YOUR_USERNAME/newsportal-backend:latest ./server

# 3. Push to Docker Hub
docker push YOUR_USERNAME/newsportal-frontend:latest
docker push YOUR_USERNAME/newsportal-backend:latest
```

### Option 2: GitHub Container Registry (Free Private)

```bash
# 1. GitHub Personal Access Token দিয়ে লগইন
echo YOUR_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# 2. Build and tag
docker build -t ghcr.io/YOUR_USERNAME/newsportal-frontend:latest .
docker build -t ghcr.io/YOUR_USERNAME/newsportal-backend:latest ./server

# 3. Push
docker push ghcr.io/YOUR_USERNAME/newsportal-frontend:latest
docker push ghcr.io/YOUR_USERNAME/newsportal-backend:latest
```

### Option 3: Self-hosted (Private Server)

```bash
# সার্ভারে docker-compose.yml এবং nginx.conf কপি করুন
# তারপর:
docker-compose up -d
docker-compose exec backend node seed.js
```

---

## Production docker-compose.yml

সার্ভারে এই ফাইল ব্যবহার করুন:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: newsportal
      POSTGRES_USER: ${DB_USER:-admin}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-your_secure_password}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    image: YOUR_REGISTRY/newsportal-backend:latest
    restart: always
    environment:
      DATABASE_URL: postgres://${DB_USER:-admin}:${DB_PASSWORD:-your_secure_password}@db:5432/newsportal
      JWT_SECRET: ${JWT_SECRET:-your_jwt_secret}
      BASE_URL: ${BASE_URL:-https://your-domain.com}
    depends_on:
      - db

  frontend:
    image: YOUR_REGISTRY/newsportal-frontend:latest
    restart: always

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
```

---

## Environment Variables

সার্ভারে `.env` ফাইল তৈরি করুন:

```env
DB_USER=admin
DB_PASSWORD=your_very_secure_password_here
JWT_SECRET=your_jwt_secret_here_random_string
BASE_URL=https://your-domain.com
```

---

## Hosting Providers (Free/Low-cost)

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| **Railway** | $5/month credit | Docker support, easy deploy |
| **Render** | Free tier | PostgreSQL included |
| **Fly.io** | Free tier | Docker native |
| **DigitalOcean** | $4/month | Full control |
| **Oracle Cloud** | Always Free | 2 VMs free |

---

## Quick Deploy to Railway

```bash
# 1. Railway CLI install
npm i -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway init
railway up
```
