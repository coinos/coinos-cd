#!/bin/bash
set -o allexport; source .env; set +o allexport

echo "Destroy DROPLET_ID: $DROPLET_ID"

doctl compute droplet delete -f $DROPLET_ID
