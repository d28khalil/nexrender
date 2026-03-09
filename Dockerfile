# Use Node.js 18 slim image
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files for the root and all packages
COPY package*.json ./
COPY lerna.json ./
COPY packages/nexrender-server/package*.json ./packages/nexrender-server/
COPY packages/nexrender-types/package*.json ./packages/nexrender-types/
COPY packages/nexrender-database-redis/package*.json ./packages/nexrender-database-redis/

# Install dependencies and bootstrap the monorepo
# We use --production to keep the image small, but lerna bootstrap 
# might need devDeps depending on the setup. 
RUN npm install --omit=dev
RUN npx lerna bootstrap --hoist -- --omit=dev

# Copy the rest of the source code
COPY . .

# Expose the default nexrender-server port
EXPOSE 3000

# Start the server
# Note: We use the relative path to the bin.js in the server package
CMD ["node", "packages/nexrender-server/src/bin.js", "--port", "3000"]
