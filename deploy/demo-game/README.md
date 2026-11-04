# Demo game (Startinvest) on DF Cloud

Argo CD reads these Kustomize overlays from the `dev` branch:

| Overlay | Argo CD app | Namespace | Host | Sync |
| --- | --- | --- | --- | --- |
| `stg` | `app-gbl-demo` on the STG cluster | `stg-gbl-demo` | startinvest.stg.df-app.ch | automatic |
| `prd` | `app-gbl-demo` on the PRD cluster | `prd-gbl-demo` | startinvest.df-app.ch | manual |

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
3. To release to PRD, run **Promote demo-game to PRD**
   (`demo-game-promote-prd.yml`). It pins the PRD images built from the commit
   in `stg/SOURCE_COMMIT`, or from the commit you enter. Then sync
   `app-gbl-demo` by hand in the PRD Argo CD after reviewing the diff.
   Syncing runs the PRD migrations.

To roll back, set the digests in the overlay's `kustomization.yaml` to an
earlier pin (see the git history) and push to `dev`.

`overlays/base` is the old bf-k8s deployment and is not used by Argo CD.
