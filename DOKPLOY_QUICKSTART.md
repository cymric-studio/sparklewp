# Dokploy Quick Start Guide

## Overview

SparkleWP uses **3 separate Docker Compose files** for independent service management in Dokploy.

## Files Created

```
sparklewp-main/
├── docker-compose.mongodb.yml    # MongoDB service
├── docker-compose.backend.yml    # Backend API service
├── docker-compose.frontend.yml   # Frontend React/Nginx service
├── backend/
│   ├── Dockerfile               # Backend production build
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile               # Frontend multi-stage build
│   ├── nginx.conf               # Nginx config with API proxy
│   └── .dockerignore
├── .env.docker.example          # Environment variable template
├── DOCKER_DEPLOYMENT.md         # Full deployment documentation
└── DOKPLOY_QUICKSTART.md        # This file
```

## Dokploy Setup Steps

### Step 1: Create Network (First Time Only)

Before deploying anything, create the shared network:

```bash
docker network create sparklewp-network
```

Or Dokploy will create it automatically when you deploy MongoDB first.

### Step 2: Deploy in Dokploy

Create **3 applications** in Dokploy:

#### Application 1: MongoDB

- **Name:** `sparklewp-mongodb`
- **Source Type:** Docker Compose
- **Repository:** Your git repo
- **Compose File Path:** `docker-compose.mongodb.yml`
- **Auto Deploy:** ✅ ON
- **Always Pull Latest:** ✅ ON
- **Environment Variables:** None needed
- **Deploy Order:** **1st** (deploy this first!)

#### Application 2: Backend

- **Name:** `sparklewp-backend`
- **Source Type:** Docker Compose
- **Repository:** Your git repo
- **Compose File Path:** `docker-compose.backend.yml`
- **Auto Deploy:** ✅ ON
- **Always Pull Latest:** ✅ ON
- **Environment Variables:**
  ```env
  JWT_SECRET=change-this-to-a-long-random-string-32-chars-minimum
  CLIENT_URL=https://yourdomain.com
  ```
- **Deploy Order:** **2nd** (after MongoDB is running)

#### Application 3: Frontend

- **Name:** `sparklewp-frontend`
- **Source Type:** Docker Compose
- **Repository:** Your git repo
- **Compose File Path:** `docker-compose.frontend.yml`
- **Auto Deploy:** ✅ ON
- **Always Pull Latest:** ✅ ON
- **Port Mapping:**
  - Container Port: `80`
  - Host Port: `3000` (or custom port if needed)
- **Domain:** Configure your domain in Dokploy
- **Deploy Order:** **3rd** (after Backend is running)

### Step 3: Configure Domain & SSL

