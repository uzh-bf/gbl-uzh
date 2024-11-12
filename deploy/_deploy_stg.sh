#!/bin/sh

set -e  # Exit on error

# Validate required tools
command -v infisical >/dev/null 2>&1 || { echo "infisical is required but not installed"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required but not installed"; exit 1; }
command -v envsubst >/dev/null 2>&1 || { echo "envsubst is required but not installed"; exit 1; }

# Validate context exists
kubectl config get-contexts bf-k8s463ba113 >/dev/null 2>&1 || { echo "Kubernetes context bf-k8s463ba113 not found"; exit 1; }

infisical run --env=stg -- bash -c 'kubectl kustomize elearning/overlays/base/ | envsubst | kubectl apply --validate=true --context bf-k8s463ba113 -f -'
