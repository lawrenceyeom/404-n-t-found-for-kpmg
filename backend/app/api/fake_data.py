"""
Mock Data Generation Module for AURA Platform

This module provides API endpoints for generating simulated non-financial data including
news sentiment, social media mentions, macroeconomic indicators, and operational metrics
to demonstrate the multi-source data integration capabilities of the AURA platform.

Key components:
- Company profiles with different risk characteristics (stable, growth, distressed)
- Mock news and social media data generation with sentiment analysis
- Simulated macroeconomic indicators
- Mock operational metrics with various warning indicators

Main endpoints:
- /fake/opinion_raw: Generates detailed news and social media mentions with sentiment analysis
- /fake/opinion: Provides aggregated sentiment trends and hot topics
- /fake/macro: Delivers macroeconomic indicators like GDP, CPI, and PMI
- /fake/operation: Creates operational metrics with company-specific performance patterns

This module complements the financial data module to create a complete mock data ecosystem
for the AURA platform demonstration, illustrating how multiple data sources can be
integrated for comprehensive risk analysis.
"""

from fastapi import APIRouter, Query
from datetime import datetime, timedelta
import random

router = APIRouter()

COMPANIES = [
    {"id": "aura", "name": "AURA稳健", "type": "稳健型", "desc": "财务健康、舆情正面、运营平稳"},
    {"id": "beta", "name": "BETA成长", "type": "成长型", "desc": "营收增长快、舆情波动、偶有预警"},
    {"id": "crisis", "name": "CRISIS压力", "type": "压力型", "desc": "财务压力大、负面舆情多、运营波动"}
]
NEWS_SOURCES = ["新华网", "人民网", "财新", "第一财经", "证券时报", "澎湃新闻", "经济日报", "央视财经"]
SOCIAL_PLATFORMS = ["微博", "知乎", "小红书", "抖音", "B站", "雪球", "今日头条"]
SENTIMENTS = ["positive", "neutral", "negative"]
KEYWORDS = ["债务重组", "项目进展", "政府支持", "违约传闻", "融资成功", "评级调整", "市场扩张", "合作签约", "环保合规", "高管变动", "现金流", "风险提示", "投资者关系", "市场拓展", "政策利好"]

# 舆情原始数据（新闻+社交平台）
@router.get("/fake/opinion_raw")
def get_fake_opinion_raw(company: str = Query("aura", description="公司ID: aura/beta/crisis"), days: int = 90, per_day: int = 20):
    today = datetime.now()
    data = []
    for i in range(days):
        date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        for _ in range(per_day):
            if random.random() < 0.5:
                # 新闻
                sentiment_dist = {
                    "aura": [0.7, 0.25, 0.05],
                    "beta": [0.5, 0.3, 0.2],
                    "crisis": [0.2, 0.3, 0.5]
                }[company]
                entry = {
                    "date": date,
                    "type": "news",
                    "company": company,
                    "source": random.choice(NEWS_SOURCES),
                    "title": random.choice([
                        "公司获政府专项资金支持", "债务重组进展顺利", "新项目签约落地", "高管变动公告", "市场扩张新动作", "评级调整影响有限", "环保合规获表彰", "经营稳健获分析师好评", "融资成功助力发展", "违约传闻澄清"]),
                    "content": random.choice([
                        "公司近日获得地方政府专项资金支持，助力项目推进。",
                        "公司债务重组取得阶段性进展，市场反应积极。",
                        "新签约项目预计带来可观营收增长。",
                        "公司发布公告，高管团队进行调整。",
                        "公司加快市场扩张步伐，布局新区域。",
                        "评级机构调整公司信用评级，影响有限。",
                        "公司环保合规表现突出，获行业表彰。",
                        "分析师认为公司经营稳健，风险可控。",
                        "公司成功完成新一轮融资，资金充裕。",
                        "公司针对违约传闻发布澄清公告。"
                    ]),
                    "sentiment": random.choices(SENTIMENTS, weights=sentiment_dist)[0],
                    "sentiment_score": round(random.uniform(0.2, 0.95), 2),
                    "keywords": random.sample(KEYWORDS, 3)
                }
            else:
                sentiment_dist = {
                    "aura": [0.6, 0.3, 0.1],
                    "beta": [0.4, 0.4, 0.2],
                    "crisis": [0.15, 0.35, 0.5]
                }[company]
                entry = {
                    "date": date,
                    "type": "social",
                    "company": company,
                    "platform": random.choice(SOCIAL_PLATFORMS),
                    "user": f"user{random.randint(10000,99999)}",
                    "content": random.choice([
                        "感觉公司最近动作挺多，利好消息不少。",
                        "债务问题还是有点担心，观望一下。",
                        "新项目落地，期待业绩提升！",
                        "高管又换人了，不知道啥情况。",
                        "环保合规做得不错，点赞。",
                        "融资成功，资金压力小了。",
                        "市场扩张挺快的，风险也要注意。",
                        "评级被下调了，有点担忧。",
                        "违约传闻是真的吗？求证实。",
                        "公司回应很及时，信心增强。"
                    ]),
                    "sentiment": random.choices(SENTIMENTS, weights=sentiment_dist)[0],
                    "sentiment_score": round(random.uniform(0.1, 0.98), 2),
                    "keywords": random.sample(KEYWORDS, 2)
                }
            data.append(entry)
    data = sorted(data, key=lambda x: x["date"], reverse=True)
    return {"opinion_raw": data}

