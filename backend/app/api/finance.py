"""
Financial Data API Module for AURA Platform

This module provides the financial data generation and API endpoints for the AURA platform.
It generates simulated financial data for three different company profiles (AURA, BETA, and CRISIS)
representing different financial health scenarios.

Key components:
- Financial templates for Balance Sheet (BS), Income Statement (IS), and Cash Flow (CF)
- Company profile definitions with financial characteristics and ratios
- Mock data generation functions for each financial statement type
- Financial ratio calculations
- API endpoints to retrieve the generated financial data

Main functions:
- gen_fake_bs(): Generates balance sheet data with realistic asset/liability structure
- gen_fake_is(): Generates income statement data based on company profiles
- gen_fake_cf(): Generates cash flow statement data consistent with BS and IS
- calculate_financial_ratios(): Computes key financial metrics from the statements
- generate_all_static_data(): Creates and stores all financial data on startup
- get_finance_data(): API endpoint to retrieve financial data for the frontend

This module simulates different company financial profiles to demonstrate AURA's 
risk analysis capabilities without requiring real financial data connections.
"""

from fastapi import APIRouter, Query, HTTPException
from pathlib import Path
from typing import Literal, Dict, List, Any, Tuple
import numpy as np
import random
import os

router = APIRouter()

# 修改为相对路径，适配Render部署 (Assuming this script is in a subfolder, adjust as needed)
# For simplicity, if this script is at the project root, BASE_DIR isn't strictly needed for this file's logic.
# BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

# 支持的主要表名 (Retained for context, not directly used in generation override)
SUPPORTED_SHEETS = {
    "合并-bs": ["item", "2024_09", "2023", "2022", "2021", "2020", "aux"],
    "母-bs":   ["item", "2024_09", "2023", "2022", "2021", "2020", "aux"],
    "合并-is": ["item", "2024_1-9", "2023", "2022", "2021", "2020", "aux"],
    "母-is ":  ["item", "2024_1-9", "2023", "2022", "2021", "2020", "aux"],
    "合并-cf": ["item", "2024_1-9", "2023", "2022", "2021", "2020", "aux"],
    "母-cf":   ["item", "2024_1-9", "2023", "2022", "2021", "2020", "aux"],
}

COMPANY_MAP = {
    "aura": "AURA稳健",
    "beta": "BETA成长",
    "crisis": "CRISIS压力"
}

# 三大表结构模板
BS_TEMPLATE = [
    '流动资产：', '货币资金', '交易性金融资产', '以公允价值计量且其变动计入当期损益的金融资产',
    '衍生金融资产', '应收票据', '应收账款', '应收款项融资', '预付款项', '应收保费', '应收分保账款',
    '应收分保合同准备金', '其他应收款', '买入返售金融资产', '存货', '合同资产', '持有待售资产',
    '一年内到期的非流动资产', '其他流动资产', '流动资产合计', '非流动资产：', '发放贷款和垫款',
    '债权投资', '可供出售金融资产', '其他债权投资', '持有至到期投资', '长期应收款', '长期股权投资',
    '其他权益工具投资', '其他非流动金融资产', '投资性房地产', '固定资产', '在建工程', '生产性生物资产',
    '油气资产', '无形资产', '开发支出', '商誉', '长期待摊费用', '递延所得税资产', '其他非流动资产',
    '非流动资产合计', '资产总计', '流动负债：', '短期借款', '交易性金融负债',
    '以公允价值计量且其变动计入当期损益的金融负债', '衍生金融负债', '应付票据', '应付账款', '预收款项',
    '合同负债', '应付职工薪酬', '应交税费', '其他应付款', '担保业务准备金', '持有待售负债',
    '一年内到期的非流动负债', '其他流动负债', '流动负债合计', '非流动负债：', '长期借款', '应付债券',
    '租赁负债', '长期应付款', '预计负债', '递延收益', '递延所得税负债', '其他非流动负债',
    '非流动负债合计', '负债合计', '所有者权益（或股东权益）：', '实收资本（或股本）', '其他权益工具',
    '其中：优先股', '永续债', '资本公积', '减：库存股', '其他综合收益', '专项储备', '盈余公积',
    '未分配利润', '归属于母公司股东权益合计', '少数股东权益', '所有者权益（或股东权益）合计',
    '负债和所有者权益（或股东权益）总计'
]

IS_TEMPLATE = [
    '一、营业总收入', '其中：营业收入', '利息收入', '已赚保费', '手续费及佣金收入',
    '二、营业总成本', '其中：营业成本', '利息支出', '手续费及佣金支出', '提取担保业务准备金',
    '赔付支出净额', '提取保险责任准备金净额', '保单红利支出', '分保费用', '税金及附加', '销售费用',
    '管理费用', '研发费用', '财务费用', '资产减值损失', '信用减值损失', '其他收益', '投资收益',
    '公允价值变动收益', '资产处置收益', '营业利润', '营业外收入', '营业外支出', '利润总额', '所得税费用',
    '净利润', '归属于母公司所有者的净利润', '少数股东损益', '每股收益基本每股收益', '稀释每股收益'
]

