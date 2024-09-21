# Use Node.js 18 or 20 instead of 16
FROM node:18

# Set the working directory inside the Docker container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code into the container
COPY . .

# Expose the port that your app will run on
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
