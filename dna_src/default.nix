let
 holonix-release-tag = "v0.0.71 ";
 holonix-release-sha256 = "507d64923640221bbc8ca096fbac4e1d30da7a97";

 holonix = import (fetchTarball {
  url = "https://github.com/holochain/holonix/archive/${holonix-release-tag}.tar.gz";
  sha256 = "${holonix-release-sha256}";
 });
in
with holonix.pkgs;
{
 core-shell = stdenv.mkDerivation (holonix.shell // {
  name = "dev-shell";

  buildInputs = []
  ++ holonix.shell.buildInputs
  ;
 });
}
