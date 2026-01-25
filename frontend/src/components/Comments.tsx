// 评论组件 - 支持楼中楼、编辑、删除、排序

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as commentsApi from '../api/comments';
import { API_BASE } from '../api/client';
import type { Comment, CommentSortType } from '../types/comment';

interface CommentsProps {
  blogId: number;
  blogAuthorId: number;
}

export default function Comments({ blogId, blogAuthorId }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<CommentSortType>('asc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 新建评论
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // 编辑评论
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  // 错误提示
  const [errorMessage, setErrorMessage] = useState('');

  const pageSize = 20;
  const MAX_COMMENT_LENGTH = 200;

  // 加载评论
  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await commentsApi.getBlogComments(blogId, {
        sort,
        page,
        size: pageSize,
      });
      setComments(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [blogId, sort, page]);

  // 发表评论
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    // 检查字数限制
    if (newComment.length > MAX_COMMENT_LENGTH) {
      setErrorMessage(`评论内容不能超过${MAX_COMMENT_LENGTH}字`);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      await commentsApi.createComment(blogId, {
        content: newComment,
      });
      setNewComment('');
      setErrorMessage('');
      await loadComments();
    } catch (error: any) {
      // 处理不同类型的错误
      if (error.response?.status === 429) {
        // 频率限制错误
        setErrorMessage('评论太快了，请稍后再试');
      } else if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail);
      } else {
        setErrorMessage(error.message || '发表评论失败');
      }
      // 3秒后清除错误提示
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // 回复评论
  const handleReply = async (parentId: number) => {
    if (!replyContent.trim()) return;

    // 检查字数限制
    if (replyContent.length > MAX_COMMENT_LENGTH) {
      setErrorMessage(`评论内容不能超过${MAX_COMMENT_LENGTH}字`);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      await commentsApi.createComment(blogId, {
        content: replyContent,
        parent_id: parentId,
      });
      setReplyContent('');
      setReplyingTo(null);
      setErrorMessage('');
      await loadComments();
    } catch (error: any) {
      if (error.response?.status === 429) {
        setErrorMessage('评论太快了，请稍后再试');
      } else {
        setErrorMessage(error.response?.data?.detail || error.message || '回复失败');
      }
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // 编辑评论
  const handleEdit = async (commentId: number) => {
    if (!editContent.trim()) return;

    // 检查字数限制
    if (editContent.length > MAX_COMMENT_LENGTH) {
      setErrorMessage(`评论内容不能超过${MAX_COMMENT_LENGTH}字`);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      await commentsApi.updateComment(commentId, {
        content: editContent,
      });
      setEditingId(null);
      setEditContent('');
      setErrorMessage('');
      await loadComments();
    } catch (error: any) {
      if (error.response?.status === 429) {
        setErrorMessage('评论太快了，请稍后再试');
      } else {
        setErrorMessage(error.response?.data?.detail || error.message || '编辑失败');
      }
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // 删除评论
  const handleDelete = async (commentId: number) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      await commentsApi.deleteComment(commentId);
      await loadComments();
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  // 构建嵌套结构（最多2层）
  const buildNestedComments = (flatComments: Comment[]) => {
    // 过滤掉已删除的评论
    const activeComments = flatComments.filter(c => !c.is_deleted);

    const topLevel = activeComments.filter(c => !c.parent_id);
    const replies = activeComments.filter(c => c.parent_id);

    return topLevel.map(comment => {
      const firstLevelReplies = replies.filter(r => r.parent_id === comment.id);
      const secondLevelReplies = firstLevelReplies.flatMap(reply =>
        replies.filter(r => r.parent_id === reply.id)
      );

      return {
        ...comment,
        replies: firstLevelReplies.map(reply => ({
          ...reply,
          replies: secondLevelReplies.filter(r => r.parent_id === reply.id),
        })),
      };
    });
  };

  const nestedComments = buildNestedComments(comments);

  // 渲染单条评论
  const renderComment = (comment: any, isNested = false) => {
    // 获取头像首字母
    const avatarLetter = (comment.author.nickname || comment.author.username || '?').charAt(0).toUpperCase();

    // 构建头像URL（如果有上传的头像）
    const avatarUrl = comment.author.avatar_url ? `${API_BASE}${comment.author.avatar_url}` : null;

    // 权限检查
    const isBlogAuthor = user?.id === blogAuthorId;
    const isCommentAuthor = user?.id === comment.author.id;
    const canEdit = isCommentAuthor;  // 只有评论作者可以编辑
    const canDelete = isCommentAuthor || isBlogAuthor;  // 评论作者或博客作者可以删除

    return (
      <div
        key={comment.id}
        style={isNested ? { marginLeft: '2rem', marginTop: '0.75rem', borderLeft: '2px solid #e2e8f0', paddingLeft: '1rem' } : { borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}
      >
        {/* 评论头部 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={comment.author.nickname || comment.author.username}
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              onError={(e) => {
                // 图片加载失败时隐藏并显示默认头像
                e.currentTarget.style.display = 'none';
                // 创建默认头像
                const fallback = document.createElement('div');
                fallback.style.cssText = 'width:32px;height:32px;border-radius:50%;background-color:#0f172a;color:white;display:flex;align-items:center;justify-content:center;font-size:0.875rem;font-weight:600;flex-shrink:0';
                fallback.textContent = avatarLetter;
                e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
              }}
            />
          ) : (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 600,
                flexShrink: 0
              }}
            >
              {avatarLetter}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 500, color: '#0f172a' }}>
                {comment.author.nickname || comment.author.username}
              </span>
              {comment.is_author && (
                <span style={{ fontSize: '0.75rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.125rem 0.5rem', borderRadius: '4px' }}>
                  作者
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {new Date(comment.created_at).toLocaleString('zh-CN')}
              </span>
              {comment.updated_at && (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(已编辑)</span>
              )}
            </div>

            {/* 回复信息 */}
            {comment.parent_author && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                回复 <span style={{ fontWeight: 500 }}>{comment.parent_author}</span>
              </div>
            )}

            {/* 评论内容 */}
            {editingId === comment.id ? (
              <div style={{ marginTop: '0.5rem' }}>
                <textarea
                  value={editContent}
                  onChange={(e) => {
                    const content = e.target.value;
                    if (content.length <= MAX_COMMENT_LENGTH) {
                      setEditContent(content);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                    minHeight: '60px',
                    maxHeight: '200px',
                    boxSizing: 'border-box'
                  }}
                  rows={3}
                  maxLength={MAX_COMMENT_LENGTH}
                />
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: editContent.length > MAX_COMMENT_LENGTH * 0.9 ? '#dc2626' : '#94a3b8' }}>
                    {editContent.length}/{MAX_COMMENT_LENGTH}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(comment.id)}
                      style={{ padding: '0.5rem 0.75rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      style={{ padding: '0.5rem 0.75rem', backgroundColor: '#e2e8f0', color: '#334155', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '0.5rem', color: '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {comment.content}
              </div>
            )}

            {/* 操作按钮 */}
            {user && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                {editingId !== comment.id && (
                  <>
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      回复
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                        style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        编辑
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        删除
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* 回复输入框 */}
            {replyingTo === comment.id && (
              <div style={{ marginTop: '0.75rem' }}>
                <textarea
                  value={replyContent}
                  onChange={(e) => {
                    const content = e.target.value;
                    if (content.length <= MAX_COMMENT_LENGTH) {
                      setReplyContent(content);
                    }
                  }}
                  placeholder="写下你的回复..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                    minHeight: '60px',
                    maxHeight: '200px',
                    boxSizing: 'border-box'
                  }}
                  rows={2}
                  maxLength={MAX_COMMENT_LENGTH}
                />
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: replyContent.length > MAX_COMMENT_LENGTH * 0.9 ? '#dc2626' : '#94a3b8' }}>
                    {replyContent.length}/{MAX_COMMENT_LENGTH}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleReply(comment.id)}
                      style={{ padding: '0.5rem 0.75rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                    >
                      发表回复
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                      style={{ padding: '0.5rem 0.75rem', backgroundColor: '#e2e8f0', color: '#334155', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 二级回复 */}
            {comment.replies && comment.replies.length > 0 && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {comment.replies.map((reply: any) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: '2rem', width: '100%' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>评论 ({total})</h2>

      {/* 错误提示 */}
      {errorMessage && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          fontSize: '0.875rem'
        }}>
          {errorMessage}
        </div>
      )}

      {/* 排序选择 */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#475569' }}>排序：</span>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as CommentSortType);
            setPage(1);
          }}
          style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
        >
          <option value="asc">时间正序</option>
          <option value="desc">时间倒序</option>
          <option value="hot">热度排序</option>
        </select>
      </div>

      {/* 发表评论 */}
      {user ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <textarea
            value={newComment}
            onChange={(e) => {
              const content = e.target.value;
              if (content.length <= MAX_COMMENT_LENGTH) {
                setNewComment(content);
              }
            }}
            placeholder="发表你的看法..."
            style={{
              width: '100%',
              maxWidth: '800px',
              display: 'block',
              margin: '0 auto',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'none',
              minHeight: '80px',
              maxHeight: '400px',
              boxSizing: 'border-box'
            }}
            rows={3}
            maxLength={MAX_COMMENT_LENGTH}
          />
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0.5rem auto 0' }}>
            <span style={{ fontSize: '0.875rem', color: newComment.length > MAX_COMMENT_LENGTH * 0.9 ? '#dc2626' : '#64748b' }}>
              {newComment.length}/{MAX_COMMENT_LENGTH}
            </span>
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: !newComment.trim() ? '#94a3b8' : '#2563eb',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: !newComment.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              发表评论
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center', color: '#475569' }}>
          请<a href="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>登录</a>后发表评论
        </div>
      )}

      {/* 评论列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>加载中...</div>
      ) : nestedComments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>暂无评论，快来发表第一条评论吧！</div>
      ) : (
        <div>
          {nestedComments.map((comment) => renderComment(comment))}

          {/* 分页 */}
          {total > pageSize && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              >
                上一页
              </button>
              <span style={{ padding: '0.5rem 1rem' }}>
                第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
