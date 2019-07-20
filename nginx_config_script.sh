#!/bin/bash

# Delete default server code
sed -i  '21, $d'  /etc/nginx/sites-available/default

server_code='server {
        listen 80 default_server;
        listen [::]:80 default_server;
        # SSL configuration
        #...
        root /var/www/html;
        index index.php index.html index.htm index.nginx-debian.html;
        server_name;
        location / {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
        location /phpmyadmin {
        }
        location /frontend {
               proxy_pass http://localhost:3001;
               proxy_http_version 1.1;
               proxy_set_header Upgrade $http_upgrade;
               proxy_set_header Connection ’upgrade’;
               proxy_set_header Host $host;
               proxy_cache_bypass $http_upgrade;
        }
        location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        root /usr/share/;
        fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
        }
        location ~ \.(.+\.(jpg|jpeg|gif|css|png|js|ico|html|xml|txt))$ {
        root /usr/share/phpmyadmin;
        }
        location ~ /\.ht {
        deny all;
        }
}'

# Append server code
echo "$server_code" >> /etc/nginx/sites-available/default

# Change ip address
echo -n "Enter ip address: "
read ip_address
sed -i "/server_name/c\        server_name $ip_address;" /etc/nginx/sites-available/default
