FROM oven/bun:1

WORKDIR /app

COPY install.sh ./install.sh
COPY coolify/installer/server.ts ./coolify/installer/server.ts

ENV PORT=3000

EXPOSE 3000

CMD ["bun", "coolify/installer/server.ts"]
