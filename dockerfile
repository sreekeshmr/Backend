FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compile TypeScript
RUN npm run build

# Expose your app port
EXPOSE 3000

# Run the compiled server
CMD ["node", "dist/server.js"]
