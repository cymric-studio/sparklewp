# Docker Deployment Guide for SparkleWP

This guide explains how to deploy SparkleWP using Docker with 3 separate compose files for Dokploy.

## Architecture

```
SparkleWP Application
├── MongoDB (docker-compose.mongodb.yml)
│   └── Persistent volume: mongodb_data
├── Backend API (docker-compose.backend.yml)
│   └── Connects to MongoDB
└── Frontend (docker-compose.frontend.yml)
    └── Nginx serving React build + API proxy
```

## Prerequisites

- Docker and Docker Compose installed
- Dokploy panel access
- Git repository with your code

## Deployment Order

**IMPORTANT:** Deploy in this exact order to ensure proper network and dependency setup.

### 1. Deploy MongoDB First

```bash
docker-compose -f docker-compose.mongodb.yml up -d
```

This creates:
- `sparklewp-network` Docker network (shared by all services)
- `mongodb_data` persistent volume (your data survives redeployments)
- MongoDB container listening on port 27017

**Verify MongoDB is running:**
```bash
docker ps | grep sparklewp-mongodb
docker logs sparklewp-mongodb
```

### 2. Deploy Backend

```bash
docker-compose -f docker-compose.backend.yml up -d --build
```

This:
- Builds the backend image from `./backend/Dockerfile`
- Connects to MongoDB via Docker network
- Exposes port 5000 for API
- Creates default admin user on first run

**Verify Backend is running:**
```bash
docker ps | grep sparklewp-backend
docker logs sparklewp-backend
# Should see: "MongoDB connected successfully" and "Server running on port 5000"
```

### 3. Deploy Frontend

```bash
docker-compose -f docker-compose.frontend.yml up -d --build
```

This:
- Builds React production bundle
- Serves static files via Nginx on port 3000
- Proxies `/api/*` requests to backend container

**Verify Frontend is running:**
```bash
docker ps | grep sparklewp-frontend
docker logs sparklewp-frontend
```

### 4. Access the Application

Open your browser: `http://your-server-ip:3000`

**Default Login:**
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT:** Change the default password immediately after first login!

## Dokploy-Specific Instructions

### Setting Up in Dokploy

1. **Create 3 Separate Applications** in Dokploy:
   - `sparklewp-mongodb`
   - `sparklewp-backend`
   - `sparklewp-frontend`

2. **Configure Each Application:**

   **For MongoDB:**
   - Source Type: Docker Compose
   - Compose File: `docker-compose.mongodb.yml`
   - Auto Deploy: ON
   - Pull Latest: ON

   **For Backend:**
   - Source Type: Docker Compose
   - Compose File: `docker-compose.backend.yml`
   - Auto Deploy: ON
   - Pull Latest: ON
   - Environment Variables:
     ```
     JWT_SECRET=your-super-secret-jwt-key-change-this
     CLIENT_URL=http://your-domain.com
     ```

   **For Frontend:**
   - Source Type: Docker Compose
   - Compose File: `docker-compose.frontend.yml`
   - Auto Deploy: ON
   - Pull Latest: ON
   - Port Mapping: 3000:80 (host:container)

3. **Deploy Order in Dokploy:**
   - First: Deploy `sparklewp-mongodb`
   - Wait for it to be healthy
   - Second: Deploy `sparklewp-backend`
   - Wait for it to be healthy
   - Third: Deploy `sparklewp-frontend`

## Data Persistence

### MongoDB Data Volume

Your database data is stored in a Docker named volume: `sparklewp-mongodb-data`

**Important:**
- This volume persists even when containers are stopped/removed
- Your data survives redeployments and container restarts
- Only deleted if you explicitly remove the volume

**Backup MongoDB data:**
```bash
docker exec sparklewp-mongodb mongodump --out /data/backup
docker cp sparklewp-mongodb:/data/backup ./mongodb-backup
```

**Restore MongoDB data:**
```bash
docker cp ./mongodb-backup sparklewp-mongodb:/data/restore
docker exec sparklewp-mongodb mongorestore /data/restore
```

