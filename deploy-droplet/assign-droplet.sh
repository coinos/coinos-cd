set -o allexport; source .env; set +o allexport

doctl projects resources assign $PROJECT_ID --resource=do:droplet:$DROPLET_ID
