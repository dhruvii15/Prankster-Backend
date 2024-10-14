# Use a newer Node runtime as the parent image
FROM node:20

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

# Bundle app source inside the docker image
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable
ENV NODE_ENV=production

# Run app.js using nodemon when the container launches
CMD ["nodemon", "app.js"]