FROM node:lts

# Create a work directory
WORKDIR "/app"

# Copy package json files
COPY "./package.json" "./"
COPY "./package.json" "./"

# Install the node dependencies
# Enabled verbose mode to see whats happening
RUN npm install --loglevel verbose

# This will copy all file, except the file mention in .dockerignore
COPY "./" "./"

RUN npm run build