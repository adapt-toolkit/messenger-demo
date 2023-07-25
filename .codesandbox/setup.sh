docker login --username adaptframework --password="$DOCKER_PASSWORD"

id=$(docker create adaptframework/mufl:sha-4a396e3)
docker cp $id:/mufl /mufl
docker rm -v $id

cd /mufl && sh build-nodejs-modules.sh

cd /workspace/web && npm i

cd /workspace
