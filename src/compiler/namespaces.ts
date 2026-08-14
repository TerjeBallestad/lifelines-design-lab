// Cast and room namespaces for the visit stage grammar (PLAN-010).
// Hand-copied IOU from the probe (prototypes/visit-syntax/index.html
// ROLES/ROOMS), like the pre-SB-110 activity list: the real home is a
// core-loop cast/room catalog export (pm gap filed by PLAN-010 Task 3).

export const CAST_IDS: readonly string[] = ['frank', 'grete', 'elling'];

export const ROOM_IDS: readonly string[] = [
  'kitchen',
  'grete_room',
  'living_room',
  'bathroom',
  'elling_room',
  'entrance',
  'hallway',
];

export const CAST_SET: ReadonlySet<string> = new Set(CAST_IDS);
export const ROOM_SET: ReadonlySet<string> = new Set(ROOM_IDS);

/**
 * Names present in both namespaces. A bare `goto <name>` target cannot be
 * disambiguated for such a name, so any overlap is a pack error (SB-107).
 */
export function namespaceCollisions(
  cast: readonly string[] = CAST_IDS,
  rooms: readonly string[] = ROOM_IDS,
): string[] {
  const roomSet = new Set(rooms);
  return cast.filter((name) => roomSet.has(name));
}
