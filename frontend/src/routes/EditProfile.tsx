import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUser, updateUser } from '../api/users';
import type { UpdateUserRequest } from '../types/user';

function EditProfile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [classField, setClassField] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setClassField(user.class || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('请先登录');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const data: UpdateUserRequest = {};
      if (nickname !== user.nickname) data.nickname = nickname || undefined;
      if (classField !== user.class) data.class = classField || undefined;
      if (bio !== user.bio) data.bio = bio || undefined;

      await updateUser(data);
      await refreshUser();

      setSuccess(true);
      setTimeout(() => {
        navigate(`/users/${user.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      navigate(`/users/${user.id}`);
    } else {
      navigate('/');
    }
  };

  if (!user) {
    return <p>请先登录</p>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>编辑资料</h1>

      {success && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}
        >
          更新成功！正在跳转...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            用户名
          </label>
          <input
            type="text"
            value={user.username}
            disabled
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#f1f5f9',
              color: '#64748b'
            }}
          />
          <p className="small-muted" style={{ marginTop: '0.25rem' }}>用户名不可修改</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            邮箱
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#f1f5f9',
              color: '#64748b'
            }}
          />
          <p className="small-muted" style={{ marginTop: '0.25rem' }}>邮箱不可修改</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="nickname" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            昵称
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入昵称"
            maxLength={20}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <p className="small-muted" style={{ marginTop: '0.25rem' }}>2-20字符</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="class" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            班级/学校
          </label>
          <input
            id="class"
            type="text"
            value={classField}
            onChange={(e) => setClassField(e.target.value)}
            placeholder="例如：车辆4班 · 清华大学"
            maxLength={100}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <p className="small-muted" style={{ marginTop: '0.25rem' }}>最多100字符</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="bio" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            个人简介
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="介绍一下自己..."
            maxLength={200}
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
          <p className="small-muted" style={{ marginTop: '0.25rem' }}>最多200字符</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-outline"
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
