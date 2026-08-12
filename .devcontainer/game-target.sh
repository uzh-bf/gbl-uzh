#!/usr/bin/env bash

# Resolves the game selection into GBL_GAME_TARGET and GBL_GAME_PACKAGE.
# An explicit argument wins over the GBL_GAME_TARGET variable, so the host
# commands can take `pnpm dev central-bank` while the container lifecycle
# scripts keep passing the target through the environment.
resolve_gbl_game_target() {
  local target="${1:-${GBL_GAME_TARGET:-demo}}"

  case "${target}" in
    demo)
      export GBL_GAME_TARGET=demo
      export GBL_GAME_PACKAGE=@gbl-uzh/demo-game
      ;;
    central-bank)
      export GBL_GAME_TARGET=central-bank
      export GBL_GAME_PACKAGE=@gbl-uzh/central-bank
      ;;
    rate-wars)
      export GBL_GAME_TARGET=rate-wars
      export GBL_GAME_PACKAGE=@gbl-uzh/rate-wars
      ;;
    *)
      echo "Unsupported game target: ${target}" >&2
      echo "Supported targets: demo, central-bank, rate-wars" >&2
      return 1
      ;;
  esac
}
