FROM nginx:alpine

# Remove configuração padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa configuração customizada para dentro da imagem
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos da landing page para dentro da imagem
COPY public_html/ /usr/share/nginx/html/

EXPOSE 80
