## Coinos CD

----

### Deploy Droplet

#### setup 
- install DigitalOcean API client: 
https://docs.digitalocean.com/reference/doctl/how-to/install/
- token from: 
  https://cloud.digitalocean.com/account/api/tokens
  Personal access tokens > paste command "doctl auth init"

Then change please variables on deploy-droplet.sh

```
DROPLET_NAME="test"
REGION_NAME="sfo3"
SIZE_NAME="s-1vcpu-2gb"
IMAGE_NAME="ubuntu-20-04-x64"
SSH_KEYS="2d:fa:98:84:51:c1:d0:ed:08:d6:61:7d:a8:58:b4:7b"
```
**SSH_KEYS** 
For this value, use `doctl compute ssh-key list` and paste in your key 

To create the new Droplet, run ./deploy-droplet.sh
