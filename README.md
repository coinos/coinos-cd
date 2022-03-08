## Coinos CD

----

### Deploy Droplet

This is a procedure for deploying a new Digital Ocean Droplet.   You will perform these commands on your own system with help of DigitalOcean's API client. 

#### setup
- install DigitalOcean API client: 
https://docs.digitalocean.com/reference/doctl/how-to/install/
- Create a 'Personal Access token' from: 
  https://cloud.digitalocean.com/account/api/tokens
- Make sure your machine you will run this on has an SSH key added to Digital Ocean: 
https://cloud.digitalocean.com/account/security


#### run 

First do the following command on your machine: 

`doctl auth init`

when/if prompted, paste a token from **Personal access tokens** section of your [cloud.digitalocean.com/account/api/tokens]

then: 

`doctl compute ssh-key list`


and copy the `FingerPrint` of the key that corresponds to your current machine.  

Paste it into the `SSH_KEYS` value in `deploy-droplet.sh` 

and edit the values of the other options, such as the Droplet's name and region: 
```
DROPLET_NAME="test"
REGION_NAME="sfo3"
SIZE_NAME="s-1vcpu-2gb"
IMAGE_NAME="ubuntu-20-04-x64"
SSH_KEYS="(your fingerprint)"
```

Finally, to create the new Droplet, run `deploy-droplet.sh`

ex: 

```bash
./deploy-droplet.sh
.....
*****************************
* Droplet is ready to use!
* IP address: 143.244.187.249
*****************************

ssh root@143.244.187.249 #login to your new droplet !
```

[cloud.digitalocean.com/account/api/tokens]:https://cloud.digitalocean.com/account/api/tokens