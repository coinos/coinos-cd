#!/bin/bash
set -o allexport; source .env; set +o allexport

SSH_OPTIONS="-o StrictHostKeyChecking=no -o ConnectionAttempts=60 -T"

echo "##################################################"
echo "#### apt update/upgrade && install compiler ####"
echo "#### and user creation... ####"
echo "##################################################"
ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
apt update 
apt upgrade -y
apt install gcc g++ make -y
apt install git -y

useradd -s /bin/bash -p "$PASSWORD" "$USER"
echo "$USER:$PASSWORD" | chpasswd
usermod -aG sudo $USER
mkdir -p /home/$USER
EOF

echo "##################################################"
echo "#### finalize user... ####"
echo "##################################################"

scp $HOME/.ssh/id_rsa.pub root@$IP_ADDRESS:/home/$USER/pub-ssh-key

ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
mkdir -p /home/$USER/.ssh/
touch /home/$USER/.ssh/authorized_keys
chown -R $USER:$USER /home/$USER/.ssh/
cat /home/$USER/pub-ssh-key >> /home/$USER/.ssh/authorized_keys
chown -R $USER:$USER /home/$USER
EOF

#should now be able to login with just standard user...

echo "##################################################"
echo "#### increase fs.inotify.max_user_watches and havegd ####"
echo "#### and Docker and docker-compose installation ####"
echo "#### and sshd_config and ufw rules ####"
echo "##################################################"
ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf && sudo sysctl -p
apt install haveged -y
apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
apt install docker-ce -y
usermod -aG docker $USER
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
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
echo "#### clone coinos-server & install ####"
echo "##################################################"
ssh $SSH_OPTIONS $USER@$IP_ADDRESS -p $SSH_PORT <<EOF
git config --global user.name "abc"
git config --global user.email "abc@example.com"
git clone https://github.com/coinos/coinos-ui.git
cd coinos-ui
git checkout -b $BRANCH_NAME
git branch --set-upstream-to=origin/$BRANCH_NAME $BRANCH_NAME
git pull
docker build -t coinos-ui-staging:0.1.0 -f Dockerfile.stage .
cd ..
git clone https://github.com/coinos/coinos-server.git
cd coinos-server
git checkout -b $BRANCH_NAME
git branch --set-upstream-to=origin/$BRANCH_NAME $BRANCH_NAME
git pull
docker build -t coinos-server-staging:0.0.1 -f staging.Dockerfile .
cp -rf sampleconfig ./config
cp config/nginx/default.conf.template config/nginx/default.conf
cp .env.sample .env
cp fx.sample fx
docker network create net
docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.staging.yml up -d
sleep 10
docker exec bitcoin bitcoin-cli -regtest -rpcuser=admin1 -rpcpassword=123 createwallet coinos
docker cp ./db/schema.sql mariadb:/
docker exec mariadb /bin/sh -c 'mysql -u root -ppassword < /schema.sql'
base64 config/lnd/tls.cert > config/lnd/tlscert.txt
echo "HOST=$HOST_NAME" >> .env
sleep 10
docker exec lnd chmod +x /root/.lnd/lncli-create.exp
docker exec lnd apk add expect
docker exec lnd /root/.lnd/lncli-create.exp
sleep 10
cp config/lnd/lnd.conf.unlocked config/lnd/lnd.conf
docker-compose down --remove-orphans
cd ../coinos-ui
docker run -v /home/node/coinos-ui/dist:/dist coinos-ui-staging:0.1.0 bash -c 'cd app; pnpm stage; cp -rf dist/* /dist'
cd ../coinos-server
docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.staging.yml up -d
sleep 10
echo "$PASSWORD" | sudo -S base64 config/lnd/data/chain/bitcoin/regtest/admin.macaroon > config/lnd/macaroon.txt
docker restart lnd
sleep 10
docker restart app
EOF

echo "***************************************************************"
echo "* Coinos is deployed!"
