// SB-061 review: the §8 weave block id grammar in one place. A call node is
// `call:<contact>`, the chat node is the literal `chat:frank`, a recipe node
// joins its (sorted) pair. graph.ts, unlock.ts, surfaces.ts and the playtest
// model all resolve these ids — the grammar must not be re-spelled per file.
export const CHAT_FRANK_ID = 'chat:frank';

export const CALL_ID_PREFIX = 'call:';

export const callId = (contactId: string): string => `${CALL_ID_PREFIX}${contactId}`;

/** The contact behind a `call:<contact>` id, or null for any other id. */
export const callContactOf = (id: string): string | null =>
  id.startsWith(CALL_ID_PREFIX) ? id.slice(CALL_ID_PREFIX.length) : null;

export const recipeId = (pair: readonly [string, string]): string => `${pair[0]} + ${pair[1]}`;
