# Game-Based Learning @ UZH

`gbl-uzh` is the code repository of the Game-Based Learning project (<https://www.gbl.uzh.ch/>) developed at the [Department of Banking and Finance](https://www.bf.uzh.ch/en.html) of the [University of Zurich](https://www.uzh.ch/en.html).

## Project Vision

Game-based learning has many benefits for lecturers and students. However, it can be difficult to get started with developing learning games and integrating games with other curricular activities. We want to foster the application of game-based learning in the university context by providing foundational resources for game usage and development based on what we have learned on our own journey.

For more details on our future plans, have a look at our [Roadmap](https://www.gbl.uzh.ch/roadmap).

## Project Components

The `gbl-uzh` project consists of two key components:

- The `GBL Website` (located in the `apps/website` directory), a Next.js web application that summarizes all of the outputs of our project on a single site. The `GBL Website` is hosted publicly on <https://www.gbl.uzh.ch>.
- The `GBL Knowledge Base` (located in the `kb` directory as a Git submodule), an [Obsidian](https://obsidian.md/) knowledge graph that contains the knowledge on gamification and game-based learning that we gather and curate throughout this and other projects. The knowledge base also serves as a Content Management System (CMS) for the `GBL Website`. The `GBL Knowledge Base` is publicly accessible on <https://www.gbl.uzh.ch/kb>.
- The `GBL Advisor` (located in the `apps/advisor` directory), an advisory wizard for getting started in the space of Game-Based Learning as a teacher. The advisor is built on the Twinery text-based serious game engine.
- The `GBL Platform` (located in the `packages/platform` directory), a code framework for building round-based simulations with Next.js and React.

## Contributing

We welcome any contributions to the project. If you would like to contribute to the code base, please create an [Issue](https://github.com/uzh-bf/gbl-uzh/issues) beforehand to ensure that your goals align with our project vision. If you would like to publish your course or game-based learning resource on our website, please create a new [Discussion](https://github.com/uzh-bf/gbl-uzh/discussions).

If you would like to give us feedback or have any requests regarding content of the website or knowledge base, please add a new entry on our [Feedback](https://gbl-uzh.feedbear.com/boards/gbl-web) page.

## License

The GBL Website and Knowledge Base, as well as other published subcomponents, are licensed under the [AGPLv3](https://www.gnu.org/licenses/agpl-3.0.de.html).
