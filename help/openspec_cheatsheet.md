# OpenSpec cheatsheet

Run from the repo root. `$OPENSPEC` is auto-set to `@fission-ai/openspec@1.14.3` by direnv when your shell is inside this project (see `.envrc`); if it's unset for some reason, substitute `@fission-ai/openspec@1.14.3` directly.

### Validate specs
```sh
npx -y $OPENSPEC validate --specs                       # all specs, warnings don't fail
npx -y $OPENSPEC validate --specs --strict              # all specs, warnings fail too (what we ran for Checkpoint 0)
npx -y $OPENSPEC validate --all --strict                # specs + changes together
npx -y $OPENSPEC validate kyc-onboarding --type spec    # just one spec
npx -y $OPENSPEC validate --specs --json                # machine-readable output
```

### Browse specs
```sh
npx -y $OPENSPEC spec list                                        # list all specs
npx -y $OPENSPEC spec show kyc-onboarding                         # pretty-print one spec
npx -y $OPENSPEC show kyc-onboarding --type spec --requirements   # requirements only, no scenario bodies
npx -y $OPENSPEC show kyc-onboarding --type spec --json -r 3      # one requirement (1-based index) as JSON
npx -y $OPENSPEC view                                             # interactive dashboard (specs + changes)
```

### Health / context
```sh
npx -y $OPENSPEC doctor      # relationship health of the resolved openspec root
npx -y $OPENSPEC context     # prints working context for the root
```

### Changes (M3 brownfield and later)
```sh
npx -y $OPENSPEC list                                # list active changes
npx -y $OPENSPEC change --help                       # proposal/task management subcommands
npx -y $OPENSPEC validate <change-id> --type change
npx -y $OPENSPEC archive <change-id>
```

The one to reach for after editing a spec: `npx -y $OPENSPEC validate --specs --strict`.
