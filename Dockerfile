# Step 1: Use an official Node.js runtime as a parent image
FROM node:16-slim as builder

# Set the working directory in the builder stage
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for npm install
COPY package*.json ./

# Install dependencies, including 'typescript' and any other build tools
RUN npm install

# Copy your TypeScript configuration file
COPY tsconfig.json ./

# Copy your actual project files (ensure you include all necessary files)
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Step 2: Use a fresh image to reduce size
FROM node:16-slim as builder

# Set the working directory in the production image
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for npm ci --only=production
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled JavaScript from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port the app runs on
EXPOSE 3001

# Adjust the CMD to point to your compiled main JavaScript file
CMD ["node", "dist/api/index.js"]
