import { useEffect, useState } from 'react';
import { getUsersByRole, updateUserRole } from '../api/users';
import { useAuth } from '../contexts/AuthContext';
import type { UserRoleItem } from '../types/user';

const roleLabels: Record<UserRoleItem['role'], string> = {
  student: 'student',
  committee: 'committee',
  admin: 'admin',
};

function RoleAdmin() {
  const { user } = useAuth();
  const [roleFilter, setRoleFilter] = useState<UserRoleItem['role']>('student');
  const [users, setUsers] = useState<UserRoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManage = user?.role === 'admin';

  const loadUsers = async (role: UserRoleItem['role']) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsersByRole(role, { page: 1, size: 50 });
      setUsers(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) {
      loadUsers(roleFilter);
    }
  }, [roleFilter, canManage]);

  const handleRoleChange = async (userId: number, role: UserRoleItem['role']) => {
    try {
      await updateUserRole(userId, role);
      await loadUsers(roleFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    }
  };

  if (!user) {
    return (
      <section>
        <h1>角色管理</h1>
        <p className="small-muted">请先登录后操作。</p>
      </section>
    );
  }

  if (!canManage) {
    return (
      <section>
        <h1>角色管理</h1>
        <div className="card">
          <p className="small-muted">当前角色为 {user.role}，仅管理员可管理角色。</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0 }}>角色管理</h1>
          <p className="small-muted" style={{ marginTop: '0.5rem' }}>仅管理员可调整用户角色</p>
        </div>
        <select
          className="form-input"
          style={{ maxWidth: '220px' }}
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as UserRoleItem['role'])}
        >
          <option value="student">student</option>
          <option value="committee">committee</option>
          <option value="admin">admin</option>
        </select>
      </div>

      {error && <p className="small-muted" style={{ color: 'var(--error)' }}>{error}</p>}

      {loading ? (
        <p className="small-muted">加载中...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {users.length === 0 ? (
            <div className="card">
              <p className="small-muted">暂无该角色用户</p>
            </div>
          ) : (
            users.map((item) => (
              <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.nickname || item.username}</div>
                  <div className="small-muted">@{item.username} · {roleLabels[item.role]}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {item.role !== 'student' && (
                    <button className="btn btn-outline" onClick={() => handleRoleChange(item.id, 'student')}>
                      设为 student
                    </button>
                  )}
                  {item.role !== 'committee' && (
                    <button className="btn btn-outline" onClick={() => handleRoleChange(item.id, 'committee')}>
                      设为 committee
                    </button>
                  )}
                  {item.role !== 'admin' && (
                    <button className="btn btn-outline" onClick={() => handleRoleChange(item.id, 'admin')}>
                      设为 admin
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}

export default RoleAdmin;
