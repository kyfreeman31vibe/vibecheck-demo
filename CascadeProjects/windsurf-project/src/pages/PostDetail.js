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
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div className="avatar-circle">
          {(comment.user?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <strong style={{ fontSize: '0.875rem' }}>{comment.user?.name || 'Unknown'}</strong>
            <span className="caption">{formatTimeAgo(comment.createdAt)}</span>
          </div>
          <div style={{ fontSize: '0.875rem', marginTop: 8 }}>{comment.content}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <button
              type="button"
              className="btn ghost small"
              onPointerDown={() => setReplying((prev) => !prev)}
            >
              Reply
            </button>
            {currentUserId === comment.userId && (
              <button
                type="button"
                className="btn ghost small"
                style={{ color: 'var(--danger)' }}
                onPointerDown={() => onDelete(comment.id)}
              >
                Delete
              </button>
            )}
          </div>

          {replying && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                className="input"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleReply(); } }}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn small primary" onPointerDown={handleReply}>Send</button>
            </div>
          )}

          {replies && replies.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn ghost small"
                onPointerDown={() => setShowReplies((prev) => !prev)}
              >
                {showReplies ? 'Hide replies' : 'Show ' + replies.length + ' replies'}
              </button>
              {showReplies && (
                <div style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: 16, marginTop: 8 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="album-art">🎵</div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '0.875rem' }}>{post.songTitle}</strong>
            <div className="caption" style={{ marginTop: 4 }}>by {post.songArtist}</div>
            {post.content && post.content !== (post.songTitle + ' by ' + post.songArtist) && (
              <div style={{ fontSize: '0.875rem', marginTop: 8 }}>{post.content}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (post.postType === 'playlist') {
    const songs = post.playlistSongs || [];
    return (
      <div className="section glass" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div className="playlist-cover">🎶</div>
          <div style={{ flex: 1 }}>
            <strong>{post.playlistName}</strong>
            <div className="caption" style={{ marginTop: 4 }}>{songs.length} track{songs.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        {post.content && post.content !== post.playlistName && (
          <div style={{ fontSize: '0.875rem', marginBottom: 8 }}>{post.content}</div>
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
      <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{post.content}</div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/app/dashboard" className="btn ghost small" style={{ textDecoration: 'none' }}>
            ←
          </Link>
          <div>
            <h2 style={{ fontSize: '1rem' }}>{post.user?.name}'s {typeLabels[post.postType] || 'Post'}</h2>
            <p className="caption">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
      </header>

      <PostContent post={post} />

      {/* Reaction + comment count summary */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
        <span className="caption" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {total > 0 && <>{total} reaction{total !== 1 ? 's' : ''}</>}
        </span>
        <span className="caption">
          {topLevel.length > 0 && <>{topLevel.length} comment{topLevel.length !== 1 ? 's' : ''}</>}
        </span>
      </div>

      {/* Reaction buttons */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[{ key: 'heart', icon: '❤️', offIcon: '🤍' }, { key: 'like', icon: '👍', offIcon: '👍' }, { key: 'dislike', icon: '👎', offIcon: '👎' }].map(function (r) {
          var isActive = myReaction === r.key;
          var count = counts[r.key] || 0;
          return (
            <button
              key={r.key}
              type="button"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 999,
                fontSize: '0.875rem', cursor: 'pointer',
                border: isActive ? 'none' : '1px solid var(--border-glass)',
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                color: 'var(--text)',
                transition: 'all 0.2s ease',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
              onPointerDown={() => toggleReaction(r.key)}
            >
              <span style={{ fontSize: 16 }}>{isActive ? r.icon : r.offIcon}</span>
              {count > 0 && <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Add comment */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
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
        <div className="list" style={{ marginTop: 16 }}>
          {[0, 1].map((i) => (
            <div key={i} className="skeleton-card skeleton" style={{ animationDelay: (i * 100) + 'ms' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="skeleton skeleton-circle" style={{ width: 40, height: 40 }} />
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
