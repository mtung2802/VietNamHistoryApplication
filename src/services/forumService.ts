import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ForumPost } from '@/models/ForumPost';
import { Reply } from '@/models/Reply';
import seedDatabase from '@/data/full_forum_database.json';

export type ForumDataSource = 'firebase' | 'sample';

interface SeedReply {
  _document_id: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorPhoto?: string;
  createdAt?: string;
}

interface SeedPost {
  _document_id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorPhoto?: string;
  replyCount?: number;
  likeCount?: number;
  likes?: string[];
  createdAt?: string;
  replies?: SeedReply[];
}

const POSTS_COL = () => collection(db, 'forum', 'posts', 'all');
const postRef = (postId: string) => doc(db, 'forum', 'posts', 'all', postId);
const repliesCol = (postId: string) =>
  collection(db, 'forum', 'posts', 'all', postId, 'replies');

const seedPosts = (seedDatabase as SeedPost[]).map<ForumPost>((post) => ({
  postId: post._document_id,
  title: post.title,
  content: post.content,
  authorId: post.authorId,
  authorName: post.authorName,
  authorPhoto: post.authorPhoto || undefined,
  replyCount: post.replyCount ?? post.replies?.length ?? 0,
  likeCount: post.likeCount ?? post.likes?.length ?? 0,
  likes: post.likes ?? [],
  createdAt: post.createdAt,
}));

const getSeedPost = (postId: string) => seedPosts.find((post) => post.postId === postId) ?? null;

const getSeedReplies = (postId: string): Reply[] => {
  const post = (seedDatabase as SeedPost[]).find((item) => item._document_id === postId);
  return (post?.replies ?? []).map((reply) => ({
    id: reply._document_id,
    content: reply.content,
    authorId: reply.authorId,
    authorName: reply.authorName,
    authorPhoto: reply.authorPhoto || undefined,
    createdAt: reply.createdAt,
  }));
};