In Dokploy:
1. Go to `sparklewp-frontend` app
2. Navigate to **Domains** section
3. Add your domain (e.g., `sparklewp.yourdomain.com`)
4. Enable **SSL/HTTPS** (Let's Encrypt)
5. Save and redeploy

Update backend environment variable:
```env
CLIENT_URL=https://sparklewp.yourdomain.com
```

### Step 4: Access Application

Visit: `https://sparklewp.yourdomain.com`

**Default Login:**
- Username: `admin`
- Password: `admin123`

⚠️ **Change this password immediately!**

## How Dokploy Deployment Works

### When you click "Redeploy":

1. **MongoDB** - Just restarts container (data persists in volume)
2. **Backend** - Pulls latest code → Builds new image → Restarts container
3. **Frontend** - Pulls latest code → Builds React → Creates new Nginx image → Restarts container

### Data Persistence

✅ **MongoDB data is SAFE** - Stored in Docker volume `sparklewp-mongodb-data`
- Survives container restarts
- Survives redeployments
- Only deleted if you manually delete the volume

## Common Dokploy Operations

### Update Backend Code

1. Push code to your git repo
2. In Dokploy, open `sparklewp-backend`
3. Click **Redeploy** button
4. Wait for build to complete
5. Done! New code is live, data is preserved

### Update Frontend Code

1. Push code to your git repo
2. In Dokploy, open `sparklewp-frontend`
3. Click **Redeploy** button
4. Wait for build to complete
5. Done! New frontend is live

### View Logs

In Dokploy, each application has a **Logs** tab:
- Real-time logs
- Filter by service
- Search functionality

Or via CLI:
```bash
docker logs -f sparklewp-backend
docker logs -f sparklewp-frontend
docker logs -f sparklewp-mongodb
```

### Check Container Status

In Dokploy dashboard:
- Green = Running
- Red = Stopped/Error
- Yellow = Starting

### Restart a Service

In Dokploy:
1. Click on the application
2. Click **Stop** button
3. Click **Start** button

Or use **Restart** if available.

## Troubleshooting in Dokploy

### "Backend can't connect to MongoDB"

**Check:**
1. MongoDB application is **running** (green status)
2. Both containers are on `sparklewp-network`
3. Redeploy backend to retry connection

**Fix:**
```bash
# In Dokploy terminal or SSH
docker network inspect sparklewp-network
# Should show both mongodb and backend containers
```

### "Frontend shows Network Error"

**Check:**
1. Backend application is **running**
2. Check backend logs for errors
3. Verify nginx.conf has correct proxy configuration

**Fix:**
```bash
# View Nginx config
docker exec sparklewp-frontend cat /etc/nginx/conf.d/default.conf
# Should have: proxy_pass http://backend:5000;
```

### "Can't log in / Forgot password"

**Reset admin user:**
```bash
# In Dokploy terminal
docker exec -it sparklewp-mongodb mongosh
use sparkle
db.users.deleteOne({ username: "admin" })
exit

# Restart backend to recreate admin
docker restart sparklewp-backend

# Check logs
docker logs sparklewp-backend
# Should see: "Default admin user created."
```

### "Data lost after redeploy"

**If data is actually lost:**
```bash
# Check if volume exists
docker volume ls | grep mongodb-data

# Inspect volume
docker volume inspect sparklewp-mongodb-data
```

If volume exists, data should be there. Check if MongoDB is using the correct volume in docker-compose.mongodb.yml.

## Environment Variables Management

### Update Variables in Dokploy

1. Go to application (e.g., `sparklewp-backend`)
2. Click **Environment** tab
3. Add/Edit variables:
   ```
   JWT_SECRET=new-secret-key
   CLIENT_URL=https://newdomain.com
   ```
4. Click **Save**
5. Click **Redeploy** to apply changes

### Sensitive Variables

Dokploy encrypts environment variables. Safe to store:
- JWT_SECRET
- API keys
- Database credentials (if added later)

## Backup & Restore

### Backup MongoDB (Recommended: Weekly)

In Dokploy terminal or SSH:

```bash
# Create backup
docker exec sparklewp-mongodb mongodump --out /data/backup

# Copy to host
docker cp sparklewp-mongodb:/data/backup ./sparklewp-backup-$(date +%Y%m%d)

# Download from server or store in secure location
```

### Restore MongoDB

```bash
# Upload backup to server
# Copy to container
docker cp ./sparklewp-backup-20241017 sparklewp-mongodb:/data/restore

# Restore
docker exec sparklewp-mongodb mongorestore /data/restore
```

## Scaling Considerations

Current setup is for **single-server deployment**.

For production with high traffic:
- Add load balancer in front of frontend
- Scale backend horizontally (multiple containers)
- Use managed MongoDB (MongoDB Atlas)
- Use Redis for session storage

Dokploy supports this but requires compose file updates.

## Security Checklist

Before going live:

- [ ] Changed default admin password
- [ ] Set strong JWT_SECRET (32+ chars, random)
- [ ] Enabled HTTPS/SSL in Dokploy
- [ ] Updated CLIENT_URL to production domain
- [ ] Limited exposed ports (only frontend)
- [ ] Set up MongoDB backups (weekly)
- [ ] Configured Dokploy firewall rules
- [ ] Tested backup/restore procedure
- [ ] Set up monitoring/alerts in Dokploy

## Support & Resources

- **Full Documentation:** See `DOCKER_DEPLOYMENT.md`
- **Dokploy Docs:** https://docs.dokploy.com
- **Docker Compose Reference:** https://docs.docker.com/compose/

## Quick Commands Reference

```bash
# View all containers
docker ps

# View logs
docker logs -f sparklewp-backend

# Execute command in container
docker exec -it sparklewp-mongodb mongosh

# Check network
docker network inspect sparklewp-network

# View volumes
docker volume ls | grep sparklewp

# Container stats
docker stats sparklewp-mongodb sparklewp-backend sparklewp-frontend
```

## Next Steps

1. ✅ Deploy all 3 services in order
2. ✅ Configure domain and SSL
3. ✅ Test login and create test data
4. ✅ Update environment variables
5. ✅ Set up backup strategy
6. ✅ Add your WordPress sites to manage
7. ✅ Invite team members (create users in app)

---

**Ready to deploy?** Start with MongoDB, then Backend, then Frontend. Good luck! 🚀