CF_TEMPLATE = [
    '一、经营活动产生的现金流量：', '销售商品、提供劳务收到的现金', '收到的税费返还',
    '收到其他与经营活动有关的现金', '经营活动现金流入小计', '购买商品、接受劳务支付的现金',
    '支付给职工以及为职工支付的现金', '支付的各项税费', '支付其他与经营活动有关的现金',
    '经营活动现金流出小计', '经营活动产生的现金流量净额', '二、投资活动产生的现金流量：',
    '收回投资收到的现金', '取得投资收益收到的现金', '处置固定资产、无形资产和其他长期资产收回的现金净额',
    '收到其他与投资活动有关的现金', '投资活动现金流入小计', '购建固定资产、无形资产和其他长期资产支付的现金',
    '投资支付的现金', '支付其他与投资活动有关的现金', '投资活动现金流出小计',
    '投资活动产生的现金流量净额', '三、筹资活动产生的现金流量：', '吸收投资收到的现金',
    '取得借款收到的现金', '收到其他与筹资活动有关的现金', '筹资活动现金流入小计', '偿还债务支付的现金',
    '分配股利、利润或偿付利息支付的现金', '支付其他与筹资活动有关的现金', '筹资活动现金流出小计',
    '筹资活动产生的现金流量净额', '四、汇率变动对现金及现金等价物的影响', '五、现金及现金等价物净增加额'
]

# Enhanced COMPANY_PROFILE
COMPANY_PROFILE = {
    'aura': { # 海外贸易、物流服务、供应链金融、商品销售
        'name': 'AURA稳健', 'base_asset_multiplier': 1.0, 'asset_growth': 0.05, 'liab_ratio': 0.50,
        'profit_margin': 0.06, 'volatility': 0.03, 'revenue_to_asset': 1.2,
        'bs_pct': { # As % of Total Assets
            '货币资金': 0.10, '应收账款': 0.25, '存货': 0.20, '固定资产': 0.15, # Logistics
            '交易性金融资产': 0.05, '预付款项': 0.05, '其他应收款': 0.03,
            '短期借款_curr_liab_pct': 0.40, '应付账款_curr_liab_pct': 0.50,
            '合同负债_curr_liab_pct': 0.10,
            'current_liab_of_total_liab': 0.70,
            '实收资本_equity_pct':0.40, '资本公积_equity_pct': 0.20, '盈余公积_equity_pct':0.10, #剩余为未分配利润
        },
        'is_pct': { # As % of Revenue
            'cogs': 0.75, 'selling_exp': 0.08, 'admin_exp': 0.05, 'finance_exp': 0.02,
            'other_bus_income_logistics': 0.03, 'tax_rate': 0.25,
        },
        'cf_factors': {'op_net_profit_mult': (0.9, 1.2), 'inv_asset_growth_mult': 0.8, 'fin_plug_mult': -0.5}
    },
    'beta': { # 投资并购、商业运营、物业管理、房地产开发
        'name': 'BETA成长', 'base_asset_multiplier': 1.8, 'asset_growth': 0.18, 'liab_ratio': 0.65,
        'profit_margin': 0.14, 'volatility': 0.08, 'revenue_to_asset': 0.45,
        'bs_pct': {
            '货币资金': 0.07, '存货': 0.28, '应收账款': 0.10, '其他应收款': 0.03, # Properties
            '投资性房地产': 0.17, '在建工程': 0.11, '长期股权投资': 0.12, 
            '无形资产': 0.05, '固定资产': 0.07, # Adding missing assets
            '短期借款_curr_liab_pct': 0.35, '应付账款_curr_liab_pct': 0.45,
            '合同负债_curr_liab_pct': 0.20,
            '长期借款_non_curr_liab_pct': 0.65, '应付债券_non_curr_liab_pct': 0.35, # Adding missing liabilities
            'current_liab_of_total_liab': 0.25,
            '实收资本_equity_pct':0.30, '资本公积_equity_pct': 0.25, '盈余公积_equity_pct':0.05,
            'minority_interest_net_profit_pct': 0.15, # Add missing equity item
        },
        'is_pct': {
            'cogs_prop_sales': 0.45, 'rental_income_rev_pct': 0.35, 'prop_mgmt_fees_rev_pct': 0.15,
            'admin_exp': 0.08, 'finance_exp': 0.06, 'investment_income': 0.08, 'tax_rate': 0.25,
            'minority_interest_net_profit_pct': 0.15,
        },
        'cf_factors': {'op_net_profit_mult': (0.9, 1.2), 'inv_asset_growth_mult': 1.2, 'fin_inv_mult': 0.9}
    },
    'crisis': { # 设备租赁、环保工程、政府项目、基建工程
        'name': 'CRISIS压力', 'base_asset_multiplier': 1.2, 'asset_growth': -0.02, 'liab_ratio': 0.80,
        'profit_margin': -0.05, 'volatility': 0.18, 'revenue_to_asset': 0.3,
        'bs_pct': {
            '货币资金': 0.03, '固定资产': 0.50, # Rental Equipment
            '长期应收款': 0.15, '在建工程': 0.10, '应收账款':0.12,
            '预计负债_total_liab_pct': 0.05,
            '短期借款_curr_liab_pct': 0.60, '应付账款_curr_liab_pct':0.30,
            'current_liab_of_total_liab': 0.60,
            '实收资本_equity_pct':0.50, '资本公积_equity_pct': 0.10, #可能会有减值导致留存为负
        },
        'is_pct': {
            'rental_rev_pct': 0.40, 'engineering_rev_pct': 0.60,
            'cogs_rental_depreciation': 0.30, # as % of rental_rev
            'cogs_engineering': 0.70, # as % of engineering_rev
            'admin_exp': 0.12, 'finance_exp': 0.10, 'impairment_loss': 0.08, 'tax_rate': 0.10, # Lower rate or credits
        },
        'cf_factors': {'op_net_profit_mult': (0.5, 0.9), 'inv_asset_growth_mult': 0.3, 'fin_struggle_mult': -0.2}
    }
}

