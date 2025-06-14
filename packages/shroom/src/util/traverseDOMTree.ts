/**
 * Traverses a DOM tree, calling enter/exit callbacks for each node.
 * @param node The root node to start traversal.
 * @param options Object with enter and exit callbacks.
 */
export function traverseDOMTree(
  node: Node,
  options: { enter: (node: Node) => void; exit: (node: Node) => void }
): void {
  if (!node) return;
  options.enter(node);
  node.childNodes.forEach((child) => traverseDOMTree(child, options));
  options.exit(node);
}
