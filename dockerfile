# Use a base Node.js image
FROM node:slim

# Set the working directory inside the container
WORKDIR /app

COPY . /app

COPY package*.json ./

# Copy the entire project directory into the container
#COPY . .

# Install dependencies (if needed)
RUN npm install

# Expose any ports needed by your applications
EXPOSE 5500
EXPOSE 9000

RUN mkdir /Uploads

# Command to run both applications when the container starts
CMD ["node", "uploadDocAPI.js", "&", "node", "AuthAPI.js"]
#CMD node uploadDocAPI.js;
#CMD node AuthAPI.js;