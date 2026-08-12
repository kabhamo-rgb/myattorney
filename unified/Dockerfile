# MyAttorney / קו-הדין — single-image deploy (builds frontend, serves via Express)
FROM node:22-alpine AS build
WORKDIR /app

# Install frontend deps and build the static site
COPY app/package*.json ./app/
RUN cd app && npm install --no-audit --no-fund
COPY app ./app
RUN cd app && npm run build

# Install server deps
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev --no-audit --no-fund
COPY server ./server

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Copy built frontend + server + server node_modules
COPY --from=build /app/app/dist ./app/dist
COPY --from=build /app/server ./server

EXPOSE 4000
WORKDIR /app/server
CMD ["node", "index.js"]
