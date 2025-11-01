FROM node:20.19.0-alpine

WORKDIR /app

ARG JWT_TOKEN
ARG NEST_URL
ENV JWT_TOKEN=$JWT_TOKEN
ENV NEST_URL=$NEST_URL

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN echo "JWT_TOKEN: $JWT_TOKEN" && echo "NEST_URL: $NEST_URL"
RUN npm run build:prod

EXPOSE $PORT

CMD ["npx", "http-server", "dist/angular-client/browser", "-p", "$PORT", "-a", "0.0.0.0", "--spa"]