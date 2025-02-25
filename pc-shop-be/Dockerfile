# # Use an official Node.js runtime as the base image
# FROM node:18

# # Set the working directory in the container
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install NestJS CLI globally
# RUN npm install -g @nestjs/cli

# # Install dependencies
# RUN npm install --force
# RUN npm rebuild bcrypt --build-from-source

# #Clean installation
# RUN npm ci --omit=dev

# # Copy the rest of the application code
# COPY . .

# # Build the NestJS application
# RUN npm run build

# # Expose the port your app runs on
# EXPOSE 8080

# # Start the application
# CMD ["npm", "run", "start:dev"]