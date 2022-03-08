#!/bin/bash

DROPLET_NAME="test"
REGION_NAME="sfo3"
SIZE_NAME="s-1vcpu-2gb"
IMAGE_NAME="ubuntu-20-04-x64"
SSH_KEYS="0d:56:a2:b5:f5:9d:2f:5a:e2:9b:28:f7:72:ae:0a:db"

doctl compute droplet create --image $IMAGE_NAME --size $SIZE_NAME --region $REGION_NAME --ssh-keys $SSH_KEYS $DROPLET_NAME
echo "Getting Droplet IP, please wait 30 seconds..."
sleep 30
echo "Droplet additional info:"
doctl compute droplet get $DROPLET_NAME --no-header

IP_ADDRESS=`doctl compute droplet get $DROPLET_NAME --no-header --format PublicIPv4`

ssh-keygen -R $IP_ADDRESS
SSH_OPTIONS="-o StrictHostKeyChecking=no -o ConnectionAttempts=60"

echo "Waiting 30 seconds for Droplet boot"
sleep 30

ssh $SSH_OPTIONS root@$IP_ADDRESS "echo Port 729 >> /etc/ssh/sshd_config && systemctl restart sshd"

echo "*****************************"
echo "* Droplet is ready to use!"
echo "* IP address: $IP_ADDRESS"
echo "*****************************"