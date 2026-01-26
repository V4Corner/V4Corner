import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendVerificationCode } from '../api/verification';
import { checkUsername, checkEmail } from '../api/auth';
import { validatePasswordStrength } from '../utils/passwordValidator';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // 实时验证状态
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [emailStatus, setEmailStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof validatePasswordStrength> | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  // 从 localStorage 恢复冷却时间
  useEffect(() => {
    const savedTimestamp = localStorage.getItem('verificationTimestamp');

    if (savedTimestamp) {
      const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
      const remaining = 60 - elapsed; // 固定60秒冷却时间

      if (remaining > 0) {
        setCountdown(remaining);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              localStorage.removeItem('verificationTimestamp');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer); // 清理定时器
      } else {
        localStorage.removeItem('verificationCountdown');
        localStorage.removeItem('verificationTimestamp');
      }
    }
  }, []);

  // 用户名实时验证
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!username) {
        setUsernameStatus(null);
        return;
      }

      // 用户名格式验证
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        setUsernameStatus(null);
        return;
      }

      try {
        setUsernameStatus('checking');
        const result = await checkUsername(username);
        setUsernameStatus(result.available ? 'available' : 'taken');
      } catch (err) {
        setUsernameStatus(null);
      }
    };

    const timeoutId = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  // 邮箱实时验证
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!email) {
        setEmailStatus(null);
        return;
      }

      // 邮箱格式验证
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailStatus(null);
        return;
      }

      try {
        setEmailStatus('checking');
        const result = await checkEmail(email);
        setEmailStatus(result.available ? 'available' : 'taken');
      } catch (err) {
        setEmailStatus(null);
      }
    };

    const timeoutId = setTimeout(checkEmailAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  // 密码强度实时验证
  useEffect(() => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }
    setPasswordStrength(validatePasswordStrength(password));
  }, [password]);

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
        localStorage.setItem('verificationTimestamp', Date.now().toString());
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              localStorage.removeItem('verificationTimestamp');
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

    // 验证密码强度
    if (passwordStrength && !passwordStrength.isValid) {
      setError(passwordStrength.message);
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
            {usernameStatus === 'checking' && (
              <div className="validation-message checking">检查中...</div>
            )}
            {usernameStatus === 'available' && (
              <div className="validation-message success">✓ 用户名可用</div>
            )}
            {usernameStatus === 'taken' && (
              <div className="validation-message error">✗ 用户名已被注册</div>
            )}
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
            {emailStatus === 'checking' && (
              <div className="validation-message checking">检查中...</div>
            )}
            {emailStatus === 'available' && (
              <div className="validation-message success">✓ 邮箱可以使用</div>
            )}
            {emailStatus === 'taken' && (
              <div className="validation-message error">✗ 邮箱已被注册</div>
            )}
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
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="6-20个字符，至少包含两类字符"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={20}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M1 1l22 22M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  </svg>
                )}
              </button>
            </div>
            {passwordStrength && (
              <div className="password-strength">
                <div className="password-strength-header">
                  <span className="password-strength-label">密码强度：</span>
                  <span className={`password-strength-indicator ${passwordStrength.strength}`}>
                    {passwordStrength.strength === 'strong' && '强'}
                    {passwordStrength.strength === 'medium' && '中'}
                    {passwordStrength.strength === 'weak' && '弱'}
                  </span>
                </div>
                {!passwordStrength.isValid && passwordStrength.message && (
                  <div className="validation-message error">{passwordStrength.message}</div>
                )}
                {passwordStrength.isValid && (
                  <div className="validation-message success">✓ 密码强度符合要求</div>
                )}
                <div className="password-requirements">
                  <div className={passwordStrength.requirements.length ? 'requirement-met' : 'requirement-unmet'}>
                    {passwordStrength.requirements.length ? '✓' : '○'} 长度6-20个字符
                  </div>
                  <div className={passwordStrength.requirements.hasLowercase ? 'requirement-met' : 'requirement-unmet'}>
                    {passwordStrength.requirements.hasLowercase ? '✓' : '○'} 小写字母
                  </div>
                  <div className={passwordStrength.requirements.hasUppercase ? 'requirement-met' : 'requirement-unmet'}>
                    {passwordStrength.requirements.hasUppercase ? '✓' : '○'} 大写字母
                  </div>
                  <div className={passwordStrength.requirements.hasDigit ? 'requirement-met' : 'requirement-unmet'}>
                    {passwordStrength.requirements.hasDigit ? '✓' : '○'} 数字
                  </div>
                  <div className={passwordStrength.requirements.hasSpecial ? 'requirement-met' : 'requirement-unmet'}>
                    {passwordStrength.requirements.hasSpecial ? '✓' : '○'} 特殊符号
                  </div>
                  <div className={passwordStrength.requirements.minTypes ? 'requirement-met' : 'requirement-unmet'}>
                    {passwordStrength.requirements.minTypes ? '✓' : '○'} 至少两类字符
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">确认密码</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                className="form-input"
                placeholder="再次输入密码"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPasswordConfirm ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M1 1l22 22M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  </svg>
                )}
              </button>
            </div>
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
