/**
 * Service Diễn đàn
 * Firestore: forum/posts/all/{postId}
 * Replies: forum/posts/all/{postId}/replies/{replyId}
 */

import {
  collection, query, orderBy, getDocs, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ForumPost } from '@/models/ForumPost';
import { Reply } from '@/models/Reply';

const POSTS_COL = () => collection(db, 'forum', 'posts', 'all');

/** Lắng nghe realtime danh sách bài viết */
export const subscribeToForum = (
  callback: (posts: ForumPost[]) => void,
  onError: (e: Error) => void,
) => {
  const q = query(POSTS_COL(), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const posts = snap.docs.map((d) => ({ postId: d.id, ...d.data() } as ForumPost));
      callback(posts);
    },
    onError,
  );
};

/** Lấy danh sách bài viết (one-shot) */
export const getPosts = async (): Promise<ForumPost[]> => {
  try {
    const q = query(POSTS_COL(), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ postId: d.id, ...d.data() } as ForumPost));
  } catch (e) {
    console.error('❌ Lỗi getPosts:', e);
    throw e;
  }
};

/** Lấy bài viết theo ID */
export const getPostById = async (postId: string): Promise<ForumPost | null> => {
  try {
    const snap = await getDoc(doc(db, 'forum', 'posts', 'all', postId));
    if (!snap.exists()) return null;
    return { postId: snap.id, ...snap.data() } as ForumPost;
  } catch (e) {
    console.error('❌ Lỗi getPostById:', e);
    throw e;
  }
};

/** Tạo bài viết mới */
export const createPost = async (data: {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
}): Promise<string> => {
  try {
    const ref = await addDoc(POSTS_COL(), {
      ...data,
      replyCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.error('❌ Lỗi createPost:', e);
    throw e;
  }
};

/** Xóa bài viết */
export const deletePost = async (postId: string): Promise<void> => {
  await deleteDoc(doc(db, 'forum', 'posts', 'all', postId));
};

/** Lấy danh sách replies của bài viết */
export const getReplies = async (postId: string): Promise<Reply[]> => {
  try {
    const q = query(
      collection(db, 'forum', 'posts', 'all', postId, 'replies'),
      orderBy('createdAt', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reply));
  } catch (e) {
    console.error('❌ Lỗi getReplies:', e);
    throw e;
  }
};

/** Thêm reply */
export const addReply = async (
  postId: string,
  data: { content: string; authorId: string; authorName: string; authorPhoto?: string },
): Promise<void> => {
  try {
    await addDoc(collection(db, 'forum', 'posts', 'all', postId, 'replies'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    // Tăng replyCount
    await updateDoc(doc(db, 'forum', 'posts', 'all', postId), {
      replyCount: (await getPostById(postId))?.replyCount ?? 0 + 1,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('❌ Lỗi addReply:', e);
    throw e;
  }
};
