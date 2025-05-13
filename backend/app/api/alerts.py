from fastapi import APIRouter, Query
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# 假数据：历史预警（突出审计意识）
ALERTS_FAKE = [
    {
        "id": "alert_001",
        "time": "2024-06-01 10:23:00",
        "level": "高",
        "audit_level": "重大",
        "color": "#ff5c5c",
        "dim": "财务风险",
        "msg": "应收账款异常增长，存在收入确认风险"
    },
    {
        "id": "alert_002",
        "time": "2024-05-28 15:12:00",
        "level": "中",
        "audit_level": "一般",
        "color": "#ffd666",
        "dim": "运营风险",
        "msg": "生产效率波动，需关注成本归集的准确性"
    },
    {
        "id": "alert_003",
        "time": "2024-05-20 09:30:00",
        "level": "低",
        "audit_level": "低",
        "color": "#4be1a0",
        "dim": "合规风险",
        "msg": "合规流程稳定，暂无重大合规事件"
    },
]

# 假数据：预警详情（突出审计关注点、影响、建议的审计程序）
ALERT_DETAIL_FAKE = {
    "alert_001": {
        "id": "alert_001",
        "time": "2024-06-01 10:23:00",
        "level": "高",
        "audit_level": "重大",
        "dim": "财务风险",
        "msg": "应收账款异常增长，存在收入确认风险",
        "explanation": "【审计关注点】本期应收账款较上期大幅增长，存在收入提前确认或虚增收入的风险。需关注相关合同、发票与收款凭证的合规性，识别是否存在舞弊迹象。",
        "impact": "【对财务报表影响】可能导致收入虚增，影响财务报表公允性，增加重大错报风险。",
        "suggestion": "【建议的审计程序】建议实施函证程序，检查合同、发票与收款记录，复核收入确认政策的执行情况，必要时实施实地盘点和访谈。"
    },
    "alert_002": {
        "id": "alert_002",
        "time": "2024-05-28 15:12:00",
        "level": "中",
        "audit_level": "一般",
        "dim": "运营风险",
        "msg": "生产效率波动，需关注成本归集的准确性",
        "explanation": "【审计关注点】本期生产效率波动较大，可能影响成本归集的准确性。需关注成本分配方法及相关凭证的合规性。",
        "impact": "【对财务报表影响】成本归集不准确可能导致利润虚增或虚减，影响报表可靠性。",
        "suggestion": "【建议的审计程序】建议复核成本分配方法，抽查相关凭证，分析生产效率变动原因。"
    },
    "alert_003": {
        "id": "alert_003",
        "time": "2024-05-20 09:30:00",
        "level": "低",
        "audit_level": "低",
        "dim": "合规风险",
        "msg": "合规流程稳定，暂无重大合规事件",
        "explanation": "【审计关注点】合规流程稳定，近期无重大合规事件。建议持续关注政策变化及合规执行情况。",
        "impact": "【对财务报表影响】公司运营合规，风险可控。",
        "suggestion": "【建议的审计程序】建议定期自查合规流程，关注政策更新，保持合规管理。"
    },
}

@router.get("/alerts/history")
def get_alerts_history(company: str = Query(..., description="公司ID"), period: Optional[str] = Query(None, description="时间区间")):
    """
    获取历史预警列表（假数据）
    """
    # 实际可根据company/period过滤
    return ALERTS_FAKE

@router.get("/alerts/detail")
def get_alert_detail(id: str = Query(..., description="预警ID")):
    """
    获取单条预警详情（假数据）
    """
    return ALERT_DETAIL_FAKE.get(id, {}) 