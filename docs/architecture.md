# Architecture sketch

The lab keeps four seams explicit:

```text
content data → pure resolver → observable stores → UI presentation
```

Do not bury design logic in React components. Components should reveal and manipulate state; domain logic lives under `src/domain`, authored content under `src/content`, and resolver behavior under `src/engine`.

## First reusable concepts

- **State object**: situated vernacular struggle anchored to a place/object.
- **Approach**: player-selected support framing for a tiltak attempt.
- **Die**: one-use state-capacity face that biases probability, not a deterministic branch selector.
- **Vignette beat**: small authored behavior unit emitted by resolver.
- **Evidence fact**: structured observation derived from beats.
- **Frank report**: interpretation layer; never the primary payoff.
