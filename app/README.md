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



#### todo

- [x] launch deploys
- [x] launch tests
- [ ] automatically launch test after deploy
- [ ] trigger a new deploy on commits to master
- [ ] trigger a new deploy on commits on any branch for those that have a #DEPLOYME in description
- [ ] integrate a UI based manual QA procedure for staff/collaborators to yey/ney a given deployment w/ optional notes


[../deploy-droplet README]:../deploy-droplet