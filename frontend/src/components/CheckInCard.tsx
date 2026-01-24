import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckIn, getCheckInStatus } from '../api/checkin';
import type { CheckInResponse, CheckInStatus } from '../types/checkin';

// 农历月份名称
const LUNAR_MONTHS = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月'
];

// 星期名称
const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

// 倒计时目标日期（可配置）
const COUNTDOWN_TARGET = new Date('2025-06-30'); // 期末考试
const COUNTDOWN_LABEL = '期末考试';

/**
 * 获取运势对应的颜色
 * 大吉、中吉、小吉为红色，其他为黑色
 */
function getFortuneColor(fortune: string): string {
  if (fortune.includes('大吉') || fortune.includes('中吉') || fortune.includes('小吉')) {
    return '#dc2626'; // 红色
  }
  return '#1f2937'; // 黑色
}

function CheckInCard() {
  const { isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState<CheckInStatus | null>(null);
  const [result, setResult] = useState<CheckInResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const lunarMonth = LUNAR_MONTHS[today.getMonth()];
  const day = today.getDate();
  const weekday = WEEKDAYS[today.getDay()];

  // 计算倒计时天数
  const countdownDays = Math.max(0, Math.ceil((COUNTDOWN_TARGET.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setStatus(null);
      setResult(null);
      return;
    }

    const fetchStatus = async () => {
      try {
        const data = await getCheckInStatus();
        setStatus(data);

        // 如果今天已签到，尝试从 localStorage 读取结果
        if (data.checked_today) {
          const storageKey = `checkin_result_${user.id}`;
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            try {
              const storedData = JSON.parse(stored);
              // 检查是否是今天的签到结果
              if (storedData.checkin_date === todayStr) {
                setResult(storedData);
              }
            } catch (err) {
              console.error('Failed to parse stored check-in result:', err);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch check-in status:', err);
      }
    };

    fetchStatus();
  }, [isAuthenticated, user, todayStr]);

  const handleCheckIn = async () => {
    if (!isAuthenticated || loading || !user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await createCheckIn();
      setResult(data);
      setStatus({
        checked_today: true,
        current_streak: data.streak,
      });

      // 保存签到结果到 localStorage（使用带用户 ID 的 key）
      const storageKey = `checkin_result_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || '签到失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="card checkin-card">
        <div className="checkin-welcome">请先登录</div>
        <p className="small-muted">登录后即可签到</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="card checkin-card">
        <p className="small-muted">加载中...</p>
      </div>
    );
  }

  // 已签到，显示结果
  if (status.checked_today && result) {
    return (
      <div className="card checkin-card">
        <div className="checkin-result-title">{user?.nickname || user?.username} 的运势</div>
        <div className="checkin-fortune" style={{ color: getFortuneColor(result.fortune) }}>
          {result.fortune}
        </div>

        <div className="checkin-advice">
          <div className="advice-section good">
            <div className="advice-section-label" style={{ color: '#dc2626' }}>宜</div>
            {result.good.map((item, index) => (
              <div key={index} className="advice-card">
                <div className="advice-card-title" style={{ color: '#dc2626' }}>{item.title}</div>
                <div className="advice-card-desc">{item.desc}</div>
              </div>
            ))}
          </div>
          <div className="advice-section bad">
            <div className="advice-section-label" style={{ color: '#1f2937' }}>忌</div>
            {result.bad.map((item, index) => (
              <div key={index} className="advice-card bad">
                <div className="advice-card-title" style={{ color: '#1f2937' }}>{item.title}</div>
                <div className="advice-card-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="checkin-streak">
          你已经连续打卡了 <span>{status.current_streak}</span> 天
        </div>
      </div>
    );
  }

  // 已签到但结果不可用（比如换浏览器），显示简单状态
  if (status.checked_today) {
    return (
      <div className="card checkin-card">
        <div className="checkin-welcome">今日已签到</div>
        <div className="checkin-streak" style={{ marginTop: '1rem' }}>
          你已经连续打卡了 <span>{status.current_streak}</span> 天
        </div>
      </div>
    );
  }

  // 未签到，显示欢迎状态
  return (
    <div className="card checkin-card">
      <div className="checkin-welcome">欢迎回来，{user?.nickname || user?.username}</div>
      <div className="checkin-date">
        <span className="checkin-month">{lunarMonth}</span>
        <span className="checkin-day">{day}</span>
        <span className="checkin-weekday">{weekday}</span>
      </div>
      <div className="checkin-countdown">
        距{COUNTDOWN_LABEL}还剩 <span className="countdown-days">{countdownDays}</span> 天
      </div>
      {error && <p className="small-muted" style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      <button
        className="checkin-btn"
        onClick={handleCheckIn}
        disabled={loading}
      >
        {loading ? '签到中...' : '点击打卡'}
      </button>
    </div>
  );
}

export default CheckInCard;
