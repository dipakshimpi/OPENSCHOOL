# Auto-start PeerTube Docker Containers

## Quick Start Commands

### Start PeerTube (Run this once, containers will auto-restart)
```powershell
cd C:\Users\Admin\Desktop\openschool\peertube
docker-compose up -d
```

### Check Status
```powershell
docker-compose ps
```

### View Logs
```powershell
docker-compose logs -f peertube
```

### Stop Containers
```powershell
docker-compose down
```

## Auto-Start on System Boot (Windows)

The `docker-compose.yml` is configured with `restart: always`, which means Docker will automatically restart the containers when:
- Docker Desktop starts
- Your computer restarts
- The container crashes

**To enable auto-start:**

1. **Enable Docker Desktop on Windows Startup**
   - Open Docker Desktop
   - Go to Settings → General
   - Check ✅ "Start Docker Desktop when you log in"

2. **Verify PeerTube containers are running**
   ```powershell
   docker ps
   ```
   You should see: `postgres`, `redis`, and `peertube` containers

## Health Check Endpoint

Check if PeerTube is available:
```
GET http://localhost:3000/api/health/peertube
```

Response:
```json
{
  "status": "healthy",
  "service": "peertube",
  "message": "Video server is running"
}
```

## Troubleshooting

### Issue: "ECONNREFUSED 127.0.0.1:9000"
**Solution:** PeerTube container is not running. Start it:
```powershell
cd C:\Users\Admin\Desktop\openschool\peertube
docker-compose up -d
```

### Issue: Container won't start
**Check logs:**
```powershell
docker-compose logs peertube
```

**Reset and restart:**
```powershell
docker-compose down
docker-compose up -d
```

### Issue: Port 9000 already in use
**Find what's using the port:**
```powershell
netstat -ano | findstr :9000
```

**Kill the process or change PeerTube port in `docker-compose.yml`:**
```yaml
ports:
  - "9001:9000"  # Change external port to 9001
```

## Production Deployment

For scalability without manual Docker management:

1. **Use Docker Swarm or Kubernetes** for orchestration
2. **Deploy to cloud** (AWS ECS, Azure Container Instances, Google Cloud Run)  
3. **Use managed video services** (AWS MediaConvert, Cloudflare Stream)
4. **Setup monitoring** with health checks and auto-restart policies

## For End Users

End users (teachers/students) will **never** need to interact with Docker. Only system administrators need to ensure the PeerTube service is running. The application now:
- ✅ Shows friendly error messages if video service is offline
- ✅ Has health check endpoint for monitoring
- ✅ Gracefully handles connection failures
