from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import random
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/platform",
    tags=["platform"],
)

@router.get("/models", response_model=List[Dict[str, Any]])
def get_models():
    """获取所有AI模型列表"""
    models = [
        {
            "id": "risk_pred_001",
            "name": "风险评估模型 v1",
            "type": "分类",
            "description": "基于历史审计数据的风险预测模型",
            "created_at": "2023-06-15",
            "status": "运行中",
            "version": "1.3.5",
            "author": "KPMG AI团队",
            "framework": "TensorFlow",
            "accuracy": 0.91,
        },
        {
            "id": "anomaly_det_002",
            "name": "异常检测模型",
            "type": "异常检测",
            "description": "识别交易和财务数据中的异常模式",
            "created_at": "2023-09-22",
            "status": "运行中",
            "version": "2.1.0",
            "author": "KPMG AI团队",
            "framework": "PyTorch",
            "accuracy": 0.88,
        },
        {
            "id": "sentiment_003",
            "name": "舆情分析模型",
            "type": "NLP",
            "description": "分析新闻和社交媒体对公司的情感",
            "created_at": "2023-11-10",
            "status": "运行中",
            "version": "1.1.7",
            "author": "KPMG AI团队",
            "framework": "Hugging Face",
            "accuracy": 0.85,
        },
        {
            "id": "doc_extract_004",
            "name": "文档信息抽取模型",
            "type": "NLP",
            "description": "从财务报表和合同中抽取关键信息",
            "created_at": "2024-01-05",
            "status": "运行中",
            "version": "1.0.3",
            "author": "KPMG AI团队",
            "framework": "SpaCy + BERT",
            "accuracy": 0.87,
        },
        {
            "id": "time_series_005",
            "name": "时间序列预测模型",
            "type": "回归",
            "description": "预测财务指标的未来趋势",
            "created_at": "2024-02-28",
            "status": "运行中",
            "version": "0.9.5",
            "author": "KPMG AI团队",
            "framework": "Prophet + LightGBM",
            "accuracy": 0.83,
        },
    ]
    return models

@router.get("/model-health", response_model=List[Dict[str, Any]])
def get_model_health():
    """获取模型健康状态"""
    models = [
        {
            "model_id": "risk_pred_001",
            "model_name": "风险评估模型 v1",
            "status": "健康",
            "last_checked": (datetime.now() - timedelta(hours=2)).isoformat(),
            "drift_score": 0.12,
            "performance_stability": 0.95,
            "error_rate": 0.02,
            "alerts": [],
        },
        {
            "model_id": "anomaly_det_002",
            "model_name": "异常检测模型",
            "status": "需关注",
            "last_checked": (datetime.now() - timedelta(hours=4)).isoformat(),
            "drift_score": 0.28,
            "performance_stability": 0.82,
            "error_rate": 0.04,
            "alerts": ["数据分布漂移超过阈值"],
        },
        {
            "model_id": "sentiment_003",
            "model_name": "舆情分析模型",
            "status": "健康",
            "last_checked": (datetime.now() - timedelta(hours=1)).isoformat(),
            "drift_score": 0.15,
            "performance_stability": 0.93,
            "error_rate": 0.03,
            "alerts": [],
        },
        {
            "model_id": "doc_extract_004",
            "model_name": "文档信息抽取模型",
            "status": "需关注",
            "last_checked": (datetime.now() - timedelta(hours=6)).isoformat(),
            "drift_score": 0.22,
            "performance_stability": 0.86,
            "error_rate": 0.05,
            "alerts": ["模型性能波动较大"],
        },
        {
            "model_id": "time_series_005",
            "model_name": "时间序列预测模型",
            "status": "健康",
            "last_checked": (datetime.now() - timedelta(hours=3)).isoformat(),
            "drift_score": 0.18,
            "performance_stability": 0.91,
            "error_rate": 0.03,
            "alerts": [],
        },
    ]
    return models

