// Comments threading model: nested replies + mentions
export interface Comment {
  id: string
  postId: string
  authorId: string
  parentId: string | null
  body: string
  mentions: string[]
  createdAt: Date
}

export function buildThread(comments: Comment[]): (Comment & { replies: Comment[] })[] {
  const map = new Map<string, Comment & { replies: Comment[] }>()
  comments.forEach(c => map.set(c.id, { ...c, replies: [] }))
  const roots: (Comment & { replies: Comment[] })[] = []
  map.forEach(node => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.replies.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

export function extractMentions(body: string): string[] {
  return Array.from(body.matchAll(/@(\w+)/g)).map(m => m[1])
}
