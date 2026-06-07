/**
 * Model bài viết diễn đàn
 * Firestore: forum/posts/all/{postId}
 */

export interface ForumPost {
  postId: string;
  authorId: string;
  authorName?: string;
  authorPhoto?: string;
  title: string;
  content: string;
  replyCount: number;
  likeCount: number;
  likes: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}
