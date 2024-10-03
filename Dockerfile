# Use Node.js LTS version
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project directory into the container
COPY . .

# Expose port 3000
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
