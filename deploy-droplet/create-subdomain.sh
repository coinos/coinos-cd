#!/bin/bash
set -o allexport; source .env; set +o allexport

doctl compute domain records create coinos.cloud --record-name=$SUBDOMAIN --record-data=$IP_ADDRESS --record-type=A	