"""
Sentiment Analysis Module for AURA Platform

This module provides API endpoints for generating simulated sentiment data from various
media sources (news, social media) for different companies. It demonstrates the platform's
ability to monitor and analyze public opinion about audited companies, which serves as an
important external risk indicator.

Key components:
- Mock sentiment generation with platform-specific content templates
- Company-specific sentiment distribution based on risk profile
- Realistic simulation of different user/source types and their behavior patterns
- Sentiment trend aggregation and analysis
- Keyword extraction and hot event identification

Main endpoints:
- /fake/opinion_raw: Generates detailed sentiment data entries with platform, user, content, and scores
- /fake/opinion_trend: Provides aggregated sentiment analysis including trends, keywords, and hot events

This module showcases how AURA would integrate external sentiment data into its risk
assessment framework, helping auditors understand public perception risks and identify
potential issues that might not be visible in financial data alone.
"""

import random
from fastapi import APIRouter, Query
from datetime import datetime, timedelta

router = APIRouter()

# 平台风格模板
PLATFORM_TEMPLATES = {
    '小红书': [
        '今天去{company}旗下项目打卡，环境真的不错，推荐大家来体验！',
        '分享一下在{company}理财的心得，收益还可以，大家有兴趣吗？',
        '最近看到{company}的新品发布，好多小姐妹都在讨论，种草了！',
        '和闺蜜一起体验了{company}的服务，整体感觉很棒，性价比高。',
        '小红书上好多关于{company}的测评，大家都说服务态度好。',
    ],
    '微博': [
        '{company}又上热搜了，这次是因为{event}，网友们议论纷纷。',
        '刚刚看到{company}的新闻，{event}，你怎么看？',
        '最近{company}的股价波动挺大，财经博主都在分析原因。',
        '有人爆料{company}内部管理问题，真假难辨，吃瓜中。',
        '关于{company}的{event}，大家有什么看法？',
    ],
    '财经网': [
        '{company}发布最新财报，{event}，分析师观点分歧明显。',
        '深度解读：{company}的{event}对行业有何影响？',
        '投资者关注{company}的{event}，市场反应强烈。',
        '{company}近期动作频频，{event}或成转折点。',
        '专家：{company}需警惕{event}带来的潜在风险。',
    ],
    '知乎': [
        '如何看待{company}最近的{event}？知乎高赞回答来了。',
        '{company}的{event}是否会影响行业格局？',
        '知乎讨论：{company}的管理模式值得借鉴吗？',
        '大家怎么看{company}的{event}，有内幕消息吗？',
        '知乎用户分析：{company}的未来发展前景如何？',
    ],
    '抖音': [
        '刷到{company}的短视频，{event}，评论区很热闹。',
        '{company}的官方号最近很活跃，互动感很强。',
        '抖音达人测评{company}产品，真实体验分享。',
        '最近{company}的活动在抖音很火，大家都在参与。',
        '短视频里看到{company}的员工日常，感觉氛围不错。',
    ],
}

# 公司主流舆情主题
COMPANY_TOPICS = {
    'aura': [
        '财务稳健', '创新产品', '服务体验', '品牌口碑', '投资回报',
    ],
    'beta': [
        '成长潜力', '市场扩张', '新项目', '团队活力', '行业前景',
    ],
    'crisis': [
        '债务压力', '项目延期', '管理问题', '负面新闻', '合规风险',
    ],
}

# 事件模板
EVENTS = {
    'aura': [
        '年度财报表现优异', '推出智能理财新品', '客户满意度提升', '荣获行业大奖', '投资回报率创新高',
    ],
    'beta': [
        '新项目落地', '市场份额提升', '团队扩张', '获得新一轮融资', '行业合作加深',
    ],
    'crisis': [
        '债务违约传闻', '项目进度缓慢', '高管变动', '被曝合规问题', '负面新闻频发',
    ],
}

# 舆情情感分布
SENTIMENTS = [
    ('positive', '正面', 0.85),
    ('neutral', '中性', 0.5),
    ('negative', '负面', 0.15),
]

# 用户/博主昵称生成
def random_user(platform):
    if platform == '小红书':
        return random.choice(['小美', '理财小达人', '生活记录者', '小红薯', '分享控'])
    if platform == '微博':
        return random.choice(['财经观察员', '吃瓜群众', '热心网友', '八卦小王子', '财经博主'])
    if platform == '知乎':
        return random.choice(['知乎用户', '行业分析师', '资深答主', '匿名用户', '财经学者'])
    if platform == '抖音':
        return random.choice(['抖音达人', '短视频博主', '生活vlog', '职场人', '搞笑UP主'])
    if platform == '财经网':
        return random.choice(['分析师A', '投资人B', '财经编辑', '市场观察', '专栏作家'])
    return '网友'

