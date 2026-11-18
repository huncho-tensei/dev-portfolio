// The scene app. Block.tsx hands it the element it rendered; everything that moves is started here.

export function mountBlock(root, content, headlines) {
  const stage = root.querySelector('#stage');
  if (!stage) return null;
  void content; void headlines;
  return () => {};
}