const normalizePost = (id: string, data: Record<string, unknown>): ForumPost => {
  const likes = Array.isArray(data.likes)
    ? data.likes.filter((value): value is string => typeof value === 'string')
    : [];

  return {
    postId: id,
    authorId: typeof data.authorId === 'string' ? data.authorId : '',
    authorName: typeof data.authorName === 'string' ? data.authorName : undefined,
    authorPhoto: typeof data.authorPhoto === 'string' && data.authorPhoto ? data.authorPhoto : undefined,
    title: typeof data.title === 'string' ? data.title : '',
    content: typeof data.content === 'string' ? data.content : '',
    replyCount: typeof data.replyCount === 'number' ? data.replyCount : 0,
    likeCount: typeof data.likeCount === 'number' ? data.likeCount : likes.length,
    likes,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

const normalizeReply = (id: string, data: Record<string, unknown>): Reply => ({
  id,
  authorId: typeof data.authorId === 'string' ? data.authorId : '',
  authorName: typeof data.authorName === 'string' ? data.authorName : undefined,
  authorPhoto: typeof data.authorPhoto === 'string' && data.authorPhoto ? data.authorPhoto : undefined,
  content: typeof data.content === 'string' ? data.content : '',
  likeCount: typeof data.likeCount === 'number' ? data.likeCount : 0,
  likes: Array.isArray(data.likes)
    ? data.likes.filter((value): value is string => typeof value === 'string')
    : [],
  createdAt: data.createdAt,
});

export const subscribeToForum = (
  callback: (posts: ForumPost[], source: ForumDataSource) => void,
  onError?: (error: Error) => void,
) => {
  const forumQuery = query(POSTS_COL(), orderBy('createdAt', 'desc'));
  return onSnapshot(
    forumQuery,
    (snapshot) => {
      if (snapshot.empty) {
        callback(seedPosts, 'sample');
        return;
      }
      callback(
        snapshot.docs.map((item) => normalizePost(item.id, item.data())),
        'firebase',
      );
    },
    (error) => {
      callback(seedPosts, 'sample');
      onError?.(error);
    },
  );
};

export const getPosts = async (): Promise<ForumPost[]> => {
  const forumQuery = query(POSTS_COL(), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(forumQuery);
  return snapshot.docs.map((item) => normalizePost(item.id, item.data()));
};

export const getPostById = async (postId: string): Promise<ForumPost | null> => {
  try {
    const snapshot = await getDoc(postRef(postId));
    return snapshot.exists() ? normalizePost(snapshot.id, snapshot.data()) : getSeedPost(postId);
  } catch (error) {
    const seedPost = getSeedPost(postId);
    if (seedPost) return seedPost;
    throw error;
  }
};

export const createPost = async (data: {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
}): Promise<string> => {
  const reference = await addDoc(POSTS_COL(), {
    ...data,
    replyCount: 0,
    likeCount: 0,
    likes: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
};

export const updatePost = async (
  postId: string,
  data: { title: string; content: string },
): Promise<void> => {
  await updateDoc(postRef(postId), {
    title: data.title,
    content: data.content,
    updatedAt: serverTimestamp(),
  });
};

export const deletePost = async (postId: string): Promise<void> => {
  const repliesSnapshot = await getDocs(repliesCol(postId));
  const replyDocs = repliesSnapshot.docs;

  for (let index = 0; index < replyDocs.length; index += 450) {
    const batch = writeBatch(db);
    replyDocs.slice(index, index + 450).forEach((reply) => batch.delete(reply.ref));
    await batch.commit();
  }

  await deleteDoc(postRef(postId));
};

export const togglePostLike = async (postId: string, userId: string): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    const reference = postRef(postId);
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error('Bài viết không còn tồn tại.');

    const data = snapshot.data();
    const likes = Array.isArray(data.likes)
      ? data.likes.filter((value): value is string => typeof value === 'string')
      : [];
    const nextLikes = likes.includes(userId)
      ? likes.filter((id) => id !== userId)
      : [...likes, userId];

    transaction.update(reference, {
      likes: nextLikes,
      likeCount: nextLikes.length,
      updatedAt: serverTimestamp(),
    });
  });
};

export const getReplies = async (postId: string): Promise<Reply[]> => {
  try {
    const repliesQuery = query(repliesCol(postId), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(repliesQuery);
    if (snapshot.empty && getSeedPost(postId)) return getSeedReplies(postId);
    return snapshot.docs.map((item) => normalizeReply(item.id, item.data()));
  } catch (error) {
    const replies = getSeedReplies(postId);
    if (replies.length > 0 || getSeedPost(postId)) return replies;
    throw error;
  }
};

export const subscribeToReplies = (
  postId: string,
  callback: (replies: Reply[], source: ForumDataSource) => void,
  onError?: (error: Error) => void,
) => {
  const repliesQuery = query(repliesCol(postId), orderBy('createdAt', 'asc'));
  return onSnapshot(
    repliesQuery,
    (snapshot) => {
      const sampleReplies = getSeedReplies(postId);
      if (snapshot.empty && sampleReplies.length > 0) {
        callback(sampleReplies, 'sample');
        return;
      }
      callback(
        snapshot.docs.map((item) => normalizeReply(item.id, item.data())),
        'firebase',
      );
    },
    (error) => {
      callback(getSeedReplies(postId), 'sample');
      onError?.(error);
    },
  );
};

export const addReply = async (
  postId: string,
  data: { content: string; authorId: string; authorName: string; authorPhoto?: string },
): Promise<void> => {
  const batch = writeBatch(db);
  const replyReference = doc(repliesCol(postId));

  batch.set(replyReference, {
    ...data,
    likeCount: 0,
    likes: [],
    createdAt: serverTimestamp(),
  });
  batch.update(postRef(postId), {
    replyCount: increment(1),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
};
