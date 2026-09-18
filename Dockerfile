# --- Stage 1: Build the React application ---
FROM node:22-alpine AS build

WORKDIR /app

# Install build-time dependencies
RUN apk add --no-cache python3 py3-pip make g++ cairo-dev pango-dev giflib-dev libjpeg-turbo-dev freetype-dev libtool autoconf

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .pnp.* ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html 

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