PERIODS = ["2020", "2021", "2022", "2023", "2024", "2025_Q1"] # Default periods

def _get_profile_param(company: str, section: str, param: str, default: Any = 0):
    return COMPANY_PROFILE[company].get(section, {}).get(param, default)

def _apply_volatility(value: float, company: str, factor: float = 1.0) -> float:
    vol = COMPANY_PROFILE[company]['volatility'] * factor
    return value * (1 + random.uniform(-vol, vol))

def _distribute_value(total_value: float, distribution: Dict[str, float], company: str) -> Dict[str, float]:
    distributed_values = {}
    remaining_value = total_value
    # Apply specific distributions first
    for item, pct in distribution.items():
        val = _apply_volatility(total_value * pct, company)
        distributed_values[item] = val
        remaining_value -= val
    # Handle remaining (can be allocated to a default item or proportionally)
    # For simplicity, we assume distribution covers most, or an "Other" item handles it.
    # If remaining_value is large, it indicates distribution pcts don't sum to 1 or are too volatile.
    if "其他" in distribution and remaining_value != 0: # Simple allocation to "Other" if specified
         distributed_values["其他"] = distributed_values.get("其他",0) + remaining_value
    return distributed_values

def gen_fake_bs(company: str, periods: List[str]) -> Tuple[List[Dict[str, Any]], List[float]]:
    prof = COMPANY_PROFILE[company]
    bs_pct = prof['bs_pct']
    n = len(periods)

    base_asset_val = 10_000_0000 * prof['base_asset_multiplier']
    assets_ts = [base_asset_val * (1 + prof['asset_growth']) ** i for i in range(n)]
    assets_ts = [_apply_volatility(val, company, 0.5) for val in assets_ts] # Apply volatility to total assets trend

    data_by_item_period: Dict[str, Dict[str, float]] = {item: {p: 0.0 for p in periods} for item in BS_TEMPLATE}

    for i, period in enumerate(periods):
        total_assets = assets_ts[i]
        total_liabilities = total_assets * prof['liab_ratio']
        total_equity = total_assets - total_liabilities

        # --- Assets ---
        current_assets_map = {}
        non_current_assets_map = {}

        # Company specific items
        if company == 'aura':
            current_assets_map['货币资金'] = total_assets * bs_pct['货币资金']
            current_assets_map['应收账款'] = total_assets * bs_pct['应收账款']
            current_assets_map['存货'] = total_assets * bs_pct['存货']
            current_assets_map['交易性金融资产'] = total_assets * bs_pct['交易性金融资产']
            current_assets_map['预付款项'] = total_assets * bs_pct['预付款项']
            current_assets_map['其他应收款'] = total_assets * bs_pct['其他应收款']
            non_current_assets_map['固定资产'] = total_assets * bs_pct['固定资产'] # Logistics
        elif company == 'beta':
            current_assets_map['货币资金'] = total_assets * bs_pct['货币资金']
            current_assets_map['存货'] = total_assets * bs_pct['存货']
            current_assets_map['应收账款'] = total_assets * bs_pct['应收账款']
            current_assets_map['其他应收款'] = total_assets * bs_pct['其他应收款']
            non_current_assets_map['投资性房地产'] = total_assets * bs_pct['投资性房地产']
            non_current_assets_map['在建工程'] = total_assets * bs_pct['在建工程']
            non_current_assets_map['长期股权投资'] = total_assets * bs_pct['长期股权投资']
            non_current_assets_map['无形资产'] = total_assets * bs_pct['无形资产'] # Goodwill
            non_current_assets_map['固定资产'] = total_assets * bs_pct['固定资产']
        elif company == 'crisis':
            current_assets_map['货币资金'] = total_assets * bs_pct['货币资金']
            current_assets_map['应收账款'] = total_assets * bs_pct['应收账款']
            non_current_assets_map['固定资产'] = total_assets * bs_pct['固定资产'] # Rental Equip
            non_current_assets_map['长期应收款'] = total_assets * bs_pct['长期应收款']
            non_current_assets_map['在建工程'] = total_assets * bs_pct['在建工程']

        # Apply volatility and sum up
        total_ca_generated = 0
        for item, val in current_assets_map.items():
            data_by_item_period[item][period] = _apply_volatility(val, company)
            total_ca_generated += data_by_item_period[item][period]
        total_nca_generated = 0
        for item, val in non_current_assets_map.items():
            data_by_item_period[item][period] = _apply_volatility(val, company)
            total_nca_generated += data_by_item_period[item][period]

        # Allocate remaining to "Other" categories or adjust totals
        data_by_item_period['流动资产合计'][period] = total_ca_generated # Initial sum
        data_by_item_period['非流动资产合计'][period] = total_nca_generated

        # Balance Assets: Adjust 'Other' items or proportionally scale if major deviation
        asset_diff = total_assets - (total_ca_generated + total_nca_generated)
        if abs(asset_diff / total_assets) > 0.15 : # If diff is too large, means pcts are off
            # Simplified: Put into '其他流动资产' or '其他非流动资产'
             data_by_item_period['其他流动资产'][period] = asset_diff / 2
             data_by_item_period['其他非流动资产'][period] = asset_diff / 2
        elif asset_diff >= 0:
            data_by_item_period['其他流动资产'][period] = asset_diff * 0.6
            data_by_item_period['其他非流动资产'][period] = asset_diff * 0.4
        else: # if asset_diff is negative (overallocated)
            data_by_item_period['其他流动资产'][period] = asset_diff # just put negative into other CA
        
        data_by_item_period['流动资产合计'][period] += data_by_item_period['其他流动资产'][period]
        data_by_item_period['非流动资产合计'][period] += data_by_item_period['其他非流动资产'][period]
        data_by_item_period['资产总计'][period] = data_by_item_period['流动资产合计'][period] + data_by_item_period['非流动资产合计'][period]


        # --- Liabilities ---
        current_liab_total_target = total_liabilities * bs_pct['current_liab_of_total_liab']
        non_current_liab_total_target = total_liabilities - current_liab_total_target
        current_liab_map = {}
        non_current_liab_map = {}

        if company == 'aura':
            current_liab_map['短期借款'] = current_liab_total_target * bs_pct['短期借款_curr_liab_pct']
            current_liab_map['应付账款'] = current_liab_total_target * bs_pct['应付账款_curr_liab_pct']
            current_liab_map['合同负债'] = current_liab_total_target * bs_pct['合同负债_curr_liab_pct']
        elif company == 'beta':
            current_liab_map['合同负债'] = current_liab_total_target * bs_pct['合同负债_curr_liab_pct']
            current_liab_map['应付账款'] = current_liab_total_target * bs_pct['应付账款_curr_liab_pct'] # Add accounts payable
            current_liab_map['短期借款'] = current_liab_total_target * (1 - bs_pct['合同负债_curr_liab_pct'] - bs_pct['应付账款_curr_liab_pct']) # Remaining as short-term borrowings
            non_current_liab_map['长期借款'] = non_current_liab_total_target * bs_pct['长期借款_non_curr_liab_pct']
            non_current_liab_map['应付债券'] = non_current_liab_total_target * bs_pct['应付债券_non_curr_liab_pct']
        elif company == 'crisis':
            current_liab_map['短期借款'] = current_liab_total_target * bs_pct['短期借款_curr_liab_pct']
            current_liab_map['应付账款'] = current_liab_total_target * bs_pct['应付账款_curr_liab_pct']
            data_by_item_period['预计负债'][period] = _apply_volatility(total_liabilities * bs_pct['预计负债_total_liab_pct'], company)


        total_cl_generated = 0
        for item, val in current_liab_map.items():
            data_by_item_period[item][period] = _apply_volatility(val, company)
            total_cl_generated += data_by_item_period[item][period]
        total_ncl_generated = 0
        for item, val in non_current_liab_map.items():
            data_by_item_period[item][period] = _apply_volatility(val, company)
            total_ncl_generated += data_by_item_period[item][period]
        
        # Balance Liabilities
        liab_cl_diff = current_liab_total_target - total_cl_generated
        data_by_item_period['其他流动负债'][period] = liab_cl_diff
        liab_ncl_diff = non_current_liab_total_target - total_ncl_generated
        data_by_item_period['其他非流动负债'][period] = liab_ncl_diff

        data_by_item_period['流动负债合计'][period] = total_cl_generated + data_by_item_period['其他流动负债'][period]
        data_by_item_period['非流动负债合计'][period] = total_ncl_generated + data_by_item_period['其他非流动负债'][period] + data_by_item_period['预计负债'][period] # Add unique items like provision
        data_by_item_period['负债合计'][period] = data_by_item_period['流动负债合计'][period] + data_by_item_period['非流动负债合计'][period]

        # --- Equity ---
        equity_map = {}
        equity_map['实收资本（或股本）'] = total_equity * bs_pct['实收资本_equity_pct']
        equity_map['资本公积'] = total_equity * bs_pct.get('资本公积_equity_pct', 0.15) # Default if not specified
        equity_map['盈余公积'] = total_equity * bs_pct.get('盈余公积_equity_pct', 0.10)

        if company == 'beta':
            equity_map['少数股东权益'] = total_equity * bs_pct['minority_interest_net_profit_pct']

        generated_equity_sum = 0
        for item, val in equity_map.items():
            data_by_item_period[item][period] = _apply_volatility(val, company, 0.3) # Lower vol for equity items
            generated_equity_sum += data_by_item_period[item][period]

        data_by_item_period['未分配利润'][period] = total_equity - generated_equity_sum
        data_by_item_period['所有者权益（或股东权益）合计'][period] = total_equity
        if company == 'beta':
             data_by_item_period['归属于母公司股东权益合计'][period] = total_equity - data_by_item_period['少数股东权益'][period]
        else:
             data_by_item_period['归属于母公司股东权益合计'][period] = total_equity


        data_by_item_period['负债和所有者权益（或股东权益）总计'][period] = data_by_item_period['负债合计'][period] + data_by_item_period['所有者权益（或股东权益）合计'][period]

        # Final check to force balance if minor diff due to volatility
        final_asset_total = data_by_item_period['资产总计'][period]
        final_liab_equity_total = data_by_item_period['负债和所有者权益（或股东权益）总计'][period]
        if abs(final_asset_total - final_liab_equity_total) > 0.01 * final_asset_total : # if diff more than 1%
            # This indicates a larger logic issue, but for now, force balance via "Other Assets" or "Retained Earnings"
            diff_to_balance = final_asset_total - final_liab_equity_total
            data_by_item_period['未分配利润'][period] -= diff_to_balance # Force equity to balance
            data_by_item_period['所有者权益（或股东权益）合计'][period] -= diff_to_balance
            data_by_item_period['负债和所有者权益（或股东权益）总计'][period] = final_asset_total


    # Convert to list of dicts format
    output_data_list = []
    for item_name_template in BS_TEMPLATE:
        row = {'item': item_name_template}
        is_header = item_name_template.endswith("：")
        for period in periods:
            val = data_by_item_period.get(item_name_template, {}).get(period)
            if val is None and not is_header: # Default to 0 for data items if not calculated
                val = 0.0
            elif val is not None:
                val = round(val, 2)
            row[period] = val
        output_data_list.append(row)
    return output_data_list, assets_ts


