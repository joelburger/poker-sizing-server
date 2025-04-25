# GCP instructions

```markdown
## Authenticate with GCP
Run the following command to authenticate with GCP using application default credentials:
```bash
gcloud auth application-default login
```

## Tag the Docker Image
Tag the Docker image with the appropriate GCP Container Registry URL and version:
```bash
docker tag websocket-server:latest asia.gcr.io/skunkworks-268706/poker-sizing-server:v0.0.2
```

## Push the Docker Image
Push the tagged image to the specified GCP Container Registry:
```bash
docker push asia.gcr.io/skunkworks-268706/poker-sizing-server:v0.0.2
```

