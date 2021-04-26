FROM node:14
WORKDIR /game

# Only re-install node modules if dependencies change
# If package.json and yarn.lock have no file changes, docker can
# use the cached results!
COPY ["package.json", "yarn.lock", "./"]
RUN yarn
COPY ["rollup.config.js", "tsconfig.json", "src", "./"]

EXPOSE 10001
ENTRYPOINT ["yarn", "dev"]
