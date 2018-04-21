FROM mydockersolutions/img:latest
ADD ./app.js ./
ADD ./image-downloader.sh ./
ADD ./node_modules/ ./node_modules/
ENV NODE_ENV production
EXPOSE 8080
CMD ["node", "app.js"]