@router.get("/model-performance", response_model=List[Dict[str, Any]])
def get_model_performance():
    """获取模型性能metrics"""
    models = [
        {
            "model_id": "risk_pred_001",
            "model_name": "风险评估模型 v1",
            "准确率": 0.91,
            "精确率": 0.89,
            "召回率": 0.87,
            "F1得分": 0.88,
            "AUC": 0.93,
            "评估时间": (datetime.now() - timedelta(days=3)).isoformat(),
        },
        {
            "model_id": "anomaly_det_002",
            "model_name": "异常检测模型",
            "准确率": 0.88,
            "精确率": 0.85,
            "召回率": 0.82,
            "F1得分": 0.83,
            "AUC": 0.89,
            "评估时间": (datetime.now() - timedelta(days=5)).isoformat(),
        },
        {
            "model_id": "sentiment_003",
            "model_name": "舆情分析模型",
            "准确率": 0.85,
            "精确率": 0.83,
            "召回率": 0.81,
            "F1得分": 0.82,
            "AUC": 0.87,
            "评估时间": (datetime.now() - timedelta(days=7)).isoformat(),
        },
        {
            "model_id": "doc_extract_004",
            "model_name": "文档信息抽取模型",
            "准确率": 0.87,
            "精确率": 0.85,
            "召回率": 0.83,
            "F1得分": 0.84,
            "AUC": 0.89,
            "评估时间": (datetime.now() - timedelta(days=4)).isoformat(),
        },
        {
            "model_id": "time_series_005",
            "model_name": "时间序列预测模型",
            "准确率": 0.83,
            "精确率": 0.80,
            "召回率": 0.79,
            "F1得分": 0.79,
            "AUC": 0.85,
            "评估时间": (datetime.now() - timedelta(days=6)).isoformat(),
        },
    ]
    return models

@router.get("/feature-importance/{model_id}", response_model=List[Dict[str, Any]])
def get_feature_importance(model_id: str):
    """获取模型特征重要性，彻底修复溢出问题，保证所有项都在0~100且总和为100，动态化"""
    features = [
        {"特征名": "营收增长率", "类别": "财务特征"},
        {"特征名": "负债比率", "类别": "财务特征"},
        {"特征名": "流动比率", "类别": "财务特征"},
        {"特征名": "管理层变动频率", "类别": "管理特征"},
        {"特征名": "审计历史问题", "类别": "合规特征"},
    ]
    max_try = 10
    for _ in range(max_try):
        raw = [random.uniform(1, 3) for _ in features]
        total = sum(raw)
        norm = [x / total for x in raw]
        importances = [round(x * 100, 1) for x in norm[:-1]]
        last = round(100 - sum(importances), 1)
        if 0 <= last <= 100 and all(0 <= v <= 100 for v in importances):
            importances.append(last)
            break
    else:
        # fallback:均分
        importances = [20.0] * 5
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    result = []
    for i, f in enumerate(features):
        result.append({
            "特征名": f["特征名"],
            "类别": f["类别"],
            "重要性": importances[i],
            "last_updated": now_str  # 动态字段
        })
    return result

@router.get("/data-quality-metrics", response_model=List[Dict[str, Any]])
def get_data_quality_metrics():
    """获取数据质量指标"""
    data_sources = [
        {
            "数据源": "财务报表",
            "完整性": 98,
            "准确性": 95,
            "一致性": 92,
            "时效性": 89,
            "最近更新": (datetime.now() - timedelta(days=2)).isoformat(),
            "记录数": 15420,
        },
        {
            "数据源": "审计记录",
            "完整性": 96,
            "准确性": 97,
            "一致性": 94,
            "时效性": 92,
            "最近更新": (datetime.now() - timedelta(days=1)).isoformat(),
            "记录数": 8765,
        },
        {
            "数据源": "舆情数据",
            "完整性": 85,
            "准确性": 82,
            "一致性": 80,
            "时效性": 98,
            "最近更新": datetime.now().isoformat(),
            "记录数": 32145,
        },
        {
            "数据源": "监管文件",
            "完整性": 93,
            "准确性": 97,
            "一致性": 95,
            "时效性": 87,
            "最近更新": (datetime.now() - timedelta(days=5)).isoformat(),
            "记录数": 4350,
        },
        {
            "数据源": "行业指标",
            "完整性": 90,
            "准确性": 93,
            "一致性": 91,
            "时效性": 85,
            "最近更新": (datetime.now() - timedelta(days=3)).isoformat(),
            "记录数": 7820,
        },
    ]
    return data_sources

