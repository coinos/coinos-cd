#!/bin/bash

DROPLET_NAME="coinos"
REGION_NAME="sfo3"
SIZE_NAME="s-1vcpu-2gb"
IMAGE_NAME="ubuntu-20-04-x64"
SSH_KEYS="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx"
USER="node"
PASSWORD="xxxxxxxxx"
SSH_PORT="729"

doctl compute droplet create --image $IMAGE_NAME --size $SIZE_NAME --region $REGION_NAME --ssh-keys $SSH_KEYS $DROPLET_NAME
echo "##################################################"
echo "## Getting Droplet IP, please wait 30 seconds... ##"
sleep 30
echo "##################################################"
echo "## Droplet additional info: ##"
doctl compute droplet get $DROPLET_NAME --no-header

IP_ADDRESS=`doctl compute droplet get $DROPLET_NAME --no-header --format PublicIPv4`

ssh-keygen -R $IP_ADDRESS
SSH_OPTIONS="-o StrictHostKeyChecking=no -o ConnectionAttempts=60 -T"

echo "##################################################"
echo "## Waiting 30 seconds for Droplet boot ##"
sleep 30

echo "##################################################"
echo "#### apt update/upgrade && install compiler ####"
ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
apt update 
apt upgrade -y
apt install gcc g++ make -y
EOF

echo "##################################################"
echo "#### User creation... ####"
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
ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
apt install haveged
EOF


echo "##################################################"
echo "#### Docker and docker-compose installation #### "
ssh $SSH_OPTIONS root@$IP_ADDRESS <<EOF
apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
apt install docker-ce -y
usermod -aG docker $USER
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
EOF

echo "##################################################"
echo "#### sshd_config and ufw rules ####"
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
echo "#### clone coinos-server ####"
ssh $SSH_OPTIONS $USER@$IP_ADDRESS -p $SSH_PORT <<EOF
git clone https://github.com/coinos/coinos-server.git
cd coinos-server
ls
echo "$PASSWORD" | sudo -S reboot now
EOF

echo " "
echo "***************************************************************"
echo "* Droplet is rebooting & will be ready to login to momentarily!"
echo "* User, IP address and port:"
echo "* $USER@$IP_ADDRESS -p $SSH_PORT"
echo "***************************************************************"