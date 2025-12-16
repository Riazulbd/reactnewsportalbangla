# Deployment Guide

## 1. DigitalOcean App Platform (Recommended)
This is likely where you are facing issues. If you see "News Portal Backend API is running!" at your main URL, it means you have deployed the **Backend** to the root URL, covering up the Frontend.

You need **TWO Components** in your App:

### Component 1: The Backend (Web Service)
-   **Source**: Your GitHub Repostory
-   **Source Directory**: `/server`
-   **Name**: `newsportal-api` (or similar)
-   **Type**: **Web Service**
-   **Environment Variables**:
    -   `DATABASE_URL`: (Your database connection string)
    -   `DB_ENCRYPTION_KEY`: (Random string)
    -   `JWT_SECRET`: (Random string)
-   **HTTP Port**: `3001`
-   **Routes**: `/api` (Important! Change this from `/` to `/api`)

### Component 2: The Frontend (Static Site)
-   **Source**: Your GitHub Repository
-   **Source Directory**: `/` (Root)
-   **Name**: `newsportal-frontend`
-   **Type**: **Static Site**
-   **Build Command**: `npm run build`
-   **Output Directory**: `dist`
-   **Catchall Document**: `index.html` (Critical for React Router!)
-   **Routes**: `/` (Root)


**Result**:
-   Frontend loads at `https://your-app.ondigitalocean.app/`
-   Backend API is available at `https://your-app.ondigitalocean.app/api/`

### Automatic Fix (Using `do-app.yaml`)
I have created a file called `do-app.yaml` in your project. You can use this to automatically configure everything:
1.  Go to your App in DigitalOcean.
2.  Click **Settings**.
3.  Click **App Spec**.
4.  Copy the content of `do-app.yaml` and paste it there (or upload it).
5.  Click **Save**.


---

## 2. Docker Compose (Droplet / VPS)
If you are running on a server with Docker Compose:

1.  **Pull the latest code changes:**
    ```bash
    git pull
    ```
2.  **Rebuild and start the containers:**
    ```bash
    # Stop existing containers
    docker-compose down

    # Build and start new ones
    docker-compose up -d --build
    ```
    *Note: We removed an invalid `config.json` volume mount that was likely causing the backend to crash.*

3.  **Access**:
    -   Frontend: `http://your-droplet-ip` (Port 80)
    -   Backend: `http://your-droplet-ip:3001`

**If you see the Backend message at port 80**:
-   Check `nginx.conf` (it should perform the routing).
-   Ensure you are actually running the containers (`docker ps`).

## 3. "Docker Personal Token" Explanation
If you were asked for a "Docker Personal Token":

This happens if your repository is **Private**. DigitalOcean needs permission to pull failure.

1.  Go to GitHub -> **Settings** -> **Developer settings**.
2.  Select **Personal access tokens** -> **Tokens (classic)**.
3.  Generate new token with `read:packages` and `repo` scope.
4.  Provide this token to DigitalOcean if prompted during App creation.
