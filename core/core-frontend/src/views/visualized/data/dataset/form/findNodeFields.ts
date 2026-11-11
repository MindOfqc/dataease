export function findNodeFields<
  T extends { id: string; currentDsFields: unknown[]; children?: T[] }
>(nodes: T[], id: string): T['currentDsFields'] {
  const findNode = (items: T[]): T | undefined => {
    for (const node of items) {
      if (node.id === id) return node
      const found = node.children && findNode(node.children)
      if (found) return found
    }
  }

  return [...(findNode(nodes)?.currentDsFields ?? [])] as T['currentDsFields']
}
