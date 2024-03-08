FROM node:16-slim as builder

# Set the working directory in the builder stage
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for npm install
COPY package*.json ./

# Install dependencies, including 'typescript' and any other build tools
RUN npm install

# Copy your TypeScript configuration file and source files
COPY tsconfig.json ./
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc

# Use a fresh image to reduce size
FROM node:16-slim

# Set the working directory in the production image
WORKDIR /usr/src/app

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxshmfence-dev \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libgcc1 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libxtst6

# Copy package.json and package-lock.json for npm ci --only=production
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled JavaScript from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port the app runs on
EXPOSE 3001

# Adjust the CMD to point to your compiled main JavaScript file
CMD ["node", "dist/index.js"]
