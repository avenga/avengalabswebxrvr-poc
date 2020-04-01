FROM nginx:alpine
COPY index.html /usr/share/nginx/html
COPY main.css /usr/share/nginx/html
COPY favicon.ico /usr/share/nginx/html
COPY dist /usr/share/nginx/html/dist
COPY node_modules /usr/share/nginx/html/node_modules
COPY resources /usr/share/nginx/html/resources
