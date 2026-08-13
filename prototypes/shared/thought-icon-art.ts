// SB-102: thought icon art for the editor previews.
// One source of truth per icon: the 32x32 .aseprite file in core-loop at
// assets/sprites/icons/<icon_key>.aseprite (ThoughtIcons.resolve convention,
// PLAN-110). This module carries committed base64 PNG exports of those
// sources so the same icon key renders real art in vite dev AND in the
// file://-openable baked docs, with no runtime asset serving and no Aseprite
// dependency in gen:content.
//
// Re-export after editing a source (Aseprite CLI, then paste the base64):
//   "$HOME/Library/Application Support/Steam/steamapps/common/Aseprite/\
//   Aseprite.app/Contents/MacOS/aseprite" -b \
//     ../lifelines-core-loop/assets/sprites/icons/<icon_key>.aseprite \
//     --save-as /tmp/<icon_key>.png && base64 -i /tmp/<icon_key>.png
//
// Keys without an entry here mirror Godot's own partial-migration state:
// core-loop falls back to a code-drawn placeholder, the editor falls back to
// its text chip. Both consumers address art by the same icon key.

/** icon_key → PNG data URI, exported from the .aseprite source. */
export const ICON_ART: Record<string, string> = {
  thought_doorbell:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAANBJREFUWIVjYBgFFICT/dL/T/ZL/6fEDCbqOYfODviwRfM/MhuZTwpgpMRiXEDA5zrR5pLkAFJ8SawjiHYAOUFMjCOIcgC58UuMI0hKhPy6ieS6AycgGALE+h7muI+X52PI4QsFokKAWJ9js5wQoFoI4AMUhwAtAUEHwIKfFgmQgR5RQNVsSAtA1VxADsAZPJTW8+jAvPApVrtIigKzoHyqOYgsB5xaN5HqDiC5PYAMunLl4dFUNvkhWWaR7QBkyylxxNDIhrQEA54GRsEoGAUA9oVE4GpoonwAAAAASUVORK5CYII=',
};

/** The data URI for an icon key, or null when no art is exported yet. */
export const iconArt = (iconKey: string): string | null => ICON_ART[iconKey] ?? null;
