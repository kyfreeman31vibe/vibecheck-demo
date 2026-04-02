import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { useComments } from '../hooks/useComments';
import { usePostReactions } from '../hooks/usePostReactions';
import { useAuth } from '../auth/AuthContext';

function formatTimeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' min';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

function CommentThread({ comment, replies, onReply, onDelete, currentUserId }) {
  const [showReplies, setShowReplies] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  async function handleReply() {
    if (!replyText.trim()) return;
    setReplying(true);
    await onReply(replyText.trim(), comment.id);
    setReplyText('');
    setReplying(false);
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div className="avatar-circle" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
          {(comment.user?.name || '?').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <strong style={{ fontSize: 14 }}>{comment.user?.name || 'Unknown'}</strong>
            <span className="caption">{formatTimeAgo(comment.createdAt)}</span>
          </div>
          <div style={{ fontSize: 14, marginTop: 2 }}>{comment.content}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button
              type="button"
              className="btn ghost small"
              style={{ padding: '2px 0', fontSize: '0.8rem' }}
              onPointerDown={() => setReplying((prev) => !prev)}
            >
              Reply
            </button>
            {currentUserId === comment.userId && (
              <button
                type="button"
                className="btn ghost small"
                style={{ padding: '2px 0', fontSize: '0.8rem', color: 'var(--danger)' }}
                onPointerDown={() => onDelete(comment.id)}
              >
                Delete
              </button>
            )}
          </div>

          {replying && (
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <input
                className="input"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleReply(); } }}
                style={{ flex: 1, fontSize: 13 }}
              />
              <button type="button" className="btn small primary" onPointerDown={handleReply}>Send</button>
            </div>
          )}

          {replies && replies.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                className="btn ghost small"
                style={{ padding: '2px 0', fontSize: '0.8rem' }}
                onPointerDown={() => setShowReplies((prev) => !prev)}
              >
                {showReplies ? 'Hide replies' : 'Show ' + replies.length + ' replies'}
              </button>
              {showReplies && (
                <div style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: 12, marginTop: 4 }}>
                  {replies.map((reply) => (
                    <CommentThread
                      key={reply.id}
                      comment={reply}
                      replies={[]}
                      onReply={onReply}
                      onDelete={onDelete}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PostContent({ post }) {
  if (post.postType === 'song') {
    return (
      <div className="section glass" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>🎵</span>
          <strong>{post.songTitle}</strong>
          <span className="caption">by {post.songArtist}</span>
        </div>
        {post.content && post.content !== (post.songTitle + ' by ' + post.songArtist) && (
          <div style={{ fontSize: 14 }}>{post.content}</div>
        )}
      </div>
    );
  }

  if (post.postType === 'playlist') {
    const songs = post.playlistSongs || [];
    return (
      <div className="section glass" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>🎶</span>
          <strong>{post.playlistName}</strong>
        </div>
        {post.content && post.content !== post.playlistName && (
          <div style={{ fontSize: 14, marginBottom: 8 }}>{post.content}</div>
        )}
        {songs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {songs.map((s, i) => (
              <div key={i} className="caption">{i + 1}. {s.title} — {s.artist}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Musical thought (default)
  return (
    <div className="section glass" style={{ padding: 16 }}>
      <div style={{ fontSize: 15, lineHeight: 1.6 }}>{post.content}</div>
    </div>
  );
}

export function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { posts } = usePosts();
  const { topLevel, repliesByParent, loading: commentsLoading, addComment, deleteComment } = useComments(id);
  const { counts, total, myReaction, toggleReaction } = usePostReactions(id);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="page">
        <header className="page-header">
          <div><h2>Post not found</h2></div>
        </header>
        <Link to="/app/dashboard" className="btn ghost">← Back to Home</Link>
      </div>
    );
  }

  const typeLabels = { thought: 'Musical Thought', song: 'Song', playlist: 'Playlist' };

  async function handleAddComment() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    await addComment(newComment.trim());
    setNewComment('');
    setSubmitting(false);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/app/dashboard" style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
          <h2 style={{ marginTop: 4 }}>{post.user?.name}'s {typeLabels[post.postType] || 'Post'}</h2>
        </div>
      </header>

      <PostContent post={post} />

      {/* Reaction + comment count summary */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, marginBottom: 4 }}>
        <span className="caption" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {total > 0 && <>{total} reaction{total !== 1 ? 's' : ''}</>}
        </span>
        <span className="caption">
          {topLevel.length > 0 && <>{topLevel.length} comment{topLevel.length !== 1 ? 's' : ''}</>}
        </span>
      </div>

      {/* Reaction buttons matching wireframe 2 */}
      <div style={{ display: 'flex', gap: 16, padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          type="button"
          className="btn ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: myReaction === 'heart' ? 1 : 0.6 }}
          onPointerDown={() => toggleReaction('heart')}
        >
          {myReaction === 'heart' ? '❤️' : '🤍'} {counts.heart > 0 && counts.heart}
        </button>
        <button
          type="button"
          className="btn ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: myReaction === 'like' ? 1 : 0.6 }}
          onPointerDown={() => toggleReaction('like')}
        >
          👍 {counts.like > 0 && counts.like}
        </button>
        <button
          type="button"
          className="btn ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: myReaction === 'dislike' ? 1 : 0.6 }}
          onPointerDown={() => toggleReaction('dislike')}
        >
          👎 {counts.dislike > 0 && counts.dislike}
        </button>
      </div>

      {/* Add comment */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          className="input"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(); } }}
          style={{ flex: 1 }}
        />
        <button type="button" className="btn primary small" onPointerDown={handleAddComment} disabled={submitting || !newComment.trim()}>
          {submitting ? '...' : 'Post'}
        </button>
      </div>

      {/* Comments */}
      {commentsLoading ? (
        <p className="caption" style={{ marginTop: 12 }}>Loading comments...</p>
      ) : (
        <div style={{ marginTop: 8 }}>
          {topLevel.length === 0 && (
            <p className="caption" style={{ marginTop: 8 }}>No comments yet. Be the first!</p>
          )}
          {topLevel.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              replies={repliesByParent[comment.id] || []}
              onReply={addComment}
              onDelete={deleteComment}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
