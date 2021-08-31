# Partylens API

## For front-end developers

In case you need to play with the API while building the backend, here are the instructions to launch an instance of
the API along a postgres database instance:

### Requirements

- `docker`
- `docker-compose`

### Run!

FIRST, don't forget to `yarn install`. If you're on Linux, you can install from inside the docker container using
`docker exec -it backend-api yarn install` *after* docker-compose did its things. 

If you're not on Linux however, **install yarn and run the above install command**...
Unless you want to wait forever for it to complete when inside the docker container.

```shell
docker-compose up -d
```

If everything went well, the API should be exposed on port `5000` by default (as defined in the `.env` file you can freely edit).

### A few useful things

`-d` makes the cluster run in the background, remove it if you want the logs to be continuously outputed on the terminal.

Check out `docker-compose logs`, `docker-compose ps`, these are going to become pretty useful.

### Seeding database

If you want to seed the database with random users and parties, you can:

The docker way:
```shell
docker exec -it backend-api yarn seed
```

Don't forget to check out the available options:

```shell
docker exec -it backend-api yarn seed --help
```
