FROM node:24

WORKDIR /app

COPY .output ./.output

ENV PORT=3001
ENV HOST=0.0.0.0

EXPOSE 3001

ENTRYPOINT ["node", ".output/server/index.mjs"]
