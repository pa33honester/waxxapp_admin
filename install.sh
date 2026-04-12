#!/bin/bash

# Update and clear screen
sudo apt update && clear

# Get public IP address
get_public_ip=$(wget -T 10 -t 1 -4qO- "http://ip1.dynupdate.no-ip.com/" || curl -m 10 -4Ls "http://ip1.dynupdate.no-ip.com/" | grep -m 1 -oE '^[0-9]{1,3}(\.[0-9]{1,3}){3}$')
read -p "Public IPv4 address / hostname [$get_public_ip]: " public_ip
until [[ -n "$get_public_ip" || -n "$public_ip" ]]; do
    echo "Invalid input."
    read -p "Public IPv4 address / hostname: " public_ip
done
[[ -z "$public_ip" ]] && public_ip="$get_public_ip"
clear

# Update and clear screen
sudo apt update
sudo apt upgrade -y
clear

# Install Node.js
echo "
################################################
#                INSTALL NODEJS                #
################################################
"
sudo apt install curl -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install v18.20.2
node -v

# Set up application configuration
read -p "Your sub-domain (admin.yourdomain.com): " your_domain

read -p "Your app name: " app_name

read -p "Your resend email: " resend_email

# Mongodb User Name
mongodbUser_name=$(echo "$app_name" | tr '[:upper:]' '[:lower:]' | tr -d ' ')

get_shared_secret_key="5TIvw5cpc0"
read -p "Shared Secret key [5TIvw5cpc0]: " shared_secret_key
[[ -z "$shared_secret_key" ]] && shared_secret_key="$get_shared_secret_key"

get_shared_jwt_secret="2FhKmINItB"
read -p "Shared Jwt Secret [2FhKmINItB]: " shared_jwt_secret
[[ -z "$shared_jwt_secret" ]] && shared_jwt_secret="$get_shared_jwt_secret"

clear

# Install Nginx
echo "
################################################
#                INSTALL NGINX                 #
################################################
"
sudo apt install -y nginx
sudo systemctl status nginx
clear

# Configure Nginx
echo "
################################################
#                CONFIGURE NGINX               #
################################################
"
sudo cat > /etc/nginx/sites-available/default << EOF
server {
    server_name $your_domain www.$your_domain;
    client_max_body_size 300M;
    access_log /var/log/nginx/$mongodbUser_name.access.log;  #whatever your server name
    error_log /var/log/nginx/$mongodbUser_name.error.log;   #whatever your server name
    root /path;
    location / {
        proxy_pass http://localhost:5000;   #whatever port your app runs on
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_redirect off;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forward-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forward-Proto http;
        proxy_set_header X-Nginx-Proxy true;     
    }
}
EOF
sudo systemctl restart nginx
sudo systemctl status nginx
clear

# Secure Nginx with Let's Encrypt 
echo "
################################################
#      Secure Nginx with Let's Encrypt         #
################################################
"
cd ../..
sudo snap install core; sudo snap refresh core
sudo apt remove certbot
sudo snap install --classic certbot
sudo systemctl reload nginx
sudo certbot --nginx -d $your_domain
clear

# Install PM2
echo "
################################################
#                INSTALL PM2                   #
################################################
"
sudo apt install npm -y
npm install pm2 -g
clear

# Install MongoDB
echo "
################################################
#                INSTALL MONGODB               #
################################################
"

# Install prerequisites
apt install -y software-properties-common gnupg apt-transport-https ca-certificates curl

# Add MongoDB 8.0 GPG key and APT repository
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc \
  | gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" \
  > /etc/apt/sources.list.d/mongodb-org-8.0.list

# Update package list and install MongoDB
apt update -y
apt install -y mongodb-org

# Check version and start MongoDB
mongod --version || true
systemctl enable --now mongod
sleep 6
systemctl status mongod --no-pager || true
ss -pnltu | grep 27017 || true

# ===== Create MongoDB Admin User with readWrite on app DB =====
echo "
################################################
#         CREATE MONGODB ADMIN + APP ROLE      #
################################################
"

# Replace $mongodbUser_name with the actual variable if using in script
cat <<EOF | mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "dbadmin123",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWrite", db: "${mongodbUser_name}" }
  ]
})
EOF

# ===== Enable MongoDB Authentication and Bind Public IP =====
echo "
################################################
#     ENABLE AUTH AND BIND TO PUBLIC IP        #
################################################
"

# Remove any existing security block
sed -i '/^#*security:/d' /etc/mongod.conf

# Add authorization under security
awk '1; END{print "security:\n  authorization: enabled"}' /etc/mongod.conf > /etc/mongod.conf.new && mv /etc/mongod.conf.new /etc/mongod.conf

# Bind to localhost and public IP
if grep -q 'bindIp:' /etc/mongod.conf; then
  sed -i "s/^ *bindIp: .*/  bindIp: 127.0.0.1,${public_ip}/" /etc/mongod.conf
else
  sed -i "/^net:/a\  bindIp: 127.0.0.1,${public_ip}" /etc/mongod.conf
fi

# Restart MongoDB with new config
systemctl restart mongod
sleep 5
systemctl status mongod --no-pager || true
clear

# Install and start Redis
echo "
################################################
#                INSTALL REDIS                 #
################################################
"
sudo apt update
sudo apt install -y redis-server

# Enable supervised mode for systemd (better stability)
sudo sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf

# Restart and enable Redis service
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Test Redis is working
redis-cli ping

# Install backend dependencies
echo "
################################################
#                INSTALL BACKEND               #
################################################
"
cd /home/admin/backend || exit
npm install
cat > config.js << EOF
module.exports = {
  //Port
  PORT: 5000,

  //Gmail credentials for send email
  EMAIL: "$resend_email",

  //Secret key for jwt
  JWT_SECRET: "$shared_jwt_secret",

  //Project Name
  projectName : "$app_name",

  //baseURL
  baseURL: "https://$your_domain/",

  //Secret key for API
  secretKey: "$shared_secret_key",

  //Mongodb string
  MONGODB_CONNECTION_STRING: "mongodb://admin:dbadmin123@${public_ip}:27017/${mongodbUser_name}?authSource=admin"
};
EOF
cd /home/admin/backend || exit
pm2 start index.js --name backend
pm2 status
node -v
pm2 restart backend --interpreter $(which node)

# Install frontend dependencies and build
echo "
################################################
#                INSTALL FRONTEND              #
################################################
"
cd /home/admin/frontend/src/util || exit
cat > config.js << EOF
export const baseURL = "https://$your_domain/";
export const secretKey = "$shared_secret_key";
export const projectName = "$app_name";
EOF
echo $PATH
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin"
source ~/.bashrc
nvm install node
npm install --f
echo $PATH
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin"
source ~/.bashrc
nvm install node
npm run build
# Ensure the public directory exists before moving build files
if [ ! -d "/home/admin/backend/public" ]; then
  echo "Creating /home/admin/backend/public directory..."
  sudo mkdir -p /home/admin/backend/public
fi
sudo mv /home/admin/frontend/build/* /home/admin/backend/public

echo $PATH
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin"
source ~/.bashrc
nvm install node
node -v
pm2 restart backend --interpreter $(which node)

echo "
################################################
#                CONGRATULATIONS!              #
################################################
Server setup is complete.
1. baseURL : https://$your_domain/
2. Secret key : $shared_secret_key
3. MONGODB_CONNECTION_STRING: "mongodb://admin:dbadmin123@${public_ip}:27017/${mongodbUser_name}?authSource=admin"
"