import React, { useState } from 'react';
import { useOptimisticMutation } from './hooks/useOptimisticMutation';

// --- FAKE API ---
const fakeApiCall = async (postId: number, liked: boolean): Promise<{ success: boolean }> => {
  const delay = Math.floor(Math.random() * 1000) + 500; // 500-1500ms
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 30% chance of failure
      if (Math.random() < 0.3) {
        reject(new Error('Network error or server rejected the request.'));
      } else {
        resolve({ success: true });
      }
    }, delay);
  });
};

// --- TYPES & MOCK DATA ---
interface Post {
  id: number;
  content: string;
  liked: boolean;
  likesCount: number;
}

const initialPosts: Post[] = [
  { id: 1, content: 'Just started learning React! 🚀', liked: false, likesCount: 42 },
  { id: 2, content: 'Optimistic UI makes apps feel so snappy.', liked: false, likesCount: 15 },
  { id: 3, content: 'What is your favorite state management tool?', liked: true, likesCount: 89 },
  { id: 4, content: 'Eventual consistency can be tricky to wrap your head around.', liked: false, likesCount: 7 },
  { id: 5, content: 'Always handle your race conditions! 🏁', liked: false, likesCount: 24 },
];

export default function App() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const { mutate: toggleLike } = useOptimisticMutation<
    { success: boolean },
    { postId: number; targetLikedState: boolean },
    { previousPosts: Post[] } // Rollback context
  >({
    mutationFn: (variables) => fakeApiCall(variables.postId, variables.targetLikedState),
    onMutate: (variables) => {
      // Capture previous state for rollback
      const previousPosts = [...posts];
      
      // Optimistically update the state
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post.id === variables.postId) {
            const increment = variables.targetLikedState ? 1 : -1;
            return {
              ...post,
              liked: variables.targetLikedState,
              likesCount: post.likesCount + increment
            };
          }
          return post;
        })
      );
      
      return { previousPosts };
    },
    onError: (error, variables, context) => {
      // Rollback to previous state
      setPosts(context.previousPosts);
      showToast(`Failed to ${variables.targetLikedState ? 'like' : 'unlike'} post. Reverted change.`);
    },
    onSuccess: (data, variables) => {
      // Success logic (e.g., sync with server response)
    }
  });

  const handleToggleLike = (postId: number, currentLiked: boolean) => {
    const targetLikedState = !currentLiked;
    // Use postId as the mutationId to handle race conditions per-post
    toggleLike({ postId, targetLikedState }, `like-${postId}`);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Social Feed</h1>
      {toast && (
        <div style={{ 
          padding: '12px', 
          background: '#ff4d4f', 
          color: 'white', 
          borderRadius: '4px',
          marginBottom: '20px',
          transition: 'all 0.3s'
        }}>
          {toast}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {posts.map(post => (
          <div 
            key={post.id} 
            style={{ 
              padding: '16px', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              background: 'white'
            }}
          >
            <p style={{ fontSize: '18px', margin: '0 0 16px 0' }}>{post.content}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => handleToggleLike(post.id, post.liked)}
                style={{
                  background: post.liked ? '#e0f2fe' : '#f3f4f6',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  color: post.liked ? '#0284c7' : '#4b5563',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {post.liked ? '❤️ Liked' : '🤍 Like'}
              </button>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
