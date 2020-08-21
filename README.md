### Bootstrapped with DCollage (Digital Collage Boilerplate w/ PIXIJS)

DCollage is a lightly opinionated PIXIJS based digital collage boilerplate with game dev aspirations and a component driven paradigm written in TypeScript.

The goal of DCollage is to facilitate the creation of multi-layered, interactive, collages similar to those I created back in the days of Flash. Surprise it works for simple games too! [See the repo WIKI for additional information.](https://github.com/jrod-disco/dcollage-pixijs-boilerplate/wiki)

![dC logo](http://content.jrvhost.com/github/dc-logo.png)

# Your Project Title

Your project description may appear here.

# Getting Started

DCollage is meant to get you up and running with a PIXI app in minutes. While there are a lot of nuances that can be tweaked and you are not forced to follow the patterns this boilerplate includes it should be a matter of clone, install, run.

## Clone or Template

- Clone or spin up a new repo using the github template `https://github.com/jrod-disco/dcollage-pixijs-boilerplate.git`

## Install and Run

- Run `yarn install` at the project root to install all of the `node_modules`
- Run `yarn start` to begin developing locally `http://localhost:10001/`

## Have Fun!

- Edit `main.ts` to add or remove components from the main container
- There is a `components/library` included to help you get started (please contribute yours back to the repo and namespace their directory E.g. `components/library/yourGithubUsername`)
- Put your assets in `./src/assets` and add anything you want to preload to the `preloader` at the bottom of `main.ts`
- Use any of the `_prebuilt` components, or make your own

## DCollage Prebuilt Components Library

- Components should be barreled up into a single `COMP` import, in addition "prebuilt componenents" that come with the boilerplate are double-barreled (shame on me) and available via `COMP.LIB`
- if you follow this pattern you can create a new component by:

  `const newComponent = COMP.LIB.prebuiltComponentName({prebuiltComponentPropsObject})`

  or for a component you've created outside of the library:

  `const myNewComponent = COMP.myComponentName({myComponentPropsObject})`

- The component function will return a module object which will include a `container` for components that have a visual aspect
- Add this container to the existing `mainContainer` or any container you create like so:

  `mainContainer.addChild(newComponent.container);`

- This allows for components to have a discreet "rendered" container as well as any logic and exposed functions the returned module object has available
- It is key to note that components are functional modules rather than classes but this doesn't mean you couldn't use classes if you wanted to. See for more info: [The Revealing Module Pattern in Javascript](https://gist.github.com/zcaceres/bb0eec99c02dda6aac0e041d0d4d7bf2)

## Eventing and Application Access

- Currently events are all handled via callbacks; this has been sufficient for basic projects but a more robust pub-sub/eventBus is on the roadmap
- At times you may want/need to access the PIXI Application instance; in this case you can tweak the bootstrapping function to `window.APP = bootstrapApp({ spriteSheets, sounds });` exposing the `APP` in the global space via window; this is helpful in the event that you want to freeze the app, say for a game PAUSE or something `window.APP.stop();` from within a nested component

# Build Scripts

- `yarn start` to go into development mode with live reload
- `yarn clean` to clean the `/dist` directory
- `yarn build` to create a distributable bundle in `/dist`
- `yarn docs` to generate markdown documentation in `/docs`

## Concept and Mechanics

TBD

## Roadmap

- [x] Bootstraping

  - [x] create repo
  - [x] clean-up remnants from past usage
  - [x] get it running the game loop bare bones

- [ ] TBD
  - [ ] TBD

### Completed!

Nothing yet

## Libraries Used

- DCollage Boilerplate [https://github.com/jrod-disco/dcollage-pixijs-boilerplate](https://github.com/jrod-disco/dcollage-pixijs-boilerplate)
- PIXIJS - WebGL renderer with Canvas fallback and so much more [https://github.com/pixijs/pixi.js](https://github.com/pixijs/pixi.js)
- GSAP - tween animation library [https://greensock.com/docs/v2/Plugins/PixiPlugin](https://greensock.com/docs/v2/Plugins/PixiPlugin)
- pixi-filters - Collection of community-authored custom display filters for PixiJS [https://github.com/pixijs/pixi-filters](https://github.com/pixijs/pixi-filters) Currently yarn linked to a local version of the repo in order to use the as of yet un-merged changes to the godray filter which add alpha functionality.

## Tools Used

- Visual Studio Code
- Sublime Text
- Aesprite
- Audacity
- Reason

# The Stack

- Pixi.JS
- TypeScript
- Prettier
- Rollup
- TSDoc / TypeDoc
