import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConversation, getMessages, sendMessageStream, submitFeedback } from '../api/chat';
import type { Message, StreamChunk } from '../types/chat';

export default function ChatDetail() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState<string>('加载中...');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载对话详情和消息
  const loadConversation = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const [convData, messagesData] = await Promise.all([
        getConversation(parseInt(conversationId)),
        getMessages(parseInt(conversationId))
      ]);

      setTitle(convData.title);
      setMessages(messagesData.items);
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 页头 */}
      <div style={{
        padding: '1rem 2rem',
        borderBottom: '2px solid #e2e8f0',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '768px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              onClick={() => navigate('/chat')}
              style={{ fontSize: '1.5rem', cursor: 'pointer', userSelect: 'none' }}
            >
              ←
            </span>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem 1rem',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', paddingBottom: '120px' }}>
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
          {messages.map((msg) => (
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
                {/* 简单的 Markdown 渲染 */}
                <div dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/`([^`]+)`/g, '<code style="background: rgba(15, 23, 42, 0.1); padding: 0.2rem 0.4rem; border-radius: 4px;">$1</code>')
                }} />
              </div>

              {/* AI 消息操作按钮 */}
              {msg.role === 'assistant' && (
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
          ))}

          {/* 正在生成指示器 */}
          {sending && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                <span>🤖 AI</span>
                <span>·</span>
                <span>刚刚</span>
              </div>
              <div style={{
                display: 'flex',
                gap: '0.25rem',
                padding: '1rem 1.25rem',
                backgroundColor: '#f1f5f9',
                borderRadius: '12px',
                width: 'fit-content'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#64748b',
                  borderRadius: '50%',
                  animation: 'typingBounce 1.4s infinite'
                }} />
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#64748b',
                  borderRadius: '50%',
                  animation: 'typingBounce 1.4s infinite 0.2s'
                }} />
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#64748b',
                  borderRadius: '50%',
                  animation: 'typingBounce 1.4s infinite 0.4s'
                }} />
              </div>
            </div>
          )}

          {/* 自动滚动锚点 */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, rgba(255, 255, 255, 0.95) 80%, transparent)',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '768px',
          width: '100%',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '0.75rem',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)'
        }}>
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
        `}
      </style>
    </div>
  );
}
