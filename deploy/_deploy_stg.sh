#!/bin/sh

infisical run --env=stg -- bash -c 'kubectl kustomize elearning/overlays/base/ | envsubst | kubectl apply --validate=true --context bf-k8s463ba113 -f -'
