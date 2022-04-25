### Deploy baremetal

This is a WIP procedure for deploying a new Coinos-ready baremetal machine. 

Assumes you are working from a local 'dev' machine and that your target baremetal is ready to go with a fresh install of Ubuntu 20.

On target machine, set a root password. 

```bash
sudo passwd root
```

install openssh-server
```bash
sudo apt install openssh-server
```
Change `PermitRootLogin` to `yes`
```bash
vim /etc/ssh/sshd_config
# make sure this line reads as follows: 
PermitRootLogin yes
```

Now run `./deploy-baremetal.sh` from your local machine.

If all goes well, the environment and Coinos will install and configure, concluding with the app available on said target system on port 80*

*todo: create a custom docker-compose file to accommodate for non-SSL / LAN access

*todo: update documentation to indicate DNS setup; how to run off a custom domain