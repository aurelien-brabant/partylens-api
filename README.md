# Partylens API

## Requirements
- docker
- docker-compose
- make

## For frontend developers

The `make` command is now used to abstract all the `docker-compose` stuff.

`make frontend` or simply `make` will build and start the API with its postgres instance.

## For backend developers

Linux is recommended, otherwise filesystem binding may awfully slow down the Nest app.

`make dev` will start the API in watch mode, along with its normal postgres instance as well as a testing postgres instance.
`make test` can be then used to test the API.

## Api documentation

Proper documentation is generated by the `Swagger` tool which nicely integrates with NestJS. The documentation should be available at `/apidoc`.
