# Build Stage
FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production Stage
FROM node:22-alpine

WORKDIR /app

# Install serve to run the application
RUN npm install -g serve

# Copy build output from build stage
COPY --from=build /app/dist /app/build

# Expose port
EXPOSE 3000

# Start command
CMD ["serve", "-s", "build", "-l", "3000"]
