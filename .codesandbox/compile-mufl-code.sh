#!/bin/bash

cd /workspace/mufl_code/ && MUFL_STDLIB_PATH=/mufl/mufl_stdlib /mufl/bin/mufl-compile -mp /mufl/meta -mp /mufl/transactions ./actor.mu
