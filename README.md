## Coinos CD

----

### Deploy Droplet

#### setup 
- install DigitalOcean API client: 
https://docs.digitalocean.com/reference/doctl/how-to/install/
- token from: 
  https://cloud.digitalocean.com/account/api/tokens

and run the following command, and paste in your your token when it prompts: 

`doctl auth init`

#### run 
`doctl compute ssh-key list`

then paste the `FingerPrint` of your system as shown into the `SSH_KEYS` value in `deploy-droplet.sh` 

Other options: 
```
DROPLET_NAME="test"
REGION_NAME="sfo3"
SIZE_NAME="s-1vcpu-2gb"
IMAGE_NAME="ubuntu-20-04-x64"
SSH_KEYS="(your fingerprint)"
```

To create the new Droplet, run `deploy-droplet.sh`

```bash
./deploy-droplet.sh
.....
*****************************
* Droplet is ready to use!
* IP address: 143.244.187.249
*****************************

ssh root@143.244.187.249 #login to your new droplet
```