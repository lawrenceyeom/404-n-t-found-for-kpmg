import os
import json
from fastapi import Query
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional, List, Union

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

def get_datalake_file_path(company: str, data_type: str, layer: Optional[str] = None) -> str:
    """Generate a standardized filepath for datalake data files.
    
    Args:
        company: The company identifier (e.g., 'aura', 'beta', 'crisis')
        data_type: The type of data (e.g., 'finance', 'operation', 'opinion')
        layer: Optional processing layer (e.g., 'raw', 'feature', 'analysis')
    
    Returns:
        The path to the corresponding data file
    """
    # Handle normalized company and data type values
    company_map = {'aura': 'aura', 'beta': 'beta', 'crisis': 'crisis'}
    type_map = {'operation': 'operation', 'opinion': 'opinion', 'external': 'external', 
                'macro': 'macro', 'finance': 'finance'}
    
    company_id = company_map.get(company, company)
    data_type_id = type_map.get(data_type, data_type)
    
    # Generate filename with or without layer
    if layer and layer != 'raw':
        filename = f"{data_type_id}_{company_id}_{layer}.json"
    else:
        filename = f"{data_type_id}_{company_id}.json"
    
    return os.path.join(DATA_DIR, filename)

def load_json_file(filepath: str) -> Optional[Dict[str, Any]]:
    """Load JSON data from a file with error handling.
    
    Args:
        filepath: Path to the JSON file
    
    Returns:
        Dictionary containing the file data or None if file not found/invalid
    """
    try:
        if os.path.exists(filepath):
            with open(filepath, encoding='utf-8') as f:
                return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error loading data file {filepath}: {e}")
    
    return None

def get_generic_feature_data(company: str, data_type: str) -> Dict[str, Any]:
    """Generate generic feature data when specific data is unavailable.
    
    Args:
        company: The company identifier
        data_type: The type of data
    
    Returns:
        Dictionary with generic feature data
    """
    features = []
    
    # Common features across data types
    common_features = [
        {"name": "财务健康度", "importance": 0.28, "value": 0.76},
        {"name": "风险预警指数", "importance": 0.24, "value": 0.33},
    ]
    
    # Data type specific features
    if data_type == 'finance':
        features = [
            {"name": "流动比率", "importance": 0.32, "value": 2.15},
            {"name": "资产收益率", "importance": 0.30, "value": 0.18},
            {"name": "负债率", "importance": 0.25, "value": 0.45},
            {"name": "净利润率", "importance": 0.22, "value": 0.12}
        ]
    elif data_type == 'operation':
        features = [
            {"name": "销售增长率", "importance": 0.32, "value": 0.18},
            {"name": "库存周转率", "importance": 0.21, "value": 7.8},
            {"name": "生产效率指数", "importance": 0.18, "value": 0.92},
            {"name": "产品质量评分", "importance": 0.15, "value": 0.88}
        ]
    elif data_type == 'opinion':
        features = [
            {"name": "舆情情感均值", "importance": 0.35, "value": 0.75},
            {"name": "正面报道占比", "importance": 0.25, "value": 0.68},
            {"name": "媒体影响力指数", "importance": 0.20, "value": 0.82},
            {"name": "舆情波动性", "importance": 0.15, "value": 0.22}
        ]
    elif data_type == 'macro':
        features = [
            {"name": "宏观PMI相关性", "importance": 0.30, "value": 0.65},
            {"name": "政策风险敏感度", "importance": 0.25, "value": 0.42},
            {"name": "行业景气指数", "importance": 0.22, "value": 0.78},
            {"name": "宏观经济影响", "importance": 0.18, "value": 0.52}
        ]
    elif data_type == 'external':
        features = [
            {"name": "市场竞争地位", "importance": 0.32, "value": 0.75},
            {"name": "行业规范一致性", "importance": 0.28, "value": 0.92},
            {"name": "供应链弹性", "importance": 0.25, "value": 0.68},
            {"name": "外部法规风险", "importance": 0.20, "value": 0.32}
        ]
    
    # Company-specific adjustments
    multiplier = 1.0
    if company == 'beta':
        multiplier = 1.2
    elif company == 'crisis':
        multiplier = 0.7
    
    # Apply multiplier to values (with constraints)
    for feature in features:
        feature["value"] = min(1.0, max(0.1, feature["value"] * multiplier))
    
    # Add common features
    features.extend(common_features)
    
    return {
        "company": company,
        "type": data_type,
        "layer": "feature",
        "data_format": "feature_table",
        "features": features
    }

