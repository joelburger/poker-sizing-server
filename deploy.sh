#!/bin/bash -e

version=$1

if [ -z "$version" ]; then
    echo "Error: Version argument is required."
    echo "Usage: ./deploy.sh <version>"
    exit 1
fi

gcloud auth application-default login

echo "Deployment started for project version: $version"

echo "$version" > version.txt

echo "Building project"

docker build -t websocket-server:$version .

docker tag websocket-server:$version asia.gcr.io/skunkworks-268706/poker-sizing-server:$version

docker push asia.gcr.io/skunkworks-268706/poker-sizing-server:$version

