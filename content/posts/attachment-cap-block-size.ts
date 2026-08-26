import type { PostBody } from './_types';

/** `An attachment cap is a block size`. Out of DiscVault. `40-content-model.md` §5. */
export const attachmentCapBlockSize: PostBody = {
  slug: 'attachment-cap-block-size',
  standfirst:
    'What a chat platform calls a limit, a filesystem calls a block. Once you see it that way the rest of the design writes itself.',
  blocks: [
    {
      type: 'p',
      text: 'Discord will take an attachment up to a certain size and no larger. Every so often somebody notices this and builds a joke about it. DiscVault started as that joke and stopped being one at the moment the cap stopped reading as a *limit* and started reading as a **block size**.',
    },
    {
      type: 'p',
      text: 'That reframing is the whole post. A limit is something you work around. A block size is something you build on top of — it is the unit every filesystem in existence is already designed around, and forty years of prior art suddenly applies to your silly project.',
    },
    {
      type: 'h2',
      text: 'What you get for free',
    },
    {
      type: 'p',
      text: 'Once the cap is a block, the standard questions have standard answers.',
    },
    {
      type: 'list',
      items: [
        'A file larger than one block is **chunked**, and the chunks do not have to be contiguous or ordered.',
        'A manifest maps chunk index to location, which makes it an inode by another name.',
        'Integrity is per chunk, so a corrupt chunk is a re-fetch rather than a lost file.',
        'Resumption is free: you already know which chunks you have.',
      ],
    },
    {
      type: 'code',
      lang: 'jsonc',
      caption: 'The manifest. Nothing here is novel, and that is the point.',
      source: `{
  "name": "archive.zip",
  "size": 219_430_912,
  "chunk": 8_388_608,
  "sha256": "…",
  "chunks": [
    { "i": 0, "id": "…", "sha256": "…" },
    { "i": 1, "id": "…", "sha256": "…" }
  ]
}`,
    },
    {
      type: 'h2',
      text: 'The part that is not free',
    },
    {
      type: 'p',
      text: 'Two things cost real work, and neither was obvious at the start.',
    },
    {
      type: 'h3',
      text: 'The manifest has to live somewhere',
    },
    {
      type: 'p',
      text: 'A manifest that lives in the same place as the chunks has a bootstrapping problem: you need it to find them, and you need to find it first. A manifest that lives on your server means your server is now load-bearing for everyone else. The current answer is that the manifest is itself a message, and the key you hold is a pointer to it — which is a familiar shape once you notice it is a superblock.',
    },
    {
      type: 'h3',
      text: 'Encryption changes the sizes',
    },
    {
      type: 'p',
      text: 'Encrypt each chunk and it gets a little bigger — a nonce, a tag — which means the *plaintext* block size is the cap minus overhead rather than the cap. Get that wrong and the failure arrives at upload time on the last chunk of a large file, which is the most expensive possible moment to find out.',
    },
    {
      type: 'quote',
      text: 'Every off-by-one in a chunking scheme surfaces at the end of the longest operation the user will ever run.',
    },
    {
      type: 'h2',
      text: 'Whether you should do this',
    },
    {
      type: 'p',
      text: 'Almost certainly not, and the project says so. It is a demonstration that the primitives are more general than the product they arrive in, not a recommendation to keep anything you care about inside somebody else\'s chat platform. Terms of service exist; so do retention policies; so does the ordinary possibility that the vendor changes their mind on a Tuesday.',
    },
    {
      type: 'p',
      text: 'What travels is the reframing. When a system hands you a hard limit, it is worth asking what that limit would be called if you had designed it on purpose — and then reading about how the people who did design it that way solved the next four problems.',
    },
  ],
};
