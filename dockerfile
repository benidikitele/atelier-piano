#Étape 1: compiler Angular
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

#Étape 2 : Servir les fichiers compilés
FROM nginx:stable-alpine

COPY nginx.config /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/dist/atelier-piano/browser usr/share/nginx/html

EXPOSE 80

CMD [ "nginx", "-g", "deamon off;" ]