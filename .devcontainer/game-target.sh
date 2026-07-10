#!/usr/bin/env bash

resolve_gbl_game_target() {
  case "${GBL_GAME_TARGET:-demo}" in
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
      echo "Unsupported GBL_GAME_TARGET: ${GBL_GAME_TARGET}" >&2
      echo "Supported targets: demo, central-bank, rate-wars" >&2
      return 1
      ;;
  esac
}
