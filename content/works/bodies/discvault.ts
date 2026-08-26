import type { Block } from '../_types';

/**
 * DiscVault's case-study body.
 *
 * Split out of `content/works/discvault.ts` — see `content/works/bodies/index.ts`
 * for why the prose does not live next to the metadata.
 */
export const discvaultBody: Block[] = [
  {
    type: "prose",
    heading:
      "A limit is something you work around. A block size is something you build on.",
    body: "Discord will take an attachment up to a certain size and no larger. Every so often somebody notices this and builds a joke about it. DiscVault started as that joke and stopped being one the moment the cap stopped reading as a *limit* and started reading as a **block size**.\n\nThat reframing is the entire project. A block size is the unit every filesystem in existence is already designed around — and forty years of prior art suddenly applies to a silly idea.",
  },
  {
    type: "board",
    caption:
      "Chunk, hash, upload, and keep a record of where everything went.",
    items: [
      { art: "mosaic/discvault-board-1", caption: "Streamed, never loaded" },
      {
        art: "strata/discvault-board-2",
        caption: "The manifest is an inode",
      },
      { art: "orbit/discvault-board-3", caption: "Rebuilt byte for byte" },
    ],
  },
  {
    type: "prose",
    heading: "What a filesystem already knows",
    body: "Files are **streamed rather than read into memory** and split into pieces sized to fit under the free-tier attachment limit — which matters at 30GB, where the naive version dies on the first allocation. Chunks are pushed as message attachments in parallel, and a per-file record notes every chunk's server, channel and message.\n\nThat record is a manifest, and a manifest is an inode wearing different clothes. Once it exists, the standard questions have standard answers: a corrupt chunk is a re-fetch rather than a lost file, and resumption is free because you already know which chunks you have.",
  },
  {
    type: "quote",
    text: "SHA-256 verifies the rebuilt file against the original, byte for byte. Without that the whole thing is a very elaborate way to lose data quietly.",
  },
  {
    type: "spec",
    rows: [
      {
        key: "Core",
        value: ["Chunking", "SHA-256 manifests", "Streaming rebuild"],
      },
      {
        key: "Clients",
        value: ["Node CLI", "Next.js dashboard", "Discord OAuth"],
      },
      {
        key: "Sharing",
        value: [
          "Invite code carries the IDs",
          "Bring your own bot",
          "No token exchanged",
        ],
      },
      {
        key: "Scale",
        value: [
          "2–30GB per file",
          "Parallel chunk upload",
          "Deployed on Render",
        ],
      },
    ],
  },
  {
    type: "slider",
    items: [
      { art: "strata/discvault-slide-1", caption: "Chunks, in parallel" },
      { art: "iris/discvault-slide-2", caption: "One manifest per file" },
      {
        art: "mosaic/discvault-slide-3",
        caption: "Verified on the way back",
      },
    ],
  },
  {
    type: "prose",
    heading: "What it cost",
    body: "**The manifest has to live somewhere, and that is a bootstrapping problem.** Store it with the chunks and you need it to find them and need to find it first. Store it on our server and our server becomes load-bearing for everyone else's data. The answer — the manifest is itself a message, and the key you hold points at it — is a superblock by another name, which is reassuring and was not obvious at the time.\n\nThe **invite model** took longer than the chunking. Sharing access without sharing a bot token means the recipient brings their own bot, which is more friction and the only version that does not hand somebody your credentials.",
  },
  {
    type: "prose",
    heading: "Where it does not work yet",
    body: "Desktop and Android clients are listed as planned and are not built. The CLI and the web dashboard are what exists.\n\nAnd the honest warning the project makes in its own README should be repeated here: **this is a demonstration that the primitives are more general than the product they arrive in, not a recommendation.** Terms of service exist, retention policies exist, and a vendor can change their mind on a Tuesday. Do not keep anything here that you would be upset to lose.",
  },
];
