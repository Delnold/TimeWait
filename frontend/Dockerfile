# Stage 1: Development stage
FROM node:16 AS development

WORKDIR /app

# Copy dependency definitions and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose port 3000 for development
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]

# Stage 2: Build the React app
FROM node:16 AS build

WORKDIR /app

# Copy dependency definitions and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build the app for production
RUN npm run build

# Stage 3: Production stage
FROM nginx:alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Copy the production build from the build stage to Nginx's html folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to match the docker-compose port mapping
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
