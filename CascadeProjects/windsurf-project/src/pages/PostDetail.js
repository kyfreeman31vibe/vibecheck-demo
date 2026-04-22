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
          {(comment.user?.name || 'U').charAt(0).toUpperCase()}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/app/dashboard" className="btn ghost small" style={{ padding: '6px 8px', textDecoration: 'none' }}>
            ←
          </Link>
          <div>
            <h2 style={{ fontSize: '1.1rem' }}>{post.user?.name}'s {typeLabels[post.postType] || 'Post'}</h2>
            <p className="caption" style={{ fontSize: '0.75rem' }}>{formatTimeAgo(post.createdAt)}</p>
          </div>
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

      {/* Reaction buttons */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[{ key: 'heart', icon: '❤️', offIcon: '🤍' }, { key: 'like', icon: '👍', offIcon: '👍' }, { key: 'dislike', icon: '👎', offIcon: '👎' }].map(function (r) {
          var isActive = myReaction === r.key;
          var count = counts[r.key] || 0;
          return (
            <button
              key={r.key}
              type="button"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 999,
                fontSize: '0.85rem', cursor: 'pointer',
                border: isActive ? 'none' : '1px solid var(--border-glass)',
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                color: 'var(--text)',
                transition: 'all 0.2s ease',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
              onPointerDown={() => toggleReaction(r.key)}
            >
              <span style={{ fontSize: 16 }}>{isActive ? r.icon : r.offIcon}</span>
              {count > 0 && <span style={{ fontSize: 13, fontWeight: 600 }}>{count}</span>}
            </button>
          );
        })}
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
          {submitting ? <span className="btn-spinner" /> : 'Post'}
        </button>
      </div>

      {/* Comments */}
      {commentsLoading ? (
        <div className="list" style={{ marginTop: 12 }}>
          {[0, 1].map((i) => (
            <div key={i} className="skeleton-card skeleton" style={{ animationDelay: (i * 100) + 'ms' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="skeleton skeleton-circle" style={{ width: 36, height: 36 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-line" style={{ width: '40%' }} />
                  <div className="skeleton skeleton-line" style={{ width: '80%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
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
