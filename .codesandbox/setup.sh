if [ ! -d "/mufl" ]; then
    id=$(docker create adaptframework/devkit:release-0.2)
    docker cp $id:/mufl /mufl
    docker rm -v $id
fi

cd /mufl && sh build-nodejs-modules.sh

cd /workspace/web && npm i

cd /workspace
