FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy app files
COPY . .

# Run the script
CMD ["node", "submit-idea.js"]
