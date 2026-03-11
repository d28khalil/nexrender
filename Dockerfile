# Use Node.js 18 slim image
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy the entire project
# We'll rely on .dockerignore to skip node_modules and other junk
COPY . .

# Install dependencies and bootstrap the monorepo
# We run the full bootstrap to ensure all local package links are created
RUN npm install
RUN npm run bootstrap

# Expose the default nexrender-server port
EXPOSE 3000

# Start the server
CMD ["node", "packages/nexrender-server/src/bin.js", "--port", "3000"]
