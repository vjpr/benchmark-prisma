with import <nixpkgs> {};

# prisma-bin.nix
let
    prismaDrv = {stdenv,fetchurl,openssl,zlib,autoPatchelfHook,lib} :
        let
            hostname = "binaries.prisma.sh";
            channel = "all_commits";
            target = "debian-openssl-1.1.x";
            baseUrl = "https://${hostname}/${channel}";
            commit = "9b816b3aa13cc270074f172f30d6eda8a8ce867d";
            hashes = {
                introspection-engine = "M8C0h1ZH6+Oj4gMKLC7yVZRfG4j/18LTCatKh9U0nZM=";
                migration-engine = "RSp1955by1Cg1UnaRNaFDoOT7OTpzWkgK3IlOi33244=";
                prisma-fmt = "hUZFNTOhUNAU4YxhySwCHjbk4LkbqBDA9tX0FN6eGaU=";
                query-engine = "P9vk4PmahdDtZqnjdnJcYiSzrkh1lX4DsnRMU+RQsg8=";
                "libquery_engine.so.node" = "MmgW3TkEoneuPD56jenVsj/laU6m/zfrwi3CsaIewoU=";
            };
            files = lib.mapAttrs (name: sha256: fetchurl {
                url = "${baseUrl}/${commit}/${target}/${name}.gz";
                inherit sha256;
            }) hashes;
            unzipCommands = lib.mapAttrsToList (name: file: "gunzip -c ${file} > $out/bin/${name}") files;
        in
        stdenv.mkDerivation rec {
            pname = "prisma-bin";
            version = "2.26.0";
            nativeBuildInputs = [
                autoPatchelfHook
                zlib
                openssl
            ];
            phases = ["buildPhase" "postFixupHooks" ];
            buildPhase = ''
                mkdir -p $out/bin
                ${lib.concatStringsSep "\n" unzipCommands}
                chmod +x $out/bin/*
            '';
        };

    prismaPkg = callPackage prismaDrv {};

in mkShell {
    buildInputs = [
        nodejs-14_x
        yarn
        prismaPkg
    ];
    shellHook = ''
        export PRISMA_MIGRATION_ENGINE_BINARY="${prismaPkg}/bin/migration-engine"
        export PRISMA_QUERY_ENGINE_BINARY="${prismaPkg}/bin/query-engine"
        export PRISMA_QUERY_ENGINE_LIBRARY="${prismaPkg}/bin/libquery_engine.so.node"
        export PRISMA_INTROSPECTION_ENGINE_BINARY="${prismaPkg}/bin/introspection-engine"
        export PRISMA_FMT_BINARY="${prismaPkg}/bin/prisma-fmt"
        export PATH="$PATH:$PWD/node_modules/.bin"
    '';
}
