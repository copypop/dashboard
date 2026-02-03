FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy project files
COPY . .

# Vite dev server
EXPOSE 5173
# Express API server
EXPOSE 8000

# Start both servers
CMD ["npm", "start"]
