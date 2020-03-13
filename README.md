# hn-happ-create

The `hn-happ-create` script is a simple dev tool that allows you to get a working Holochain app up and running as fast as possible.

The script creates a simple "notes hApp" that allows you to create, edit, delete, and list notes. It includes a DNA backend and a React + GraphQL frontend. It is a minimal working Holochain app.

## 0 - Install `nix-shell`

Install `nix-shell` on your machine, using this one-line command:

```
curl https://nixos.org/nix/install | sh
```

(Note: we currently support macOS and Linux only; please see our [development environment setup guide](https://developer.holochain.org/docs/install/) to set up Linux and `nix-shell` on Windows.)

## 1 - Get holonix

Holonix is a full Holochain development environment built with the [Nix package manager](https://nixos.org/nix/).
Rather than using the 'blessed' version of holonix available at https://holochain.love, you'll be installing it from the repo itself.

Clone the holonix repo:

```
$ git clone https://github.com/holochain/holonix.git
```

Go into the repo's directory:

```
$ cd holonix
```

Checkout the `create-happ` branch:

```
$ git checkout create-happ
```

## 2 - Run `nix-shell`

```
$ nix-shell
```

This will begin the holonix setup. Once it's complete you will be in a `nix-shell` environment with the Holochain dev tools and the `hn-happ-create` script ready to use.

## 3 - Run the hApp create command

From within the `nix-shell` environment, first move out of the holonix directory:

```
$ cd ..
```

Then run this command:

```
$ hn-happ-create my-project-name
```

This will create a new directory for your project, and start a Holochain conductor and a UI web server.

The first time the Holochain conductor runs there may be some additional compilation, so it might take a little while.

Once it's complete, a browser page should open to the notes hApp. If it doesn't, you can browse to http://localhost:5200 to use the hApp.

## A very brief tour

The UI code is in `ui_src` and the DNA code is in `dna_src`. Happy hacking!