# 舆情数据（情感分布、热词、事件）
@router.get("/fake/opinion")
def get_fake_opinion():
    today = datetime.now()
    data = [
        {
            "date": (today - timedelta(days=i)).strftime("%Y-%m-%d"),
            "positive": random.randint(60, 100),
            "neutral": random.randint(10, 40),
            "negative": random.randint(0, 20),
            "hotwords": random.sample([
                "债务重组", "项目进展", "政府支持", "违约传闻", "融资成功", "评级调整", "市场扩张", "合作签约", "环保合规", "高管变动"
            ], 3),
            "events": random.sample([
                "媒体报道：公司获政府专项资金支持", "网络传言：债务违约风险上升", "官方公告：新项目落地", "分析师评论：经营稳健", "舆情波动：高管离职"], 2)
        }
        for i in range(14)
    ]
    return {"opinion_trend": data}

# 宏观经济数据（GDP、CPI、PMI等）
@router.get("/fake/macro")
def get_fake_macro():
    years = [2020, 2021, 2022, 2023, 2024]
    data = [
        {
            "year": y,
            "GDP": round(90000 + 3000 * (y - 2020) + random.uniform(-1000, 1000), 2),
            "CPI": round(2.0 + random.uniform(-0.5, 0.5), 2),
            "PMI": round(50 + random.uniform(-2, 2), 2),
            "unemployment": round(5.0 + random.uniform(-0.5, 0.5), 2),
            "policy": random.choice([
                "稳健货币政策", "积极财政政策", "房地产调控", "产业升级", "绿色转型", "外贸促进"
            ])
        }
        for y in years
    ]
    return {"macro_trend": data}

# 运营数据（营收、成本、利润、现金流等）
@router.get("/fake/operation")
def get_fake_operation(company: str = Query("aura", description="公司ID: aura/beta/crisis")):
    months = [(datetime.now() - timedelta(days=30*i)).strftime("%Y-%m") for i in range(12)][::-1]
    if company == "aura":
        base = {"revenue": 10000, "cost": 7000, "profit": 3000, "cashflow": 2000}
        growth = 500
        volatility = 0.05
        warning_choices = [None, None, None, "轻微波动"]
    elif company == "beta":
        base = {"revenue": 8000, "cost": 6000, "profit": 2000, "cashflow": 1500}
        growth = 1200
        volatility = 0.15
        warning_choices = [None, "成本上升", "现金流紧张", None, None]
    else:  # crisis
        base = {"revenue": 9000, "cost": 8500, "profit": 500, "cashflow": 500}
        growth = 200
        volatility = 0.3
        warning_choices = ["成本异常上升", "现金流紧张", "利润下滑", None]
    data = []
    for i, m in enumerate(months):
        data.append({
            "month": m,
            "company": company,
            "revenue": round(base["revenue"] + i*growth + random.uniform(-base["revenue"]*volatility, base["revenue"]*volatility), 2),
            "cost": round(base["cost"] + i*growth*0.7 + random.uniform(-base["cost"]*volatility, base["cost"]*volatility), 2),
            "profit": round(base["profit"] + i*growth*0.3 + random.uniform(-base["profit"]*volatility, base["profit"]*volatility), 2),
            "cashflow": round(base["cashflow"] + i*growth*0.2 + random.uniform(-base["cashflow"]*volatility, base["cashflow"]*volatility), 2),
            "warning": random.choice(warning_choices)
        })
    return {"operation_trend": data} 