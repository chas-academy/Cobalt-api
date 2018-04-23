FROM mhart/alpine-node:latest

ADD yarn.lock /yarn.lock
ADD package.json /package.json

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin

RUN addgroup -g 1000 -S node && \
    adduser -u 1000 -S node -G node

RUN yarn

WORKDIR /app
ADD . /app

EXPOSE 7770

CMD ["yarn", "start"]