#!/bin/bash

REACT_APP_MUFLO_CODE_HASH=$(ls -t ../mufl_code/*.muflo | head -n 1 | xargs basename | sed 's/\.muflo$//')

echo "REACT_APP_MUFLO_CODE_HASH = \"$REACT_APP_MUFLO_CODE_HASH\"" > .env

echo "REACT_APP_BROKER_ADDRESS = \"$__BROKER_ADDRESS__\"" >> .env