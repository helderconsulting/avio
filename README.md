## Requirements

- [Docker](https://www.docker.com/)
- [nvm](https://github.com/nvm-sh/nvm)

## Getting started

- Use `nvm use` to switch to the correct Node.js version, or run `nvm install` if the version isn't already installed.
- Make sure docker is running and use `docker compose up -d` to spin up mongodb
- Install the dependencies `npm i` then run `npm run dev`
- open `http://localhost:3000` to access the swagger page

## Testing

- Make sure docker is running because some tests are using test containers
