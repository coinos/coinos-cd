## Coinos CD app

#### install / run 

```bash
cp .env.sample .env
# ( then edit .env with a valid Digital Ocean key )
npm install
node compile c
node server
#> http://localhost:8456
```

To get a Digital Ocean key see [../deploy-droplet README]

(a key is only required for creating new deploys)

#### deploy (WIP, only required for prod)

Install docker and docker-compose on host system then: 

```bash
docker build -t coinos-cd-app:0.0.1 . --no-cache
docker-compose up --force-recreate
```
Omit `--force-recreate` and `--no-cache` only if necessary.

*WIP; not fully working yet
alternate to a docker based 'auto' deploy is a vanilla ie- [non-docker based deploy script] (which is also WIP and not fully automated)

#### todo

- [x] launch deploys
- [x] launch tests
- [ ] automatically launch test after deploy
- [ ] trigger a new deploy on commits to master
- [ ] trigger a new deploy on commits on any branch for those that have a #DEPLOYME in description
- [ ] integrate a UI based manual QA procedure for staff/collaborators to yey/ney a given deployment w/ optional notes


[../deploy-droplet README]:../deploy-droplet
[non-docker based deploy script]:../deploy-droplet-cd-app/deploy-droplet-cd-app_vanilla.sh