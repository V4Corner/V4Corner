import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createConversation, deleteConversation, getConversation, getConversations, getMessages, sendMessageStream, submitFeedback } from '../api/chat';
import type { ConversationListItem, Message, StreamChunk } from '../types/chat';

export default function ChatDetail() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [title, setTitle] = useState<string>('加载中...');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateConversation = async () => {
    try {
      const newConversation = await createConversation({ title: '新对话' });
      navigate(`/chat/${newConversation.id}`);
    } catch (err: any) {
      setError(err.message || '创建对话失败');
    }
  };

  const handleDeleteConversation = async (
    conversation: ConversationListItem,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    const confirmed = window.confirm(`确定要删除「${conversation.title}」吗？此操作无法撤销。`);
    if (!confirmed) return;

    try {
      await deleteConversation(conversation.id);

      const remainingConversations = conversations.filter((item) => item.id !== conversation.id);
      setConversations(remainingConversations);

      if (conversation.id === Number(conversationId)) {
        if (remainingConversations.length > 0) {
          navigate(`/chat/${remainingConversations[0].id}`);
        } else {
          navigate('/chat');
        }
      }
    } catch (err: any) {
      setError(err.message || '删除对话失败');
    }
  };

  // 加载对话详情和消息
  const loadConversation = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const [convData, messagesData, conversationsData] = await Promise.all([
        getConversation(parseInt(conversationId)),
        getMessages(parseInt(conversationId)),
        getConversations({ page: 1, size: 30 })
      ]);

      setTitle(convData.title);
      setMessages(messagesData.items);
      setConversations(conversationsData.items);
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 发送消息
  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending || !conversationId) return;

    setInput('');
    setSending(true);
    setError(null);

    try {
      // 立即添加用户消息
      const userMessage: Message = {
        id: Date.now(), // 临时ID
        role: 'user',
        content,
        tokens_used: null,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // 创建一个空的AI消息占位符
      const aiMessageId = Date.now() + 1;
      const aiMessagePlaceholder: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        tokens_used: null,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessagePlaceholder]);

      // 流式发送消息
      await sendMessageStream(
        parseInt(conversationId),
        { content },
        // onChunk
        (chunk: StreamChunk) => {
          setMessages(prev => prev.map(msg => {
            if (msg.id === aiMessageId) {
              return {
                ...msg,
                content: chunk.content
              };
            }
            return msg;
          }));
        },
        // onComplete
        () => {
          setSending(false);
          scrollToBottom();
        },
        // onError
        (err) => {
          setError(err.message || '发送失败');
          setSending(false);
        }
      );
    } catch (err: any) {
      setError(err.message || '发送失败');
      setSending(false);
    }
  };

  // 处理键盘快捷键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 自动调整文本框高度
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  // 提交反馈
  const handleFeedback = async (messageId: number, feedback: 'helpful' | 'not_helpful') => {
    if (!conversationId) return;

    try {
      await submitFeedback(parseInt(conversationId), messageId, { feedback });
      // 更新消息状态，禁用反馈按钮
      // 这里可以添加状态标记已反馈的消息
    } catch (err: any) {
      console.error('反馈失败:', err);
    }
  };

  // 复制消息内容
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      alert('已复制到剪贴板');
    }).catch(() => {
      alert('复制失败');
    });
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;

    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div className="chat-detail-page">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-top">
          <button className="chat-sidebar-primary" onClick={handleCreateConversation}>
            新对话
          </button>
        </div>
        <div className="chat-sidebar-title">历史聊天</div>
        <div className="chat-history-list">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`chat-history-item ${conversation.id === Number(conversationId) ? 'active' : ''}`}
              onClick={() => navigate(`/chat/${conversation.id}`)}
            >
              <div className="chat-history-content">
                <span className="chat-history-name">{conversation.title}</span>
                <span className="chat-history-meta">
                  {conversation.message_count} 条消息 · {formatTime(conversation.updated_at)}
                </span>
              </div>
              <button
                className="chat-history-delete"
                onClick={(event) => handleDeleteConversation(conversation, event)}
                title={`删除 ${conversation.title}`}
                aria-label={`删除 ${conversation.title}`}
              >
                🗑
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="chat-history-empty">还没有历史对话</div>
          )}
        </div>
      </aside>

      <section className="chat-panel">
        <div className="chat-panel-header">
          <button className="chat-back-button" onClick={() => navigate('/chat')}>
            ←
          </button>
          <h2>{title}</h2>
        </div>

        <div className="chat-message-scroll">
        <div className="chat-message-inner">
          {/* 欢迎消息 */}
          {messages.length === 0 && (
            <div style={{
              backgroundColor: '#f1f5f9',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                <span>🤖 AI</span>
                <span>·</span>
                <span>刚刚</span>
              </div>
              <div style={{ lineHeight: '1.6' }}>
                <p>你好！我是V4Corner的AI助手。</p>
                <p>我可以帮助你：</p>
                <ul>
                  <li>解答学习问题</li>
                  <li>代码调试和优化</li>
                  <li>项目建议和思路讨论</li>
                  <li>文档和资料查询</li>
                </ul>
                <p>有什么我可以帮助你的吗？</p>
              </div>
            </div>
          )}

          {/* 消息列表 */}
          {messages.map((msg) => {
            const isAssistantThinking = msg.role === 'assistant' && sending && !msg.content;

            return (
            <div
              key={msg.id}
              style={{
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* 消息头部 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.85rem',
                color: '#64748b'
              }}>
                <span>{msg.role === 'user' ? '👤' : '🤖'}</span>
                <span style={{ fontWeight: '600' }}>
                  {msg.role === 'user' ? '用户' : 'AI'}
                </span>
                <span>·</span>
                <span>{formatTime(msg.created_at)}</span>
              </div>

              {/* 消息气泡 */}
              <div
                style={{
                  padding: msg.role === 'user' ? '1rem 1.25rem' : '1rem 1.25rem',
                  borderRadius: '12px',
                  lineHeight: '1.6',
                  maxWidth: msg.role === 'user' ? '70%' : '85%',
                  backgroundColor: msg.role === 'user' ? '#0f172a' : '#f1f5f9',
                  color: msg.role === 'user' ? 'white' : '#0f172a',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginLeft: msg.role === 'user' ? 'auto' : '0'
                }}
              >
                {isAssistantThinking ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
                    <span>正在思考</span>
                    <span style={{ display: 'inline-flex', gap: '0.25rem' }}>
                      <span className="typing-dot" />
                      <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
                      <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
                    </span>
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\n/g, '<br>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`([^`]+)`/g, '<code style="background: rgba(15, 23, 42, 0.1); padding: 0.2rem 0.4rem; border-radius: 4px;">$1</code>')
                  }} />
                )}
              </div>

              {/* AI 消息操作按钮 */}
              {msg.role === 'assistant' && msg.content && (
                <div
                  style={{
                    display: 'none',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                    fontSize: '0.85rem'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.display = 'flex'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.display = 'none'; }}
                >
                  <button
                    onClick={() => handleCopy(msg.content)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                      color: '#64748b',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                  >
                    📋 复制
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 'helpful')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                      color: '#64748b',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                  >
                    👍 有帮助
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 'not_helpful')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                      color: '#64748b',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                  >
                    👎 无帮助
                  </button>
                </div>
              )}
            </div>
            );
          })}

          {/* 自动滚动锚点 */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="chat-composer">
        <div className="chat-composer-box">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="输入消息给AI... (Enter 发送，Shift+Enter 换行)"
            disabled={sending}
            rows={1}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'none',
              maxHeight: '200px',
              lineHeight: '1.6',
              background: 'transparent'
            }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            style={{
              backgroundColor: '#0f172a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              opacity: sending || !input.trim() ? 0.5 : 1
            }}
          >
            {sending ? '发送中...' : '发送 📤'}
          </button>
        </div>
      </div>
      </section>

      {/* 错误提示 */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000
        }}>
          {error}
        </div>
      )}

      {/* 添加打字动画样式 */}
      <style>
        {`
          @keyframes typingBounce {
            0%, 60%, 100% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-8px);
            }
          }
          .typing-dot {
            width: 7px;
            height: 7px;
            background-color: #64748b;
            border-radius: 50%;
            animation: typingBounce 1.4s infinite;
          }
        `}
      </style>
    </div>
  );
}
