# Use the builder stage to install dependencies and compile TypeScript
FROM node:16-slim AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) for installing dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy TypeScript configuration and source files
COPY tsconfig.json ./
COPY . .

# Compile TypeScript to JavaScript using npx to directly call tsc
RUN npx tsc

# Final stage: Install Chrome and copy built assets from the builder
FROM node:16-slim AS runtime

# Set the working directory in the runtime stage
WORKDIR /usr/src/app

# Install necessary libraries for Google Chrome
# The list of libraries is based on Puppeteer's documentation for running in Docker
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
    libxtst6 \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome Stable
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json again in the runtime for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built JavaScript files and other assets from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Set environment variable for Puppeteer to find Chrome
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome-stable

# Expose the port your app runs on
EXPOSE 3001

# Command to run your app
CMD ["node", "dist/index.js"]
