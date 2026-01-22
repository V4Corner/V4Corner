"""
创建测试数据：班级通知和班级日程
运行方法: cd backend && python seed_test_data.py
"""

import sys
from datetime import datetime, date, time, timedelta, timezone

# Fix Windows console encoding
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
from models.notice import Notice
from models.calendar_event import CalendarEvent
from models.user import User


def seed_notices(db: Session, author: User):
    """创建班级通知测试数据"""

    notices_data = [
        {
            "title": "【重要】期末考试安排通知",
            "content": """# 期末考试安排

各位同学请注意，本学期期末考试将于 **2025年1月13日** 开始。具体安排如下：

- 1月13日 09:00-11:00 高等数学
- 1月14日 14:00-16:00 大学物理
- 1月15日 09:00-11:00 理论力学
- 1月16日 14:00-16:00 工程制图

**注意事项：**
1. 请携带学生证和身份证
2. 提前30分钟到达考场
3. 禁止携带手机等电子设备

预祝大家考试顺利！""",
            "is_important": True,
        },
        {
            "title": "关于寒假社会实践的报名通知",
            "content": """# 寒假社会实践报名

今年寒假社会实践主题为"科技助力乡村振兴"，现在开始报名。

**项目信息：**
- 时间：1月20日 - 2月10日
- 地点：云南省红河州
- 名额：20人

**报名方式：**
请于 **12月30日前** 填写报名表并发送至班级邮箱。

**实践内容：**
1. 支教活动
2. 科技调研
3. 文化交流

欢迎同学们积极参与！""",
            "is_important": True,
        },
        {
            "title": "本周班会时间调整",
            "content": """# 班会时间调整通知

原定于本周五下午3点的班会调整至 **周六晚上7点**。

**会议地点：** 三教3201

**会议议程：**
1. 学期总结
2. 期末考试动员
3. 寒假安排说明
4. 班级事务讨论

请各位同学准时参加，如有特殊情况请提前向班长请假。""",
            "is_important": False,
        },
        {
            "title": "图书馆新馆开放通知",
            "content": """# 图书馆新馆开放

校图书馆北馆已完成装修，将于 **12月25日** 正式开放。

**开放时间：**
- 周一至周五：7:00 - 22:00
- 周六、周日：8:00 - 22:00

**新馆特色：**
1. 增设400个自习座位
2. 24小时研讨室
3. 数字化阅读区
4. 休闲讨论区

欢迎同学们前往学习！""",
            "is_important": False,
        },
        {
            "title": "班级篮球赛报名",
            "content": """# 班级篮球赛

为增进班级友谊，丰富课余生活，班级将举办篮球友谊赛。

**比赛时间：** 12月28日 下午2点
**比赛地点：** 西区篮球场
**报名方式：** 联系体育委员

**比赛规则：**
- 5人制全场
- 上下半场各20分钟
- 每队限报10人

欢迎大家踊跃报名参加！""",
            "is_important": False,
        },
        {
            "title": "关于缴纳班费的通知",
            "content": """# 班费缴纳通知

本学期班费需要续交，每人 **100元**。

**缴费方式：**
微信转账至生活委员

**缴费截止时间：** 12月31日

**班费使用计划：**
1. 班级活动经费
2. 学习资料购买
3. 体育用品购置
4. 节日慰问品

请各位同学按时缴纳，谢谢配合！""",
            "is_important": False,
        },
    ]

    for notice_data in notices_data:
        notice = Notice(
            title=notice_data["title"],
            content=notice_data["content"],
            is_important=notice_data["is_important"],
            author_id=author.id,
            author_name=author.username,
            published_at=datetime.now(timezone.utc),
        )
        db.add(notice)

    db.commit()
    print(f"✓ 创建了 {len(notices_data)} 条班级通知")


