/**
 * Model bài viết diễn đàn
 * Firestore: forum/posts/all/{postId}
 */

export interface ForumPost {
  postId: string;       // = document ID
  authorId: string;
  authorName?: string;
  authorPhoto?: string;
  title: string;
  content: string;
  replyCount: number;
  createdAt?: any;      // Firestore Timestamp
  updatedAt?: any;
}
