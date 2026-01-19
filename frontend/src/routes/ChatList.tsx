import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversations, createConversation, deleteConversation } from '../api/chat';
import type { ConversationListItem } from '../types/chat';

export default function ChatList() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 加载对话列表
  const loadConversations = async (query: string = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await getConversations({ q: query, page: 1, size: 20 });
      setConversations(response.items);
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // 搜索对话
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadConversations(searchQuery);
  };

  // 创建新对话
  const handleCreateConversation = async () => {
    try {
      const newConv = await createConversation({ title: '新对话' });
      navigate(`/chat/${newConv.id}`);
    } catch (err: any) {
      setError(err.message || '创建失败');
    }
  };

  // 删除对话
  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm('确定要删除这个对话吗？')) {
      return;
    }

    try {
      await deleteConversation(id);
      // 从列表中移除
      setConversations(conversations.filter(conv => conv.id !== id));
    } catch (err: any) {
      setError(err.message || '删除失败');
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* 页头 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>AI对话</h1>
        <button
          onClick={handleCreateConversation}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          + 新对话
        </button>
      </div>

      <hr style={{ border: 'none', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }} />

      {/* 搜索框 */}
      <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="搜索对话..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
        />
      </form>

      {/* 错误提示 */}
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          加载中...
        </div>
      ) : conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          {searchQuery ? '没有找到匹配的对话' : '还没有对话，点击上方按钮创建一个吧！'}
        </div>
      ) : (
        /* 对话列表 */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => navigate(`/chat/${conv.id}`)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                position: 'relative',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.06)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span>💬</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                      {conv.title}
                    </span>
                  </div>
                  {conv.last_message && (
                    <div style={{
                      color: '#64748b',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {conv.last_message}
                    </div>
                  )}
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {conv.message_count} 条消息 · {formatTime(conv.updated_at)}
                  </div>
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #dc2626',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    opacity: 0,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = '0';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
