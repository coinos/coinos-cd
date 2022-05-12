### Deploy Droplet

This is a procedure for deploying a new Coinos-ready Digital Ocean Droplet.   You will perform these commands on your own system with help of DigitalOcean's API client. 

#### setup
- install DigitalOcean API client: 
https://docs.digitalocean.com/reference/doctl/how-to/install/
- Create a 'Personal Access token' from: 
  https://cloud.digitalocean.com/account/api/tokens
- Make sure the machine you will run this on has a public/private SSH keypair and that the public key is added to Digital Ocean: 
https://cloud.digitalocean.com/account/security


#### first run 

First do the following command on your machine: 

`doctl auth init`

when/if prompted, paste a token from **Personal access tokens** section of your [cloud.digitalocean.com/account/api/tokens]

then: 

`doctl compute ssh-key list`


and copy the `FingerPrint` of the key that corresponds to your current machine.  

Paste it into the `SSH_KEYS` value in your `.env`  
(after duplicating the file `.env.sample` to `.env`)

#### to deploy a Droplet

edit the values of your `.env` file which set the Droplet's name, region, host domain, subdomain and other values. 
```
DROPLET_NAME="coinos-stager00"
HOST_NAME="stager00.coinos.cloud"
SUBDOMAIN="stager00"
BRANCH_NAME="master"
REGION_NAME="sfo3"
SIZE_NAME="s-4vcpu-8gb"
IMAGE_NAME="ubuntu-20-04-x64"
SSH_KEYS="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx"
USER="node"
PASSWORD="XXXXXXXXXXXXXXXXXX"
SSH_PORT="729"
DROPLET_ID=""
PROJECT_ID=""
IP_ADDRESS=""
```

(DROPLET_ID and IP_ADDRESS should be entered manually after Droplet creation if you will either destroy it or create a subdomain for it)

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

#### to assign the Droplet to a Project

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


#### to put the Droplet at a subdomain

Run `./create-subdomain.sh` to create a subdomain; ensuring the `SUBDOMAIN` you want and `IP_ADDRESS` of the Droplet you created are specified in your .env file (the latter requires updating `.env` with the IP address indicated in the output from the deploy-droplet script) 


#### notes

[List of slugs] (names) for the various Droplet sizes

[cloud.digitalocean.com/account/api/tokens]:https://cloud.digitalocean.com/account/api/tokens
[List of slugs]:https://slugs.do-api.dev/