@router.get("/data-ingestion-stats", response_model=List[Dict[str, Any]])
def get_data_ingestion_stats():
    """获取数据摄入统计"""
    # 生成过去7天的数据
    today = datetime.now().date()
    stats = []
    
    for i in range(7):
        date = today - timedelta(days=i)
        base = 350000 + random.randint(-50000, 50000)
        
        stats.append({
            "date": date.isoformat(),
            "total": base,
            "financial": int(base * 0.4),
            "news": int(base * 0.3),
            "regulatory": int(base * 0.2),
            "other": int(base * 0.1),
        })
    
    return stats

@router.get("/model-training-history")
async def get_model_training_history():
    """获取模型训练历史"""
    # 模拟过去10个版本的模型训练记录
    model_id = "risk_pred_001"  # 风险预测模型
    history = []
    
    current_date = datetime.now()
    current_version = [3, 2, 1]  # 当前版本3.2.1
    
    for i in range(10):
        # 计算版本号和训练日期
        if i > 0:
            if current_version[2] > 0:
                current_version[2] -= 1
            else:
                current_version[2] = 9
                if current_version[1] > 0:
                    current_version[1] -= 1
                else:
                    current_version[1] = 9
                    current_version[0] -= 1
        
        version = f"{current_version[0]}.{current_version[1]}.{current_version[2]}"
        training_date = (current_date - timedelta(days=i*15)).strftime("%Y-%m-%d")
        
        # 性能指标随版本迭代提升
        base_accuracy = 0.85 + (i * 0.008)
        accuracy = min(0.95, round(base_accuracy, 4))
        
        # 训练样本数也随时间增长
        sample_count = int(150000 + i * 8000)
        
        history.append({
            "版本": version,
            "训练日期": training_date,
            "准确率": accuracy,
            "训练样本数": sample_count,
            "训练时长": f"{random.randint(3, 8)}小时{random.randint(10, 59)}分钟",
            "备注": "例行迭代更新" if i > 0 else "当前生产版本"
        })
    
    return sorted(history, key=lambda x: x["版本"], reverse=True)

@router.get("/model-predictions/{model_id}")
async def get_model_predictions(model_id: str):
    """获取模型预测示例"""
    # 模拟不同模型的预测结果示例
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    if model_id == "risk_pred_001":
        return {
            "model_id": "risk_pred_001",
            "model_name": "风险预测模型",
            "prediction_date": current_date,
            "examples": [
                {
                    "company_id": "aura",
                    "risk_score": 27.5,
                    "risk_level": "低风险",
                    "confidence": 0.89,
                    "top_factors": ["资产负债率健康", "现金流充足", "舆情良好"],
                    "trend": "稳定"
                },
                {
                    "company_id": "beta",
                    "risk_score": 48.2,
                    "risk_level": "中风险",
                    "confidence": 0.87,
                    "top_factors": ["营收波动较大", "应收账款周转率下降", "行业景气度降低"],
                    "trend": "略升"
                },
                {
                    "company_id": "crisis",
                    "risk_score": 76.8,
                    "risk_level": "高风险",
                    "confidence": 0.92,
                    "top_factors": ["资产负债率过高", "现金流紧张", "舆情负面", "关联交易异常"],
                    "trend": "上升"
                }
            ]
        }
    elif model_id == "anomaly_001":
        return {
            "model_id": "anomaly_001",
            "model_name": "异常检测模型",
            "detection_date": current_date,
            "anomaly_count": 42,
            "examples": [
                {
                    "transaction_id": "T20230501-1458",
                    "anomaly_score": 0.89,
                    "category": "交易金额异常",
                    "description": "与历史交易模式偏差显著",
                    "severity": "高",
                    "detected_at": (datetime.now() - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S")
                },
                {
                    "transaction_id": "T20230429-0892",
                    "anomaly_score": 0.76,
                    "category": "关联方交易",
                    "description": "复杂关联方交易链路",
                    "severity": "中",
                    "detected_at": (datetime.now() - timedelta(hours=12)).strftime("%Y-%m-%d %H:%M:%S")
                },
                {
                    "transaction_id": "T20230428-2245",
                    "anomaly_score": 0.68,
                    "category": "凭证异常",
                    "description": "凭证信息不完整",
                    "severity": "中",
                    "detected_at": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
                }
            ]
        }
    else:
        raise HTTPException(status_code=404, detail="未找到模型预测示例") 