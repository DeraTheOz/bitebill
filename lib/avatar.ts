import "server-only";

import { Avatar, Style } from "@dicebear/core";

import adventurer from "@dicebear/styles/adventurer.json";
import adventurerNeutral from "@dicebear/styles/adventurer-neutral.json";
import avataaars from "@dicebear/styles/avataaars.json";
import avataaarsNeutral from "@dicebear/styles/avataaars-neutral.json";
import bigEars from "@dicebear/styles/big-ears.json";
import bigEarsNeutral from "@dicebear/styles/big-ears-neutral.json";
import bigSmile from "@dicebear/styles/big-smile.json";
import bottts from "@dicebear/styles/bottts.json";
import botttsNeutral from "@dicebear/styles/bottts-neutral.json";
import cameo from "@dicebear/styles/cameo.json";
import croodles from "@dicebear/styles/croodles.json";
import croodlesNeutral from "@dicebear/styles/croodles-neutral.json";
import dylan from "@dicebear/styles/dylan.json";
import funEmoji from "@dicebear/styles/fun-emoji.json";
import gaze from "@dicebear/styles/gaze.json";
import glass from "@dicebear/styles/glass.json";
import identicon from "@dicebear/styles/identicon.json";
import initials from "@dicebear/styles/initials.json";
import lineFace from "@dicebear/styles/line-face.json";
import lorelei from "@dicebear/styles/lorelei.json";
import loreleiNeutral from "@dicebear/styles/lorelei-neutral.json";
import micah from "@dicebear/styles/micah.json";
import miniavs from "@dicebear/styles/miniavs.json";
import moods from "@dicebear/styles/moods.json";
import notionists from "@dicebear/styles/notionists.json";
import notionistsNeutral from "@dicebear/styles/notionists-neutral.json";
import openPeeps from "@dicebear/styles/open-peeps.json";
import personas from "@dicebear/styles/personas.json";
import pixelArt from "@dicebear/styles/pixel-art.json";
import pixelArtNeutral from "@dicebear/styles/pixel-art-neutral.json";
import pixelbot from "@dicebear/styles/pixelbot.json";
import thumbs from "@dicebear/styles/thumbs.json";
import toonHead from "@dicebear/styles/toon-head.json";
import voxelArt from "@dicebear/styles/voxel-art.json";
import voxelBot from "@dicebear/styles/voxel-bot.json";

const AVATAR_STYLES = [
  adventurer,
  adventurerNeutral,
  avataaars,
  avataaarsNeutral,
  bigEars,
  bigEarsNeutral,
  bigSmile,
  bottts,
  botttsNeutral,
  cameo,
  croodles,
  croodlesNeutral,
  dylan,
  funEmoji,
  gaze,
  glass,
  identicon,
  initials,
  lineFace,
  lorelei,
  loreleiNeutral,
  micah,
  miniavs,
  moods,
  notionists,
  notionistsNeutral,
  openPeeps,
  personas,
  pixelArt,
  pixelArtNeutral,
  pixelbot,
  thumbs,
  toonHead,
  voxelArt,
  voxelBot,
];

function randomStyle() {
  return AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
}

/**
 * Renders a random DiceBear avatar as a self-contained SVG data URI.
 * With no seed, a random one is generated so every call yields a
 * different style + character; with a seed, the result is deterministic.
 */
export function generateAvatar(options: { seed?: string; size?: number } = {}) {
  const { seed, size = 128 } = options;
  const style = new Style(randomStyle());

  return new Avatar(style, {
    seed: seed ?? crypto.randomUUID(),
    size,
  }).toDataUri();
}
