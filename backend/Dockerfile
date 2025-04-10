FROM node:22

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the app code
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the Express server
CMD ["node", "server.js"]
