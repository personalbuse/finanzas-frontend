# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf && \
    printf 'server {\n\
    listen 3000;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    include /etc/nginx/mime.types;\n\
\n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_comp_level 6;\n\
    gzip_min_length 256;\n\
    gzip_types application/javascript application/json text/css text/html image/svg+xml;\n\
\n\
    add_header X-Frame-Options "SAMEORIGIN" always;\n\
    add_header X-Content-Type-Options "nosniff" always;\n\
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\
\n\
    location /assets/ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    location /sw.js {\n\
        add_header Cache-Control "no-cache";\n\
    }\n\
\n\
    location = /index.html {\n\
        add_header Cache-Control "no-cache, no-store, must-revalidate";\n\
    }\n\
\n\
    location /locales/ {\n\
        expires -1;\n\
        add_header Cache-Control "no-cache, no-store, must-revalidate";\n\
    }\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]