FROM node:16-alpine
RUN apk --no-cache add git
WORKDIR /source/auth
COPY ./package.json ./package.json
COPY ./index.js ./index.js
COPY ./lib ./lib
RUN npm install --only=production

ENV NODE_PATH=/source/auth
ENV LOG_LEVEL=info
ENV PORT=80
ENV USERNAME=admin
ENV PASSWORD=admin
EXPOSE 80
CMD ["sh", "-c", "node index.js"]