def get_generic_analysis_data(company: str, data_type: str) -> Dict[str, Any]:
    """Generate generic analysis data when specific data is unavailable.
    
    Args:
        company: The company identifier
        data_type: The type of data
    
    Returns:
        Dictionary with generic analysis data
    """
    # Company-specific base scores
    base_scores = {
        'aura': {'risk': 0.25, 'anomaly': 0.15, 'confidence': 0.85},
        'beta': {'risk': 0.45, 'anomaly': 0.30, 'confidence': 0.72},
        'crisis': {'risk': 0.78, 'anomaly': 0.65, 'confidence': 0.55}
    }
    
    # Data type specific explanations
    explanations = {
        'finance': {
            'risk': "财务指标波动、流动性变化、债务结构",
            'anomaly': "现金流异常、资产周转异常",
            'strength': "资产配置合理、债务管理稳健"
        },
        'operation': {
            'risk': "生产效率下降、库存积压增加",
            'anomaly': "产能利用率异常、原材料消耗异常",
            'strength': "生产流程优化、供应链管理高效"
        },
        'opinion': {
            'risk': "负面舆情增加、社交媒体曝光",
            'anomaly': "舆情突发波动、传播扩散异常",
            'strength': "品牌形象稳定、积极舆论占主导"
        },
        'macro': {
            'risk': "行业政策收紧、宏观经济下行",
            'anomaly': "行业指标异常波动、政策突变",
            'strength': "抗经济周期能力强、政策适应性好"
        },
        'external': {
            'risk': "竞争加剧、市场份额下降",
            'anomaly': "竞争对手异常活动、市场突变",
            'strength': "市场地位稳固、竞争优势明显"
        }
    }
    
    scores = base_scores.get(company, base_scores['aura'])
    explanation = explanations.get(data_type, explanations['finance'])
    
    return {
        "company": company,
        "type": data_type,
        "layer": "analysis",
        "data_format": "analysis_result",
        "results": [
            {
                "model": "风险预测模型", 
                "score": scores['risk'], 
                "explanation": explanation['risk']
            },
            {
                "model": "异常检测模型", 
                "score": scores['anomaly'], 
                "explanation": explanation['anomaly']
            },
            {
                "model": "企业优势分析", 
                "score": scores['confidence'], 
                "explanation": explanation['strength']
            }
        ]
    }

def get_datalake_data(company: str = Query(...), data_type: str = Query(...), layer: str = Query(...)):
    """API endpoint to retrieve data lake data for a company.
    
    Args:
        company: The company identifier
        data_type: The type of data to retrieve
        layer: The processing layer ('raw', 'feature', or 'analysis')
    
    Returns:
        JSON response with the requested data
    """
    # For raw data layer
    if layer == 'raw':
        filepath = get_datalake_file_path(company, data_type)
        data = load_json_file(filepath)
        if data:
            return JSONResponse(content=data)
    
    # For feature layer
    elif layer == 'feature':
        filepath = get_datalake_file_path(company, data_type, 'feature')
        data = load_json_file(filepath)
        if data:
            return JSONResponse(content=data)
        # Generate generic feature data as fallback
        return JSONResponse(content=get_generic_feature_data(company, data_type))
    
    # For analysis layer
    elif layer == 'analysis':
        filepath = get_datalake_file_path(company, data_type, 'analysis')
        data = load_json_file(filepath)
        if data:
            return JSONResponse(content=data)
        # Generate generic analysis data as fallback
        return JSONResponse(content=get_generic_analysis_data(company, data_type))
    
    # Try to find a suitable fallback file (e.g., just company data)
    if data_type == 'finance':
        filepath = get_datalake_file_path(company, 'finance')
        data = load_json_file(filepath)
        if data:
            return JSONResponse(content=data)
    
    # Last resort fallback - empty structure with error
    return JSONResponse(
        content={
            "company": company, 
            "data_type": data_type, 
            "layer": layer, 
            "data": [], 
            "error": "No mock data found for this combination."
        }, 
        status_code=404
    ) 