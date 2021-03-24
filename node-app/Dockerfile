FROM node:14-alpine

RUN apk update 

RUN apk add --upgrade coreutils

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

#add only the package.json that way npm install will only execute if the file is changed
ADD package.json /usr/src/app/package.json

RUN npm install

RUN touch /usr/src/app/.env

#now add all files to have the latest in the container
ADD . /usr/src/app

CMD [ "npm", "start" ]