def gen_fake_is(company: str, periods: List[str], assets_ts: List[float]) -> List[Dict[str, Any]]:
    prof = COMPANY_PROFILE[company]
    is_pct = prof['is_pct']
    n = len(periods)
    data_by_item_period: Dict[str, Dict[str, float]] = {item: {p: 0.0 for p in periods} for item in IS_TEMPLATE}

    revenues = [assets_ts[i] * prof['revenue_to_asset'] for i in range(n)]
    revenues = [_apply_volatility(val, company) for val in revenues]

    for i, period in enumerate(periods):
        current_revenue = revenues[i]
        data_by_item_period['一、营业总收入'][period] = current_revenue
        data_by_item_period['其中：营业收入'][period] = current_revenue

        # COGS and main expenses
        if company == 'aura':
            data_by_item_period['其中：营业成本'][period] = current_revenue * is_pct['cogs']
            data_by_item_period['销售费用'][period] = current_revenue * is_pct['selling_exp']
            data_by_item_period['管理费用'][period] = current_revenue * is_pct['admin_exp']
            data_by_item_period['财务费用'][period] = current_revenue * is_pct['finance_exp']
            data_by_item_period['其他收益'][period] = current_revenue * is_pct['other_bus_income_logistics'] # As other income
        elif company == 'beta':
            rental_rev = current_revenue * is_pct['rental_income_rev_pct']
            mgmt_fees = current_revenue * is_pct['prop_mgmt_fees_rev_pct']
            sales_rev = current_revenue - rental_rev - mgmt_fees
            data_by_item_period['其中：营业成本'][period] = sales_rev * is_pct['cogs_prop_sales'] # COGS for property sales part
            data_by_item_period['管理费用'][period] = current_revenue * is_pct['admin_exp']
            data_by_item_period['财务费用'][period] = current_revenue * is_pct['finance_exp']
            data_by_item_period['投资收益'][period] = current_revenue * is_pct['investment_income']
        elif company == 'crisis':
            rental_rev = current_revenue * is_pct['rental_rev_pct']
            eng_rev = current_revenue * is_pct['engineering_rev_pct']
            cogs_rental = rental_rev * is_pct['cogs_rental_depreciation']
            cogs_eng = eng_rev * is_pct['cogs_engineering']
            data_by_item_period['其中：营业成本'][period] = cogs_rental + cogs_eng
            data_by_item_period['管理费用'][period] = current_revenue * is_pct['admin_exp']
            data_by_item_period['财务费用'][period] = current_revenue * is_pct['finance_exp']
            data_by_item_period['资产减值损失'][period] = -abs(current_revenue * is_pct['impairment_loss']) # Negative

        # Apply volatility to generated expenses
        for item in ['其中：营业成本', '销售费用', '管理费用', '财务费用', '投资收益', '其他收益', '资产减值损失']:
            if data_by_item_period.get(item,{}).get(period,0) != 0: # if it was set
                 data_by_item_period[item][period] = _apply_volatility(data_by_item_period[item][period], company, 0.7)

        # Common items
        data_by_item_period['税金及附加'][period] = data_by_item_period['其中：营业成本'][period] * 0.05 # Example: 5% of COGS

        # Calculate down to Net Profit
        op_profit_items = current_revenue - data_by_item_period['其中：营业成本'][period] - \
                          data_by_item_period.get('税金及附加', {}).get(period,0) - \
                          data_by_item_period.get('销售费用', {}).get(period,0) - \
                          data_by_item_period.get('管理费用', {}).get(period,0) - \
                          data_by_item_period.get('研发费用', {}).get(period,0) - \
                          data_by_item_period.get('财务费用', {}).get(period,0)
        
        op_profit_items += data_by_item_period.get('其他收益', {}).get(period,0) + \
                           data_by_item_period.get('投资收益', {}).get(period,0) + \
                           data_by_item_period.get('公允价值变动收益', {}).get(period,0) + \
                           data_by_item_period.get('资产处置收益', {}).get(period,0) + \
                           data_by_item_period.get('资产减值损失', {}).get(period,0) # impairment is already negative

        data_by_item_period['营业利润'][period] = op_profit_items
        
        #营业外收支
        ext_income = _apply_volatility(current_revenue * 0.002, company)
        ext_expense = _apply_volatility(current_revenue * 0.0015, company)
        data_by_item_period['营业外收入'][period] = ext_income
        data_by_item_period['营业外支出'][period] = ext_expense
        
        profit_before_tax = op_profit_items + ext_income - ext_expense
        data_by_item_period['利润总额'][period] = profit_before_tax
        
        tax_rate_actual = is_pct.get('tax_rate', 0.25)
        income_tax = profit_before_tax * tax_rate_actual if profit_before_tax > 0 else 0
        data_by_item_period['所得税费用'][period] = income_tax
        
        net_profit = profit_before_tax - income_tax
        data_by_item_period['净利润'][period] = net_profit

        if company == 'beta' and 'minority_interest_net_profit_pct' in is_pct:
            minority_loss_profit = net_profit * is_pct['minority_interest_net_profit_pct']
            data_by_item_period['少数股东损益'][period] = _apply_volatility(minority_loss_profit, company, 0.5)
            data_by_item_period['归属于母公司所有者的净利润'][period] = net_profit - data_by_item_period['少数股东损益'][period]
        else:
            data_by_item_period['归属于母公司所有者的净利润'][period] = net_profit
            data_by_item_period['少数股东损益'][period] = 0.0

    # Convert to list of dicts format
    output_data_list = []
    for item_name_template in IS_TEMPLATE:
        row = {'item': item_name_template}
        is_header = item_name_template.startswith("一、") or item_name_template.startswith("二、") or item_name_template.startswith("其中：")
        for period in periods:
            val = data_by_item_period.get(item_name_template, {}).get(period)
            if val is None and not is_header:
                 val = 0.0
            elif val is not None:
                val = round(val, 2)
            row[period] = val
        output_data_list.append(row)
    return output_data_list


