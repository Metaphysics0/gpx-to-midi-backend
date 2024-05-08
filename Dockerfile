
# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.0.6
FROM oven/bun:${BUN_VERSION} as base

RUN mkdir /temp

LABEL fly_launch_runtime="Bun"
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM install AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
# RUN bun test
# RUN bun run build


ENV PATH_TO_EXECUTE_FUNCTION="/scripts/script-osx"
ENV PATH_TO_TEMP_FOLDER="/temp"
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/ .

USER root
RUN chmod 755 /usr/src/app/scripts/script-linux
RUN chmod 755 /usr/src/app/scripts/script-osx
RUN chmod 755 /usr/src/app/temp
RUN chown -R bun:bun .


EXPOSE 3002/tcp
ENTRYPOINT [ "bun", "run", "src/index.ts"]
