#!/bin/bash

# Create a new Docker container from the image and initiate a persistent process within the container
id=$(docker run -d adaptframework/devkit:release-0.2 "tail -f /dev/null")

# Transfer the MUFL code into the Docker container
docker cp ./mufl_code $id:/mufl_code

# Execute the Docker container with the command to compile the MUFL code
docker exec $id bash -c "cd /mufl_code/ && MUFL_STDLIB_PATH=/mufl/mufl_stdlib /mufl/bin/mufl-compile -mp /mufl/meta -mp /mufl/transactions ./actor.mu"
#                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ observe here that we are defining the environment variable for our configuration script

# Retrieve the compiled MUFL file back from the Docker container to the local machine
docker cp $id:/mufl_code ./

# Terminate the container after compilation
docker stop $id

# Erase the container
docker rm $id