def gen_fake_cf(company: str, periods: List[str], is_data: List[Dict[str, Any]], bs_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    prof = COMPANY_PROFILE[company]
    cf_factors = prof['cf_factors']
    n = len(periods)
    data_by_item_period: Dict[str, Dict[str, float]] = {item: {p: 0.0 for p in periods} for item in CF_TEMPLATE}

    net_profits_ts = [next((r.get(p, 0.0) for r in is_data if r['item'] == '净利润'), 0.0) for p in periods]
    assets_ts = [next((r.get(p, 0.0) for r in bs_data if r['item'] == '资产总计'), 0.0) for p in periods]

    op_cf_nets = [npf * random.uniform(cf_factors['op_net_profit_mult'][0], cf_factors['op_net_profit_mult'][1]) for npf in net_profits_ts]

    inv_cf_nets = [0.0] * n
    fin_cf_nets = [0.0] * n

    for i in range(n):
        asset_chg = assets_ts[i] - assets_ts[i-1] if i > 0 else assets_ts[i] * prof['asset_growth'] # Approx change for first period
        if company == 'aura':
            inv_cf_nets[i] = -abs(asset_chg * cf_factors['inv_asset_growth_mult'] * 0.6) # Capex relates to asset growth
            fin_cf_nets[i] = (op_cf_nets[i] + inv_cf_nets[i]) * cf_factors['fin_plug_mult'] if (op_cf_nets[i] + inv_cf_nets[i]) < 0 else -abs(asset_chg *0.2)
        elif company == 'beta':
            inv_cf_nets[i] = -abs(asset_chg * cf_factors['inv_asset_growth_mult']) # Heavy investment
            fin_cf_nets[i] = abs(inv_cf_nets[i]) * cf_factors['fin_inv_mult'] # Financed
        elif company == 'crisis':
            inv_cf_nets[i] = -abs(assets_ts[i] * 0.03 * cf_factors['inv_asset_growth_mult']) # Minimal capex
            fin_cf_nets[i] = (op_cf_nets[i] + inv_cf_nets[i]) * cf_factors['fin_struggle_mult'] - assets_ts[i]*0.01 # Debt repayment struggle

    cash_flow_net_increase = [op_cf_nets[j] + inv_cf_nets[j] + fin_cf_nets[j] for j in range(n)]

    for i, period in enumerate(periods):
        data_by_item_period['经营活动产生的现金流量净额'][period] = op_cf_nets[i]
        data_by_item_period['投资活动产生的现金流量净额'][period] = inv_cf_nets[i]
        data_by_item_period['筹资活动产生的现金流量净额'][period] = fin_cf_nets[i]
        data_by_item_period['五、现金及现金等价物净增加额'][period] = cash_flow_net_increase[i]
        # Detailed items within these categories are still largely unpopulated for simplicity

    output_data_list = []
    for item_name_template in CF_TEMPLATE:
        row = {'item': item_name_template}
        is_header = item_name_template.endswith("：") or item_name_template.endswith("小计")
        for period in periods:
            val = data_by_item_period.get(item_name_template, {}).get(period)
            if val is None and not is_header: val = 0.0
            elif val is not None: val = round(val, 2)
            row[period] = val
        output_data_list.append(row)
    return output_data_list


def calculate_financial_ratios(bs_data: List[Dict[str, Any]], is_data: List[Dict[str, Any]], periods: List[str]) -> Dict[str, Dict[str, Any]]:
    ratios_by_period: Dict[str, Dict[str, Any]] = {p: {} for p in periods}

    def get_val(data_list: List[Dict[str, Any]], item_name: str, period: str, default: float = 0.0) -> float:
        for row in data_list:
            if row['item'] == item_name:
                v = row.get(period)
                return v if isinstance(v, (int, float)) else default
        return default

    for i, period in enumerate(periods):
        prev_period = periods[i-1] if i > 0 else None
        ratios = ratios_by_period[period]

        # BS Items
        total_assets = get_val(bs_data, '资产总计', period)
        current_assets = get_val(bs_data, '流动资产合计', period)
        inventory = get_val(bs_data, '存货', period)
        cash = get_val(bs_data, '货币资金', period)
        accounts_receivable = get_val(bs_data, '应收账款', period)
        total_liabilities = get_val(bs_data, '负债合计', period)
        current_liabilities = get_val(bs_data, '流动负债合计', period)
        total_equity = get_val(bs_data, '所有者权益（或股东权益）合计', period)
        equity_parent = get_val(bs_data, '归属于母公司股东权益合计', period, total_equity) # Fallback to total_equity if not specified

        s_debt = get_val(bs_data, '短期借款', period)
        lt_debt_curr = get_val(bs_data, '一年内到期的非流动负债', period, 0)
        lt_debt = get_val(bs_data, '长期借款', period)
        bonds = get_val(bs_data, '应付债券', period, 0)
        interest_bearing_debt = s_debt + lt_debt_curr + lt_debt + bonds

        # IS Items
        revenue = get_val(is_data, '一、营业总收入', period)
        cogs = get_val(is_data, '其中：营业成本', period)
        net_profit_for_parent = get_val(is_data, '归属于母公司所有者的净利润', period)
        operating_profit = get_val(is_data, '营业利润', period)

        # Calculations
        ratios['资产负债率'] = (total_liabilities / total_assets * 100) if total_assets else None
        ratios['流动比率'] = (current_assets / current_liabilities) if current_liabilities else None
        ratios['速动比率'] = ((current_assets - inventory) / current_liabilities) if current_liabilities else None

        avg_equity = equity_parent
        if prev_period:
            prev_equity_parent = get_val(bs_data, '归属于母公司股东权益合计', prev_period, get_val(bs_data, '所有者权益（或股东权益）合计', prev_period))
            if prev_equity_parent: avg_equity = (equity_parent + prev_equity_parent) / 2
        ratios['净资产收益率'] = (net_profit_for_parent / avg_equity * 100) if avg_equity else None # ROE

        ratios['有息负债占总资产比'] = (interest_bearing_debt / total_assets * 100) if total_assets else None

        # ROC/ROIC approximation: Operating Profit / (Total Equity + Interest Bearing Debt - Cash)
        capital_employed = total_equity + interest_bearing_debt - cash
        ratios['资本回报率'] = (operating_profit / capital_employed * 100) if capital_employed else None

        ratios['主营业务利润率'] = ((revenue - cogs) / revenue * 100) if revenue else None # Gross Profit Margin

        avg_total_assets = total_assets
        if prev_period:
            prev_total_assets = get_val(bs_data, '资产总计', prev_period)
            if prev_total_assets: avg_total_assets = (total_assets + prev_total_assets) / 2
        ratios['总资产周转率'] = (revenue / avg_total_assets) if avg_total_assets else None

        avg_ar = accounts_receivable
        if prev_period:
            prev_ar = get_val(bs_data, '应收账款', prev_period)
            if prev_ar : avg_ar = (accounts_receivable + prev_ar) / 2
        ratios['应收账款周转率'] = (revenue / avg_ar) if avg_ar else None

        avg_inv = inventory
        if prev_period:
            prev_inv = get_val(bs_data, '存货', prev_period)
            if prev_inv : avg_inv = (inventory + prev_inv) / 2
        ratios['存货周转率'] = (cogs / avg_inv) if avg_inv else None

        # Round all ratio values
        for k, v in ratios.items():
            ratios[k] = round(v, 4) if isinstance(v, (float, int)) else v
            
    return ratios_by_period


# --- FastAPI Setup & Data Generation ---
STATIC_FINANCE_DATA: Dict[str, Dict[str, Any]] = {}

def generate_all_static_data():
    print("Generating static financial data...")
    for company_id in COMPANY_PROFILE.keys():
        STATIC_FINANCE_DATA[company_id] = {}
        
        bs_data_list, assets_ts_for_is = gen_fake_bs(company_id, PERIODS)
        STATIC_FINANCE_DATA[company_id]["合并-bs"] = bs_data_list
        
        is_data_list = gen_fake_is(company_id, PERIODS, assets_ts_for_is)
        STATIC_FINANCE_DATA[company_id]["合并-is"] = is_data_list
        
        cf_data_list = gen_fake_cf(company_id, PERIODS, is_data_list, bs_data_list)
        STATIC_FINANCE_DATA[company_id]["合并-cf"] = cf_data_list
        
        ratios = calculate_financial_ratios(bs_data_list, is_data_list, PERIODS)
        STATIC_FINANCE_DATA[company_id]["financial_ratios"] = ratios
    print("Static financial data generation complete.")

# Generate data at startup
generate_all_static_data()

@router.get("/finance_data", summary="获取财务报表或财务比率数据")
def get_finance_data(
    company: Literal["aura", "beta", "crisis"] = Query("aura", description="公司ID"),
    sheet: Literal["合并-bs", "合并-is", "合并-cf", "financial_ratios"] = Query("合并-bs", description="报表类型或'financial_ratios'"),
    request_periods: str = Query(None, description=f"逗号分隔的期间列表 (例如 '2022,2023'). 默认所有: {','.join(PERIODS)}")
):
    if company not in STATIC_FINANCE_DATA:
        raise HTTPException(status_code=404, detail=f"Company ID '{company}' not found.")
    if sheet not in STATIC_FINANCE_DATA[company]:
        raise HTTPException(status_code=404, detail=f"Data for sheet/ratios '{sheet}' not found for company '{company}'.")

    data_content = STATIC_FINANCE_DATA[company][sheet]
    
    actual_periods_in_data = PERIODS # Assuming all generated data uses the global PERIODS

    selected_periods = actual_periods_in_data
    if request_periods:
        selected_periods = [p.strip() for p in request_periods.split(",")]
        if not all(p in actual_periods_in_data for p in selected_periods):
            raise HTTPException(status_code=400, detail=f"One or more requested periods are invalid. Available: {', '.join(actual_periods_in_data)}")

    if sheet == "financial_ratios":
        # For ratios, data_content is Dict[period, Dict[ratio_name, value]]
        filtered_data = {p: data_content.get(p, {}) for p in selected_periods if p in data_content}
    else:
        # For tables, data_content is List[Dict[item, value_for_period1, ...]]
        filtered_data = []
        for row in data_content:
            new_row = {"item": row["item"]}
            for p in selected_periods:
                new_row[p] = row.get(p)
            filtered_data.append(new_row)
            
    return {
        "company_id": company,
        "company_name": COMPANY_MAP.get(company, "N/A"),
        "sheet_type": sheet,
        "periods_requested": selected_periods,
        "data": filtered_data
    }

# If this code is run directly, regenerate the static data
if __name__ == "__main__":
    # Force regeneration of static financial data
    print("Regenerating all financial data...")
    generate_all_static_data()
    print("Data regeneration complete.")

# If you want to run this with uvicorn for testing:
# 1. Save this file as, e.g., `financial_data_api.py`
# 2. Install FastAPI and Uvicorn: `pip install fastapi uvicorn`
# 3. Run from terminal: `uvicorn financial_data_api:router --reload --port 8000` (assuming router is what you want to serve)
#    Or, if you want to include it in a larger FastAPI app:
#    In your main app:
#    from fastapi import FastAPI
#    from .financial_data_api import router as financial_router # Adjust import path
#    app = FastAPI()
#    app.include_router(financial_router, prefix="/api/v1") # Example prefix