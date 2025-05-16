from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
import random
from datetime import datetime, timedelta
import hashlib

router = APIRouter(
    prefix="/platform",
    tags=["platform"],
)

class DataSource(BaseModel):
    id: str
    name: str
    type: str
    status: str
    last_sync: str
    record_count: int
    error_count: int
    last_updated: str
    connection_info: Dict[str, Any]
    description: str

# 模拟数据源
DATA_SOURCES = [
    {
        "id": "fin001",
        "name": "企业ERP系统",
        "type": "财务数据",
        "status": "已连接",
        "last_sync": (datetime.now() - timedelta(minutes=35)).strftime("%Y-%m-%d %H:%M:%S"),
        "record_count": 156329,
        "error_count": random.randint(0, 2),
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "connection_info": {"api_type": "REST API", "refresh_interval": "每30分钟"},
        "description": "企业核心财务数据，包含资产负债表、利润表、现金流量表等"
    },
    {
        "id": "op002",
        "name": "运营监控系统",
        "type": "运营数据",
        "status": "已连接",
        "last_sync": (datetime.now() - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S"),
        "record_count": 248753,
        "error_count": random.randint(0, 5),
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "connection_info": {"api_type": "WebSocket", "refresh_interval": "实时"},
        "description": "企业运营指标实时监控，包含销售、库存、人力等关键指标"
    },
    {
        "id": "news001",
        "name": "新闻舆情API",
        "type": "舆情数据",
        "status": "已连接",
        "last_sync": (datetime.now() - timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S"),
        "record_count": 8721,
        "error_count": random.randint(0, 1),
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "connection_info": {"api_type": "REST API", "refresh_interval": "每15分钟"},
        "description": "主流新闻媒体、社交平台相关舆情信息聚合"
    },
    {
        "id": "macro001",
        "name": "宏观经济数据库",
        "type": "宏观数据",
        "status": "已连接",
        "last_sync": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S"),
        "record_count": 3254,
        "error_count": random.randint(0, 1),
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "connection_info": {"api_type": "Database", "refresh_interval": "每日"},
        "description": "国家统计局及行业协会数据，包含行业景气指数、GDP等宏观指标"
    },
    {
        "id": "crm001",
        "name": "客户关系管理系统",
        "type": "运营数据",
        "status": "配置中",
        "last_sync": "",
        "record_count": 0,
        "error_count": 0,
        "last_updated": "",
        "connection_info": {"api_type": "待配置", "refresh_interval": "待配置"},
        "description": "客户管理数据，包含客户沟通记录、合同信息等"
    },
]

def get_dynamic_data_source(source, now):
    """
    根据当前时间动态生成数据源的record_count、error_count、last_sync、last_updated等字段。
    刷新周期30秒，每个数据源错开5秒。
    """
    base_count = source["record_count"]
    base_error = source["error_count"]
    # 用id做错峰
    id_hash = int(hashlib.md5(source["id"].encode()).hexdigest(), 16)
    offset = (id_hash % 6) * 5  # 0,5,10,15,20,25秒
    seconds = int(now.timestamp())
    cycle = (seconds - offset) // 30
    # 递增逻辑
    record_count = base_count + cycle * random.randint(10, 30)
    # error_count偶发+1
    error_count = base_error + (1 if (cycle % 10 == 0 and random.random() < 0.2) else 0)
    # 更新时间
    last_sync = (now - timedelta(seconds=(seconds - offset) % 30)).strftime("%Y-%m-%d %H:%M:%S")
    last_updated = now.strftime("%Y-%m-%d %H:%M:%S")
    s = source.copy()
    s["record_count"] = record_count
    s["error_count"] = error_count
    s["last_sync"] = last_sync
    s["last_updated"] = last_updated
    return s

@router.get("/data-sources", response_model=List[DataSource])
async def get_data_sources():
    """获取所有数据源列表（动态化）"""
    now = datetime.now()
    return [get_dynamic_data_source(s, now) for s in DATA_SOURCES]

@router.get("/data-sources/{source_id}", response_model=DataSource)
async def get_data_source(source_id: str):
    """获取特定数据源详情（动态化）"""
    for source in DATA_SOURCES:
        if source["id"] == source_id:
            return get_dynamic_data_source(source, datetime.now())
    raise HTTPException(status_code=404, detail="数据源不存在")

@router.get("/data-ingestion-stats")
async def get_data_ingestion_stats(latest: bool = False):
    """
    获取数据摄入统计信息
    - latest=true时，仅返回最新一条动态数据（每10秒刷新）
    - 否则返回历史静态数据
    """
    now = datetime.now()
    data_types = ["财务数据", "运营数据", "舆情数据", "宏观数据"]
    if latest:
        # 最新一条数据，每10秒波动
        seconds = int(now.timestamp())
        cycle = seconds // 10
        base = 200000 + (cycle % 20) * random.randint(-500, 500)
        daily_stats = {
            "date": now.strftime("%Y-%m-%d %H:%M"),
            "total": base,
            "success_rate": round(random.uniform(0.97, 0.995), 4),
            "fail_count": random.randint(0, 3),
            "last_ingest_time": now.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for data_type in data_types:
            if data_type == "财务数据":
                value = int(base * 0.4 + random.randint(-1000, 1000))
            elif data_type == "运营数据":
                value = int(base * 0.4 + random.randint(-1000, 1000))
            elif data_type == "舆情数据":
                value = int(base * 0.1 + random.randint(-200, 200))
            else:
                value = int(base * 0.1 + random.randint(-200, 200))
            daily_stats[data_type] = value
        return [daily_stats]
    # 历史数据静态
    today = now
    stats = []
    for i in range(7):
        date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        daily_stats = {
            "date": date,
            "total": 200000 + i * random.randint(-3000, 3000),
            "success_rate": round(random.uniform(0.96, 0.995), 4),
            "fail_count": random.randint(0, 10),
            "last_ingest_time": (today - timedelta(days=i)).strftime("%Y-%m-%d %H:%M:%S"),
        }
        for data_type in data_types:
            if data_type == "财务数据":
                value = random.randint(50000, 70000)
            elif data_type == "运营数据":
                value = random.randint(100000, 150000)
            elif data_type == "舆情数据":
                value = random.randint(5000, 10000)
            else:
                value = random.randint(1000, 3000)
            daily_stats[data_type] = value
            daily_stats["total"] += value
        stats.append(daily_stats)
    return sorted(stats, key=lambda x: x["date"])

@router.get("/data-quality-metrics")
async def get_data_quality_metrics():
    """获取数据质量指标"""
    data_types = ["财务数据", "运营数据", "舆情数据", "宏观数据"]
    metrics = ["完整性", "准确性", "一致性", "时效性"]
    
    results = []
    for data_type in data_types:
        data_metrics = {"数据类型": data_type}
        
        for metric in metrics:
            # 生成85-99之间的数据质量分数
            if data_type == "财务数据" and metric == "准确性":
                # 财务数据准确性较高
                score = random.randint(95, 99)
            elif data_type == "舆情数据" and metric == "完整性":
                # 舆情数据完整性稍低
                score = random.randint(85, 92)
            else:
                score = random.randint(88, 97)
            
            data_metrics[metric] = score
        
        results.append(data_metrics)
    
    return results

@router.get("/processing-pipeline-status")
async def get_processing_pipeline_status():
    """获取数据处理流水线状态"""
    pipelines = [
        {
            "id": "etl001",
            "name": "财务数据处理流水线",
            "status": "运行中",
            "last_run": (datetime.now() - timedelta(minutes=12)).strftime("%Y-%m-%d %H:%M:%S"),
            "success_rate": 99.2,
            "avg_processing_time": "5分钟13秒",
            "records_processed": 28945,
            "error_count": 23
        },
        {
            "id": "etl002",
            "name": "运营数据处理流水线",
            "status": "运行中",
            "last_run": (datetime.now() - timedelta(minutes=8)).strftime("%Y-%m-%d %H:%M:%S"),
            "success_rate": 98.7,
            "avg_processing_time": "3分钟42秒",
            "records_processed": 42156,
            "error_count": 548
        },
        {
            "id": "etl003",
            "name": "舆情数据处理流水线",
            "status": "运行中",
            "last_run": (datetime.now() - timedelta(minutes=2)).strftime("%Y-%m-%d %H:%M:%S"),
            "success_rate": 96.5,
            "avg_processing_time": "1分钟58秒",
            "records_processed": 3526,
            "error_count": 124
        },
        {
            "id": "etl004",
            "name": "宏观数据处理流水线",
            "status": "待运行",
            "last_run": (datetime.now() - timedelta(hours=23)).strftime("%Y-%m-%d %H:%M:%S"),
            "success_rate": 100.0,
            "avg_processing_time": "2分钟05秒", 
            "records_processed": 145,
            "error_count": 0
        }
    ]
    
    return pipelines

@router.get("/feature-engineering-metrics")
async def get_feature_engineering_metrics():
    """获取特征工程指标"""
    feature_categories = ["财务特征", "运营特征", "舆情特征", "宏观特征", "复合特征"]
    
    results = []
    for category in feature_categories:
        # 为不同类别生成不同的特征数量
        if category == "财务特征":
            feature_count = random.randint(180, 220)
        elif category == "运营特征":
            feature_count = random.randint(140, 180)
        elif category == "舆情特征":
            feature_count = random.randint(50, 80)
        elif category == "宏观特征":
            feature_count = random.randint(30, 60)
        else:  # 复合特征
            feature_count = random.randint(80, 120)
            
        # 生成自动化率
        if category in ["财务特征", "宏观特征"]:
            automation_rate = random.randint(85, 95)
        else:
            automation_rate = random.randint(70, 85)
            
        results.append({
            "类别": category,
            "特征数量": feature_count,
            "自动化率": automation_rate,
            "最近更新": (datetime.now() - timedelta(hours=random.randint(1, 48))).strftime("%Y-%m-%d %H:%M:%S")
        })
    
    return results 