@router.get('/fake/opinion_raw')
def fake_opinion_raw(company: str = Query('aura'), days: int = 7, per_day: int = 10):
    today = datetime.now()
    res = []
    for d in range(days):
        date = (today - timedelta(days=days-1-d)).strftime('%Y-%m-%d')
        for _ in range(per_day):
            platform = random.choices(list(PLATFORM_TEMPLATES.keys()), weights=[3,4,2,2,2])[0]
            topic = random.choice(COMPANY_TOPICS.get(company, COMPANY_TOPICS['aura']))
            event = random.choice(EVENTS.get(company, EVENTS['aura']))
            template = random.choice(PLATFORM_TEMPLATES[platform])
            content = template.format(company=company.upper(), event=event)
            sentiment, sentiment_label, base_score = random.choice(SENTIMENTS)
            # 负面概率随公司类型调整
            if company == 'crisis' and random.random() < 0.3:
                sentiment = 'negative'; sentiment_label = '负面'; base_score = 0.1 + random.random()*0.3
            elif company == 'aura' and random.random() < 0.7:
                sentiment = 'positive'; sentiment_label = '正面'; base_score = 0.7 + random.random()*0.3
            elif company == 'beta' and random.random() < 0.5:
                sentiment = 'neutral'; sentiment_label = '中性'; base_score = 0.4 + random.random()*0.3
            sentiment_score = round(base_score + random.uniform(-0.1,0.1), 2)
            keywords = [topic, event.split('，')[0]]
            res.append({
                'date': date,
                'platform': platform,
                'user': random_user(platform),
                'type': 'news' if platform in ['财经网'] else 'social',
                'source': platform,
                'title': None if platform in ['抖音','小红书'] else event,
                'content': content,
                'sentiment': sentiment,
                'sentiment_label': sentiment_label,
                'sentiment_score': sentiment_score,
                'keywords': keywords,
            })
    return {'opinion_raw': res}

@router.get('/fake/opinion_trend')
def fake_opinion_trend(company: str = Query('aura'), days: int = 7, per_day: int = 20):
    # 1. 生成原始舆情
    raw = fake_opinion_raw(company, days, per_day)['opinion_raw']
    # 若无数据，补充生成有代表性的分析内容
    if not raw or len(raw) == 0:
        import random
        today = datetime.now()
        platforms = ['小红书', '微博', '财经网', '知乎']
        sentiments = ['positive', 'neutral', 'negative']
        words = ['创新', '稳健', '扩张', '合规', '管理', '增长', '风险', '投资', '债务', '服务', '新品', '团队', '延期', '爆点']
        raw = []
        for d in range(days):
            date = (today - timedelta(days=days-1-d)).strftime('%Y-%m-%d')
            for _ in range(per_day):
                platform = random.choice(platforms)
                sentiment = random.choices(sentiments, weights=[0.5,0.3,0.2])[0]
                content = f"{company.upper()}公司{random.choice(words)}相关讨论，观点{sentiment}。"
                raw.append({
                    'date': date,
                    'platform': platform,
                    'sentiment': sentiment,
                    'content': content,
                    'user': f"用户{random.randint(1000,9999)}",
                    'sentiment_label': '正面' if sentiment=='positive' else '负面' if sentiment=='negative' else '中性',
                    'sentiment_score': random.randint(60,99) if sentiment=='positive' else random.randint(30,59) if sentiment=='neutral' else random.randint(1,29),
                    'keywords': random.sample(words, k=3),
                    'title': None,
                })
    # 2. 聚合情感趋势、关键词、平台分布、爆点
    trend = []
    keywords = {}
    platform_stat = {}
    hot_events = []
    for d in range(days):
        date = (datetime.now() - timedelta(days=days-1-d)).strftime('%Y-%m-%d')
        day_msgs = [x for x in raw if x['date'] == date]
        pos = sum(1 for x in day_msgs if x['sentiment'] == 'positive')
        neu = sum(1 for x in day_msgs if x['sentiment'] == 'neutral')
        neg = sum(1 for x in day_msgs if x['sentiment'] == 'negative')
        trend.append({'date': date, 'positive': pos, 'neutral': neu, 'negative': neg})
        for x in day_msgs:
            for k in x['keywords']:
                keywords[k] = keywords.get(k, 0) + 1
            platform_stat[x['platform']] = platform_stat.get(x['platform'], 0) + 1
        # 负面爆点
        if neg > max(pos, neu) and neg > 3:
            hot_events.append({'date': date, 'desc': f'{company.upper()}公司出现负面舆情高峰', 'count': neg})
    # 关键词云
    keyword_list = [{'word': k, 'count': v} for k, v in sorted(keywords.items(), key=lambda x: -x[1])[:18]]
    # 平台分布
    platform_list = [{'platform': k, 'count': v} for k, v in platform_stat.items()]
    return {
        'trend': trend,
        'keywords': keyword_list,
        'platform_stat': platform_list,
        'hot_events': hot_events,
    } 