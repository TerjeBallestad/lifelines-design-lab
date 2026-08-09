// SB-082: the node-kind union, shared by the surface renderers and the
// canvas graph. Lives here so the renderers do not drag in the canvas graph
// module; graph.ts imports and re-exports it.
export type NodeKind =
  | 'document'
  | 'fact'
  | 'question'
  | 'hypothesis'
  | 'tiltak'
  | 'dispatch'
  | 'clock'
  // SB-046 (SB-037 ruling): §8 weave blocks as read-only nodes — chat/call
  // conversations, recipes, proposals. Node id = the raw block id, so the
  // SB-041 cross-jump machinery resolves them with no extra wiring.
  | 'conversation'
  | 'recipe'
  | 'proposal';