## Updating the Application

### Update Backend Code

1. Push code changes to your repository
2. In Dokploy, click "Redeploy" on `sparklewp-backend`
3. Dokploy will pull latest code and rebuild the image
4. Container restarts with new code
5. **Data is preserved** (MongoDB volume not affected)

### Update Frontend Code

1. Push code changes to your repository
2. In Dokploy, click "Redeploy" on `sparklewp-frontend`
3. Dokploy rebuilds React app and Nginx image
4. Container restarts with new build

### Update MongoDB (if needed)

⚠️ **Warning:** Only update MongoDB if necessary. Your data will persist, but test thoroughly.

```bash
docker-compose -f docker-compose.mongodb.yml pull
docker-compose -f docker-compose.mongodb.yml up -d
```

## Troubleshooting

### Backend can't connect to MongoDB

**Check network:**
```bash
docker network inspect sparklewp-network
# All 3 containers should be listed
```

**Check MongoDB is accessible:**
```bash
docker exec sparklewp-backend ping mongodb
```

### Frontend shows "Network Error"

**Check backend is running:**
```bash
curl http://localhost:5000/api/auth/login
```

**Check Nginx proxy config:**
```bash
docker exec sparklewp-frontend cat /etc/nginx/conf.d/default.conf
# Should have location /api/ proxy_pass http://backend:5000;
```

### Lost admin password

**Reset admin user:**
```bash
docker exec -it sparklewp-mongodb mongosh
use sparkle
db.users.updateOne(
  { username: "admin" },
  { $set: { password: "$2b$10$..." } }  # Generate new bcrypt hash
)
```

Or drop the database and restart backend (creates new admin):
```bash
docker exec -it sparklewp-mongodb mongosh
use sparkle
db.dropDatabase()
exit
docker restart sparklewp-backend
```

## Environment Variables Reference

### Backend Variables (docker-compose.backend.yml)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `production` | Node environment |
| `PORT` | No | `5000` | Backend server port |
| `USE_REAL_MONGO` | Yes | `true` | Use real MongoDB (not in-memory) |
| `MONGO_URI` | Yes | `mongodb://mongodb:27017/sparkle` | MongoDB connection string |
| `JWT_SECRET` | Yes | (must set) | Secret key for JWT tokens |
| `CLIENT_URL` | No | `http://localhost:3000` | Frontend URL for CORS |

### Frontend Variables (build-time)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_API_URL` | No | `` (empty) | API endpoint (proxied by Nginx, empty uses relative URLs) |

## Security Recommendations

1. **Change default credentials** immediately
2. **Set strong JWT_SECRET** (32+ random characters)
3. **Enable MongoDB authentication** for production
4. **Use HTTPS** in production (configure Dokploy reverse proxy)
5. **Limit exposed ports** (only expose frontend port 80/443)
6. **Regular backups** of MongoDB data
7. **Update Docker images** regularly for security patches

## Monitoring

### Check container health:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### View logs:
```bash
# All services
docker-compose -f docker-compose.mongodb.yml logs -f
docker-compose -f docker-compose.backend.yml logs -f
docker-compose -f docker-compose.frontend.yml logs -f

# Specific service
docker logs -f sparklewp-backend
```

### Resource usage:
```bash
docker stats sparklewp-mongodb sparklewp-backend sparklewp-frontend
```

## Cleanup (⚠️ Destroys Data)

**Stop all services:**
```bash
docker-compose -f docker-compose.frontend.yml down
docker-compose -f docker-compose.backend.yml down
docker-compose -f docker-compose.mongodb.yml down
```

**Remove with volumes (⚠️ DELETES ALL DATA):**
```bash
docker-compose -f docker-compose.mongodb.yml down -v
```

**Remove only containers (keeps data):**
```bash
docker-compose -f docker-compose.mongodb.yml down
# Volume sparklewp-mongodb-data remains intact
```

## Support

For issues or questions:
1. Check container logs first
2. Verify network connectivity between containers
3. Ensure MongoDB volume has data
4. Check Dokploy deployment logs
