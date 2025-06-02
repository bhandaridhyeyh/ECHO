FROM node:18 

WORKDIR /app 

COPY package*.json ./  
RUN npm install  

COPY . . 

CMD ["npx", "nodemon", "src/index.js"]
