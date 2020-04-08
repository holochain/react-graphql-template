# hc-happ-create

The `hc-happ-create` script is a simple dev tool that allows you to get a working Holochain app up and running as fast as possible.

The script creates a simple "notes hApp" that allows you to create, edit, delete, and list notes. It includes a DNA backend and a React + GraphQL frontend. It is a minimal working Holochain app.

## 0 - Install `nix-shell`

Install `nix-shell` on your machine, using this one-line command:

```
curl https://nixos.org/nix/install | sh
```

(Note: we currently support macOS and Linux only; please see our [development environment setup guide](https://developer.holochain.org/docs/install/) to set up Linux and `nix-shell` on Windows.)

## 1 - Get Holonix and enter the development environment

Holonix is a full Holochain development environment built with the [Nix package manager](https://nixos.org/nix/). Download Holonix and enter the shell:

```
$ nix-shell https://holochain.love
```

## 2 - Run the hApp create command

From within the `nix-shell` environment, first create a directory for all your Holochain projects (if you haven't already). You can create it wherever you like; here's a recommended setup:

```
$ cd ~
$ mkdir Holochain
$ cd Holochain
```

Then run this command:

```
$ hc-happ-create my-project-name
```

This will create a new directory for your project, download all the dependencies and development tools, and create the hApp source code. This will take some time.

## 3 - Start your new hApp!

Once it's complete, go into the new project directory and run this command:

```
$ yarn start
```

The first time the Holochain conductor runs there may be some additional compilation, so it might take a little while. When it's done, a browser page should open to the notes hApp. If it doesn't, you can browse to http://localhost:5200 to use the hApp.

The conductor and the UI server run in the foreground, so you can stop them by pressing `Ctrl`+`C`.
`$ npm start`

## A very brief tour

The UI code is in `ui_src` and the DNA code is in `dna_src`. This notes demo app uses:

1. A Holochain DNA on the back end (of course)
2. [Apollo GraphQL middleware](https://www.apollographql.com/) in the browser to translate zome calls into something easy for front-end frameworks to understand and manipulate
3. [React](https://reactjs.org) for UI and data flow
4. [create-react-app](https://create-react-app.dev/) for development tooling

As with most hApps, much of the business logic lives in the front-end and is delivered as static assets to the browser. The create-react-app dev tooling builds it all from source, gets it ready for the browser, and serves it up using [Webpack's dev server](https://webpack.js.org/configuration/dev-server/). (We're using this instead of Holochain's built-in static asset server because it supports live reloading of changes to the UI code.)

**Happy hacking!**
