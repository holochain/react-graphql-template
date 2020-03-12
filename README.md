# hn-happ-create

The `hn-happ-create` script is a simple dev tool that allows you to get a holochain development environment up and running as fast as possible.

The script creates a simple "notes happ" that allows you to create, edit, delete and list notes. It includes a dna backend and a react + graphql frontend. It is a minimal working Holochain app.

## 0 - nix-shell

Install nix-shell on your machine. Here are our instructions on how to do that [nix-shell installation](fixme)

## 1 - get holonix

Clone the holonix repo:

`$ git clone https://github.com/holochain/holonix.git`

go into that directory

`$ cd holonix`

checkout the create-happ branch

`$ git checkout create-happ`

## 2 - run nix-shell

`$ nix-shell`

This will begin the nix setup. Once it's complete you will be in a nix-shell environment

## 3 - run the happ create command

From within the nix-shell environment, first move out of the holonix directory

`$ cd ..`

then run this command:

`$ hn-happ-create my-project-name`

This will create a new directory for your project, and start a holochain conductor and the UI server.

The first time the holochain conductor runs there may be some additional compilation so it might take a little while.

Once it's complete, a browser page should open to the default notes happ.

If it doesn't, you can browse to localhost:3000 to use the happ.

## A very brief tour

The ui code is in `ui_src` and the dna code is in `dna_src`. Happy hacking!