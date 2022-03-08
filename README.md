## Coinos CD

----

### Deploy Droplet

This is a procedure for deploying a new Digital Ocean Droplet.   You will perform these commands on your own system with help of DigitalOcean's API client. 

#### setup
- install DigitalOcean API client: 
https://docs.digitalocean.com/reference/doctl/how-to/install/
- Create a 'Personal Access token' from: 
  https://cloud.digitalocean.com/account/api/tokens
- Make sure the machine you will run this on has a public/private SSH keypair and that the public key is added to Digital Ocean: 
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
USER="node"
PASSWORD="(set a secure password here)"
SSH_PORT="729"
```

Then make sure you have your machine's public key added to the file `pub-ssh-key` in this repo.  

Finally, to create the new Droplet, run `deploy-droplet.sh`

ex: 

```bash
./deploy-droplet.sh
# .....
# various output...
# .....
****************************************************************
*  Droplet is rebooting & will be ready to login to momentarily!
*  User, IP address and port: 
*  node@143.244.187.249 -p 729
****************************************************************
```

#### assign to Project

To assign the new Droplet to a Digital Ocean Project (ie- to share with your team) copy the Droplet's ID from the initial output of this script (under `## Droplet additional info:`) and edit `assign-droplet.sh` with that value 

```
DROPLET_ID="333333333"
PROJECT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```
  
as well as your Project's ID which is available by doing: 
  
```bash
doctl projects list
```
  
and then run: 
  
`./assign-droplet.sh`


[cloud.digitalocean.com/account/api/tokens]:https://cloud.digitalocean.com/account/api/tokens