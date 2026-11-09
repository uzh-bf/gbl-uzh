# Demo game (Startinvest) on DF Cloud

Argo CD reads these Kustomize overlays from the `dev` branch:

| Overlay | Argo CD app | Namespace | Host | Sync |
| --- | --- | --- | --- | --- |
| `stg` | `app-gbl-demo` on the STG cluster | `stg-gbl-demo` | startinvest.stg.df-app.ch | automatic |
| `prd` | `app-gbl-demo` on the PRD cluster | `prd-gbl-demo` | startinvest.df-app.ch | manual (digests committed by hand) |

The DF Cloud Pulumi stack `src/apps/gbl` owns the namespaces, secrets and
Argo CD apps. These overlays own the workloads.

## How images reach the clusters

1. A push to `dev` runs `.github/workflows/demo-game.yml`. It builds the STG
   and PRD Startinvest images and the migration image, each also tagged with
   the commit SHA.
2. `deploy_stg` pins the new STG and migration digests in
   `stg/kustomization.yaml`, writes the commit to `stg/SOURCE_COMMIT` and
   pushes to `dev`. Argo CD syncs STG: the PreSync job runs
   `prisma migrate deploy`, then the Deployment rolls out.
   A run never replaces a newer pinned commit with an older one.
3. PRD is never updated by CI. To release, a developer commits the new
   digests to `prd/kustomization.yaml` through a PR to `dev`, using the PRD
   image and the migration image built from a commit already tested on STG
   (normally the one in `stg/SOURCE_COMMIT`):

   ```sh
   sha=$(cat deploy/demo-game/stg/SOURCE_COMMIT)
   docker buildx imagetools inspect ghcr.io/uzh-bf/gbl-uzh/demo-game:prd-startinvest-arm64-$sha --format '{{json .Manifest}}' | jq -r .digest
   docker buildx imagetools inspect ghcr.io/uzh-bf/gbl-uzh/demo-game:dev-migration-$sha --format '{{json .Manifest}}' | jq -r .digest
   ```

   Put the first digest under `demo-game` and the second under
   `demo-game-migration`, and name the source commit in the commit message.
   After the merge, sync `app-gbl-demo` by hand in the PRD Argo CD once you
   have reviewed the diff. Syncing runs the PRD migrations.

To roll back, set the digests in the overlay's `kustomization.yaml` to an
earlier pin (see the git history) and push to `dev`.

`overlays/base` is the old bf-k8s deployment and is not used by Argo CD.
