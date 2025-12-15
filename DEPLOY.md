# Deployment Guide

This guide covers how to deploy the News Portal to DigitalOcean, specifically addressing Docker configuration and registry authentication ("Personal Token").

## 1. Quick Fix for Current Deployment
If you are running this on a DigitalOcean Droplet with the code present:

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

## 2. DigitalOcean App Platform (Recommended)
If you are deploying via DigitalOcean App Platform (PaaS):

1.  Create a **GitHub Repository** for your code if not already done.
2.  Go to [DigitalOcean Cloud](https://cloud.digitalocean.com/apps).
3.  Click **Create App**.
4.  Select **GitHub** as your source and pick your repository.
5.  DigitalOcean should auto-detect the Dockerfiles.
    *   **Frontend Service**: Ensure it uses `Dockerfile.frontend`.
    *   **Backend Service**: Ensure it uses `server/Dockerfile`.
6.  **Environment Variables**:
    *   Set them in the App Platform dashboard for the backend service (e.g., `DATABASE_URL` if you have a managed database).

## 3. "Docker Personal Token" Explanation
If you were asked for a "Docker Personal Token" or are strictly using **Docker Hub/GitHub Container Registry (GHCR)**:

This usually happens if your repository is **Private** or you are exceeding rate limits.

### How to generate a Token (for GitHub Registry):
1.  Go to GitHub -> **Settings** -> **Developer settings**.
2.  Select **Personal access tokens** -> **Tokens (classic)**.
3.  Generate new token.
4.  Select scopes:
    *   `read:packages` (to download images)
    *   `write:packages` (to upload images)
    *   `repo` (if the code is private)
5.  Copy the token (it starts with `ghp_`).

### How to use it on DigitalOcean (Droplet):
```bash
# Log in to GitHub Container Registry
echo "YOUR_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

Now you can pull images from GHCR.

## Troubleshooting
-   **Frontend not loading:**
    -   Check if the containers are running: `docker ps`
    -   Check logs: `docker-compose logs -f`
    -   Ensure port 80 is open on your Droplet's firewall.
