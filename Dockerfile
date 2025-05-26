FROM node:18-slim

RUN apt-get update && \
    apt-get install -y ffmpeg python3-pip && \
    pip3 install yt-dlp && \
    apt-get clean

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "start"]
