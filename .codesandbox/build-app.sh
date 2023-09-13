#!/bin/bash

cd /workspace/web && export __BROKER_ADDRESS__='wss://messenger-demo.adaptframework.solutions/broker' && npm run build && npm run start
