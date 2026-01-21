import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendVerificationCode } from '../api/verification';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();

  // 发送验证码
  const handleSendCode = async () => {
    // 验证邮箱格式
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    setIsSendingCode(true);
    setError('');

    try {
      const response = await sendVerificationCode({ email, type: 'register' });
      if (response.success) {
        // 开始倒计时（60秒）
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送验证码失败');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // 客户端验证
    if (password !== passwordConfirm) {
      setError('两次密码不一致');
      return;
    }

    if (!verificationCode) {
      setError('请输入验证码');
      return;
    }

    setIsLoading(true);

    try {
      await register(username, email, password, passwordConfirm, verificationCode, nickname || undefined);
      // 注册成功后自动登录并跳转到首页
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="card">
        <h2 className="form-title">注册 V4Corner</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              placeholder="3-20个字符"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$"
            />
            <div className="form-help">3-20个字符，字母数字下划线</div>
          </div>
          <div className="form-group">
            <label className="form-label">邮箱</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">验证码</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="4-6位数字"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                minLength={4}
                maxLength={6}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleSendCode}
                disabled={isSendingCode || countdown > 0}
                style={{ minWidth: '120px' }}
              >
                {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}秒` : '发送验证码'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              placeholder="至少6个字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={20}
            />
            <div className="form-help">至少6个字符</div>
          </div>
          <div className="form-group">
            <label className="form-label">确认密码</label>
            <input
              type="password"
              className="form-input"
              placeholder="再次输入密码"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">昵称（可选）</label>
            <input
              type="text"
              className="form-input"
              placeholder="2-20个字符"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              minLength={2}
              maxLength={20}
            />
          </div>
          {error && <div className="form-error show">{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/login')}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? '注册中...' : '注册'}
            </button>
          </div>
          <div className="form-link">
            已有账号？<Link to="/login">立即登录</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
