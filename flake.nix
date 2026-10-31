{
  description = "flake for crocus966.github.io";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [

      ];
      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];
      perSystem = { config, self', inputs', pkgs, system, ... }: {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_24
            bun
          ];
          
          shellHook = ''
            echo "completed!"
            echo "Node.js version: $(node -v)"
            echo "bun version: $(bun -v)"
          '';
        };
      };
    };
}
