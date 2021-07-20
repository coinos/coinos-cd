sudo apt install git curl -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
su - $USER
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
git clone https://github.com/coinos/coinos-server
cd coinos-server/
cp -R sampleconfig/ config
cp .env.sample .env
cp fx.sample fx
docker exec -i mariadb mysql -u root -ppassword < db/schema.sql   
docker-compose up -d
docker run -it -v $(pwd):/app --entrypoint yarn asoltys/coinos-server