def seed_calendar_events(db: Session, creator: User):
    """创建班级日程测试数据"""

    today = date.today()

    events_data = [
        # 本周事件
        {
            "title": "班会",
            "date": today + timedelta(days=2),
            "start_time": time(19, 0),
            "end_time": time(21, 0),
            "location": "三教3201",
            "description": "期末总结和新学期规划",
            "is_all_day": False,
            "importance": "high",
        },
        {
            "title": "高等数学期末考试",
            "date": today + timedelta(days=5),
            "start_time": time(9, 0),
            "end_time": time(11, 0),
            "location": "一教101",
            "description": "期末考试，记得带学生证",
            "is_all_day": False,
            "importance": "high",
        },
        # 下周事件
        {
            "title": "大学物理期末考试",
            "date": today + timedelta(days=7),
            "start_time": time(14, 0),
            "end_time": time(16, 0),
            "location": "二教201",
            "description": "期末考试",
            "is_all_day": False,
            "importance": "high",
        },
        {
            "title": "寒假实践出发",
            "date": today + timedelta(days=10),
            "start_time": time(8, 0),
            "end_time": None,
            "location": "校门口",
            "description": "集合出发前往云南",
            "is_all_day": False,
            "importance": "medium",
        },
        # 本月其他事件
        {
            "title": "班级篮球赛",
            "date": today + timedelta(days=12),
            "start_time": time(14, 0),
            "end_time": time(16, 0),
            "location": "西区篮球场",
            "description": "友谊赛",
            "is_all_day": False,
            "importance": "low",
        },
        {
            "title": "课程设计答辩",
            "date": today + timedelta(days=14),
            "start_time": time(9, 0),
            "end_time": time(12, 0),
            "location": "工程中心305",
            "description": "小组展示，准备PPT",
            "is_all_day": False,
            "importance": "high",
        },
        {
            "title": "寒假开始",
            "date": today + timedelta(days=18),
            "start_time": None,
            "end_time": None,
            "location": None,
            "description": "寒假放假第一天",
            "is_all_day": True,
            "importance": "medium",
        },
        # 过去几天的事件
        {
            "title": "英语四六级考试",
            "date": today - timedelta(days=2),
            "start_time": time(9, 0),
            "end_time": time(11, 30),
            "location": "外语楼",
            "description": "记得带2B铅笔和耳机",
            "is_all_day": False,
            "importance": "high",
        },
        {
            "title": "选课截止",
            "date": today - timedelta(days=1),
            "start_time": None,
            "end_time": None,
            "location": None,
            "description": "下学期选课系统关闭",
            "is_all_day": True,
            "importance": "high",
        },
        # 本月中的一些日常课程
        {
            "title": "理论力学",
            "date": today,
            "start_time": time(8, 0),
            "end_time": time(9, 35),
            "location": "三教2101",
            "description": "第15周课程",
            "is_all_day": False,
            "importance": "low",
        },
        {
            "title": "理论力学",
            "date": today + timedelta(days=1),
            "start_time": time(8, 0),
            "end_time": time(9, 35),
            "location": "三教2101",
            "description": "第15周课程",
            "is_all_day": False,
            "importance": "low",
        },
        {
            "title": "大学物理",
            "date": today + timedelta(days=1),
            "start_time": time(10, 0),
            "end_time": time(11, 35),
            "location": "四教1202",
            "description": "第15周课程",
            "is_all_day": False,
            "importance": "low",
        },
        {
            "title": "工程制图",
            "date": today + timedelta(days=2),
            "start_time": time(14, 0),
            "end_time": time(15, 35),
            "location": "工程中心201",
            "description": "第15周课程",
            "is_all_day": False,
            "importance": "low",
        },
        {
            "title": "体育课",
            "date": today + timedelta(days=3),
            "start_time": time(16, 0),
            "end_time": time(17, 35),
            "location": "体育馆",
            "description": "第15周课程",
            "is_all_day": False,
            "importance": "low",
        },
    ]

    for event_data in events_data:
        event = CalendarEvent(
            title=event_data["title"],
            date=event_data["date"],
            start_time=event_data.get("start_time"),
            end_time=event_data.get("end_time"),
            location=event_data.get("location"),
            description=event_data.get("description"),
            is_all_day=event_data["is_all_day"],
            importance=event_data["importance"],
            created_by=creator.id,
            created_at=datetime.now(timezone.utc),
        )
        db.add(event)

    db.commit()
    print(f"✓ 创建了 {len(events_data)} 条班级日程")


def main():
    """主函数：创建所有测试数据"""

    import sys

    # 创建数据库表
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 获取或创建测试用户
        user = db.query(User).first()

        if not user:
            print("未找到用户，请先创建用户账号")
            return

        print(f"使用用户: {user.username} (ID: {user.id})")
        print()

        # 检查命令行参数
        if len(sys.argv) > 1 and sys.argv[1] == "--clear":
            print("清空现有测试数据...")
            db.query(Notice).delete()
            db.query(CalendarEvent).delete()
            db.commit()
            print("✓ 已清空所有通知和日程")
            print()

        # 创建通知
        print("创建班级通知...")
        seed_notices(db, user)
        print()

        # 创建日程
        print("创建班级日程...")
        seed_calendar_events(db, user)
        print()

        print("=" * 50)
        print("测试数据创建完成！")
        print("=" * 50)
        print()
        print("你可以刷新主页查看效果：")
        print("  - 班级通知：6条（2条重要通知）")
        print("  - 班级日程：14条（包含不同重要性级别）")
        print()
        print("访问地址：http://localhost:3000")
        print()
        print("提示：如需清空现有数据后重新创建，请运行：")
        print("  python seed_test_data.py --clear")

    except Exception as e:
        print(f"错误: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
