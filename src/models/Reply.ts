/**
 * Model Reply diễn đàn
 * Firestore: forum/posts/all/{postId}/replies/{replyId}
 */

export interface Reply {
  id: string;
  authorId: string;
  authorName?: string;
  authorPhoto?: string;
  content: string;
  createdAt?: any; // Firestore Timestamp
}
