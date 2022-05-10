#!/bin/bash
set -o allexport; source .env; set +o allexport

doctl compute droplet create --image $IMAGE_NAME --size $SIZE_NAME --region $REGION_NAME --ssh-keys $SSH_KEYS $DROPLET_NAME
echo "##################################################"
echo "## Getting Droplet IP, please wait 30 seconds... ##"
sleep 30
echo "##################################################"
echo "## Droplet additional info: ##"
doctl compute droplet get $DROPLET_NAME --no-header

IP_ADDRESS=`doctl compute droplet get $DROPLET_NAME --no-header --format PublicIPv4`

echo "Droplet IP address:$IP_ADDRESS"

ssh-keygen -R $IP_ADDRESS
SSH_OPTIONS="-o StrictHostKeyChecking=no -o ConnectionAttempts=60 -T"

echo "##################################################"
echo "## Waiting 30 seconds for Droplet boot ##"
sleep 30

echo "##################################################"
echo "#### apt update/upgrade && install compiler ####"
echo "##################################################"
ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
apt update 
apt upgrade -y
apt install gcc g++ make -y
echo "$PASSWORD" | sudo -S reboot now
EOF
# seems need to reboot to install build-essential 

echo "##################################################"
echo "## Waiting 30 seconds for Droplet boot ##"
sleep 30

echo "##################################################"
echo "#### apt update/upgrade && install compiler ####"
echo "##################################################"
ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
apt update 
apt upgrade -y
apt install build-essential -y
EOF


echo "##################################################"
echo "#### User creation... ####"
echo "##################################################"
ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
useradd -s /bin/bash -p "$PASSWORD" "$USER"
echo "$USER:$PASSWORD" | chpasswd
usermod -aG sudo $USER
mkdir -p /home/$USER
EOF

scp $HOME/.ssh/id_rsa.pub root@$IP_ADDRESS:/home/$USER/pub-ssh-key

ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
mkdir -p /home/$USER/.ssh/
touch /home/$USER/.ssh/authorized_keys
chown -R $USER:$USER /home/$USER/.ssh/
cat /home/$USER/pub-ssh-key >> /home/$USER/.ssh/authorized_keys
chown -R $USER:$USER /home/$USER
EOF


echo "##################################################"
echo "#### increase fs.inotify.max_user_watches and havegd ####"
echo "##################################################"
ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
apt install haveged -y
EOF


echo "##################################################"
echo "#### sshd_config and ufw rules ####"
echo "##################################################"
ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
sed -i 's/PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config
systemctl restart sshd
echo Port $SSH_PORT >> /etc/ssh/sshd_config

ufw default deny incoming
ufw default allow outgoing
ufw allow $SSH_PORT
ufw allow http
ufw allow https
echo "y" | sudo ufw enable
systemctl restart sshd
EOF


echo "##################################################"
echo "#### nginx ####"
echo "##################################################"
ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
apt install nginx -y
EOF


echo "##################################################"
echo "#### node and pm2 (for unix user 'node') ####"
echo "##################################################"
ssh $SSH_OPTIONS $USER@$IP_ADDRESS -p $SSH_PORT <<EOF
curl -L https://bit.ly/n-install | bash -s -- -y
. /home/node/.bashrc
n 14
npm install -g pm2
ssh-keygen
EOF



#(setup an id_rsa.pub and push the key to Github since this is a private repo and cannot be cloned without auth )
echo "##################################################"
echo "#### git clone and install coinos-cd ####"
echo "##################################################"
ssh $SSH_OPTIONS $USER@$IP_ADDRESS -p $SSH_PORT <<EOF
git clone git@github.com:coinos/coinos-cd.git
cd coinos-cd/app
npm install
node compile p
pm2 start --name=coinos-cd-app server.js
pm2 save

cd ../../
git clone git@github.com:coinos/coinos-tests.git
cd coinos-tests
npm install

cd ~/
wget https://github.com/digitalocean/doctl/releases/download/v1.72.0/doctl-1.72.0-linux-amd64.tar.gz
tar xf ~/doctl-1.72.0-linux-amd64.tar.gz 
EOF

#TODO: populate the DIGITALOCEAN_SSH_KEYS and setup doctl (or alternatively, setup via DO REST API instead of doctl CLI)


#use root to do some commands only root can do; 
#set pm2 to start on boot, move doct, ufw update for nginx, certbot install
#Puppeteer deps 
echo "##################################################"
echo "#### final root setup ####"
echo "##################################################"
ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
env PATH=$PATH:/home/node/n/bin /home/node/n/lib/node_modules/pm2/bin/pm2 startup systemd -u node --hp /home/node
mv ~/doctl /usr/local/bin
ufw allow 'Nginx Full'
cd /etc/nginx/conf.d
ln -s /home/node/coinos-cd/app/cd.coinos.cloud.vanilla.conf default.conf
rm /etc/nginx/sites-enabled/default 
service nginx restart
apt install certbot python3-certbot-nginx -y
certbot --nginx -d cd.coinos.cloud
apt-get install -y --no-install-recommends wget gnupg ca-certificates curl iputils-ping libxshmfence-dev \
&& wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
&& sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
&& apt-get update \
&& apt-get install -y --no-install-recommends google-chrome-stable \
&& rm -rf /var/lib/apt/lists/* \
&& wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
&& chmod +x /usr/sbin/wait-for-it.sh 
EOF


echo " "
echo "***************************************************************"
echo "* Coinos CD is deployed & Droplet is ready to login!"
echo "* User, IP address and port:"
echo "* $USER@$IP_ADDRESS -p $SSH_PORT"
echo "* https://$HOST_NAME"
echo "***************************************************************"

echo "## Droplet additional info: ##"
doctl compute droplet get $DROPLET_NAME --no-header