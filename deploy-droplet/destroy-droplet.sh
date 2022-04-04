set -o allexport; source .env; set +o allexport

doctl compute droplet delete $DROPLET_ID
