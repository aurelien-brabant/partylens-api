#! /bin/sh

# Requires the nest cli (@nestjs/cli package)

nest g module "$1"

mkdir src/$1/controller src/$1/dto src/$1/service
