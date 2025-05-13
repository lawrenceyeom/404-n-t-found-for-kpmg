from fastapi import APIRouter, Query, HTTPException
import pandas as pd
from pathlib import Path
from typing import Literal
import numpy as np
import random

router = APIRouter()

# 使用相对路径，适配云端部署
EXCEL_PATH = Path(__file__).parent / ".." / ".." / ".venv" / "财务模板大全-兴化城投-2024年9月末(已更新).xlsx"

# 支持的主要表名
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

# 三大表结构模板（部分示例，后续可补全）
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

# 公司特征参数
COMPANY_PROFILE = {
    'aura': {
        'name': 'AURA稳健',
        'asset_growth': 0.03, 'liab_ratio': 0.55, 'profit_margin': 0.13, 'cashflow_ratio': 0.12,
        'volatility': 0.03
    },
    'beta': {
        'name': 'BETA成长',
        'asset_growth': 0.12, 'liab_ratio': 0.68, 'profit_margin': 0.08, 'cashflow_ratio': 0.06,
        'volatility': 0.10
    },
    'crisis': {
        'name': 'CRISIS压力',
        'asset_growth': -0.02, 'liab_ratio': 0.88, 'profit_margin': -0.03, 'cashflow_ratio': -0.01,
        'volatility': 0.18
    }
}

def gen_fake_bs(company: str, periods: list):
    p = COMPANY_PROFILE[company]
    n = len(periods)
    company_idx = {'aura': 1, 'beta': 2, 'crisis': 3}[company]
    # 1. 生成总资产序列
    base_asset = 10_000_0000 * random.uniform(0.95, 1.05)
    assets = [base_asset * ((1 + p['asset_growth']) ** i) * random.uniform(0.98, 1.02) for i in range(n)]
    # 2. 负债、权益
    liabs = [a * p['liab_ratio'] * random.uniform(0.98, 1.02) for a in assets]
    equitys = [a - l for a, l in zip(assets, liabs)]
    # 3. 主要结构比例
    ca_ratio = 0.45 if company == 'aura' else (0.55 if company == 'beta' else 0.35)
    fa_ratio = 1 - ca_ratio
    st_debt_ratio = 0.18 if company == 'aura' else (0.22 if company == 'beta' else 0.32)
    lt_debt_ratio = 0.22 if company == 'aura' else (0.28 if company == 'beta' else 0.38)
    cap_ratio = 0.35 if company == 'aura' else (0.28 if company == 'beta' else 0.18)
    re_ratio = 0.45 if company == 'aura' else (0.52 if company == 'beta' else 0.38)
    # 细分项目比例（主流科目，剩余归入"其他"）
    ca_items = [
        ('货币资金', 0.18, 0.12, 0.08),
        ('应收账款', 0.10, 0.16, 0.07),
        ('存货', 0.08, 0.13, 0.05),
        ('应收票据', 0.06, 0.08, 0.03),
        ('预付款项', 0.04, 0.06, 0.02),
        ('其他应收款', 0.03, 0.04, 0.02),
    ]
    fa_items = [
        ('固定资产', 0.22, 0.18, 0.13),
        ('在建工程', 0.04, 0.06, 0.03),
        ('无形资产', 0.06, 0.08, 0.04),
        ('长期股权投资', 0.05, 0.07, 0.03),
        ('投资性房地产', 0.03, 0.04, 0.01),
    ]
    st_debt_items = [
        ('短期借款', 0.22, 0.28, 0.36),
        ('应付账款', 0.13, 0.16, 0.09),
        ('应付票据', 0.08, 0.10, 0.06),
        ('合同负债', 0.06, 0.08, 0.04),
        ('应付职工薪酬', 0.04, 0.05, 0.03),
        ('应交税费', 0.03, 0.04, 0.02),
    ]
    lt_debt_items = [
        ('长期借款', 0.32, 0.38, 0.48),
        ('应付债券', 0.12, 0.16, 0.18),
        ('租赁负债', 0.06, 0.08, 0.04),
        ('递延所得税负债', 0.04, 0.06, 0.03),
    ]
    equity_items = [
        ('实收资本（或股本）', cap_ratio, cap_ratio, cap_ratio),
        ('资本公积', 0.18, 0.14, 0.10),
        ('盈余公积', 0.10, 0.12, 0.08),
        ('未分配利润', re_ratio, re_ratio, re_ratio),
    ]
    # 生成表格
    data = []
    for idx, item in enumerate(BS_TEMPLATE):
        row = {'item': item}
        for i, period in enumerate(periods):
            v = None
            # 资产端
            if item == '资产总计' or item == '负债和所有者权益（或股东权益）总计':
                v = round(assets[i], 2)
            elif item == '流动资产合计':
                v = None  # 稍后补齐
            elif item == '非流动资产合计':
                v = None
            elif item == '货币资金':
                v = round(assets[i] * ca_ratio * ca_items[0][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '应收账款':
                v = round(assets[i] * ca_ratio * ca_items[1][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '存货':
                v = round(assets[i] * ca_ratio * ca_items[2][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '应收票据':
                v = round(assets[i] * ca_ratio * ca_items[3][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '预付款项':
                v = round(assets[i] * ca_ratio * ca_items[4][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '其他应收款':
                v = round(assets[i] * ca_ratio * ca_items[5][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '其他流动资产':
                v = None  # 稍后补齐
            # 非流动资产
            elif item == '固定资产':
                v = round(assets[i] * fa_ratio * fa_items[0][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '在建工程':
                v = round(assets[i] * fa_ratio * fa_items[1][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '无形资产':
                v = round(assets[i] * fa_ratio * fa_items[2][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '长期股权投资':
                v = round(assets[i] * fa_ratio * fa_items[3][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '投资性房地产':
                v = round(assets[i] * fa_ratio * fa_items[4][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '其他非流动资产':
                v = None  # 稍后补齐
            # 负债端
            elif item == '负债合计':
                v = round(liabs[i], 2)
            elif item == '流动负债合计':
                v = None
            elif item == '非流动负债合计':
                v = None
            elif item == '短期借款':
                v = round(liabs[i] * st_debt_ratio * st_debt_items[0][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '应付账款':
                v = round(liabs[i] * st_debt_ratio * st_debt_items[1][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '应付票据':
                v = round(liabs[i] * st_debt_ratio * st_debt_items[2][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '合同负债':
                v = round(liabs[i] * st_debt_ratio * st_debt_items[3][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '应付职工薪酬':
                v = round(liabs[i] * st_debt_ratio * st_debt_items[4][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '应交税费':
                v = round(liabs[i] * st_debt_ratio * st_debt_items[5][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '其他流动负债':
                v = None  # 稍后补齐
            elif item == '长期借款':
                v = round(liabs[i] * lt_debt_ratio * lt_debt_items[0][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '应付债券':
                v = round(liabs[i] * lt_debt_ratio * lt_debt_items[1][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '租赁负债':
                v = round(liabs[i] * lt_debt_ratio * lt_debt_items[2][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '递延所得税负债':
                v = round(liabs[i] * lt_debt_ratio * lt_debt_items[3][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '其他非流动负债':
                v = None  # 稍后补齐
            # 权益端
            elif item == '所有者权益（或股东权益）合计':
                v = round(equitys[i], 2)
            elif item == '实收资本（或股本）':
                v = round(equitys[i] * equity_items[0][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '资本公积':
                v = round(equitys[i] * equity_items[1][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '盈余公积':
                v = round(equitys[i] * equity_items[2][company_idx] * random.uniform(0.95, 1.05), 2)
            elif item == '未分配利润':
                v = round(equitys[i] * equity_items[3][company_idx] * random.uniform(0.95, 1.05), 2)
            # 其他项目：部分冷门科目随机为0或空
            elif item in ['以公允价值计量且其变动计入当期损益的金融资产', '衍生金融资产', '应收保费', '应收分保账款', '应收分保合同准备金', '买入返售金融资产', '合同资产', '持有待售资产', '一年内到期的非流动资产', '发放贷款和垫款', '债权投资', '可供出售金融资产', '其他债权投资', '持有至到期投资', '长期应收款', '其他权益工具投资', '其他非流动金融资产', '生产性生物资产', '油气资产', '开发支出', '商誉', '长期待摊费用', '递延所得税资产', '短期借款', '交易性金融负债', '以公允价值计量且其变动计入当期损益的金融负债', '衍生金融负债', '担保业务准备金', '持有待售负债', '一年内到期的非流动负债', '预计负债', '递延收益', '其他权益工具', '其中：优先股', '永续债', '减：库存股', '其他综合收益', '专项储备', '归属于母公司股东权益合计', '少数股东权益']:
                v = 0 if random.random() < 0.7 else None
            row[period] = v
        data.append(row)
    # 勾稽补齐合计项和"其他"项
    for i, period in enumerate(periods):
        # 流动资产合计
        ca_sum = sum([row[period] for row in data if row['item'] in [x[0] for x in ca_items] and row[period] is not None])
        ca_total = round(assets[i] * ca_ratio, 2)
        for row in data:
            if row['item'] == '流动资产合计':
                row[period] = ca_total
            if row['item'] == '其他流动资产':
                row[period] = round(ca_total - ca_sum, 2)
        # 非流动资产合计
        fa_sum = sum([row[period] for row in data if row['item'] in [x[0] for x in fa_items] and row[period] is not None])
        fa_total = round(assets[i] * fa_ratio, 2)
        for row in data:
            if row['item'] == '非流动资产合计':
                row[period] = fa_total
            if row['item'] == '其他非流动资产':
                row[period] = round(fa_total - fa_sum, 2)
        # 流动负债合计
        st_sum = sum([row[period] for row in data if row['item'] in [x[0] for x in st_debt_items] and row[period] is not None])
        for row in data:
            if row['item'] == '流动负债合计':
                row[period] = st_sum
            if row['item'] == '其他流动负债':
                row[period] = 0.0  # 已全部分配
        # 非流动负债合计
        lt_sum = sum([row[period] for row in data if row['item'] in [x[0] for x in lt_debt_items] and row[period] is not None])
        lt_total = round(liabs[i] * lt_debt_ratio, 2)
        for row in data:
            if row['item'] == '非流动负债合计':
                row[period] = lt_total
            if row['item'] == '其他非流动负债':
                row[period] = round(lt_total - lt_sum, 2)
    return data

def gen_fake_is(company: str, periods: list):
    p = COMPANY_PROFILE[company]
    n = len(periods)
    # 1. 营业收入递推
    base_revenue = 2_000_0000 * random.uniform(0.95, 1.05)
    revenues = [base_revenue * ((1 + p['asset_growth']*1.2) ** i) * random.uniform(0.98, 1.02) for i in range(n)]
    # 2. 成本、费用、利润
    cost_rat = 0.82 if company == 'aura' else (0.88 if company == 'beta' else 0.91)
    mgmt_rat = 0.06 if company == 'aura' else (0.08 if company == 'beta' else 0.10)
    fin_rat = 0.03 if company == 'aura' else (0.04 if company == 'beta' else 0.07)
    tax_rat = 0.18 if company == 'aura' else (0.15 if company == 'beta' else 0.10)
    profits = []
    for i in range(n):
        cost = revenues[i] * cost_rat * random.uniform(0.98, 1.02)
        mgmt = revenues[i] * mgmt_rat * random.uniform(0.98, 1.02)
        fin = revenues[i] * fin_rat * random.uniform(0.98, 1.02)
        gross = revenues[i] - cost
        op_profit = gross - mgmt - fin
        pre_tax = op_profit * random.uniform(0.98, 1.02)
        tax = pre_tax * tax_rat * random.uniform(0.98, 1.02)
        net = pre_tax - tax
        profits.append({
            'cost': cost, 'mgmt': mgmt, 'fin': fin, 'gross': gross,
            'op_profit': op_profit, 'pre_tax': pre_tax, 'tax': tax, 'net': net
        })
    # 生成表格
    data = []
    for idx, item in enumerate(IS_TEMPLATE):
        row = {'item': item}
        for i, period in enumerate(periods):
            v = None
            if item == '一、营业总收入' or item == '其中：营业收入':
                v = round(revenues[i], 2)
            elif item == '二、营业总成本' or item == '其中：营业成本':
                v = round(profits[i]['cost'], 2)
            elif item == '管理费用':
                v = round(profits[i]['mgmt'], 2)
            elif item == '财务费用':
                v = round(profits[i]['fin'], 2)
            elif item == '营业利润':
                v = round(profits[i]['op_profit'], 2)
            elif item == '利润总额':
                v = round(profits[i]['pre_tax'], 2)
            elif item == '所得税费用':
                v = round(profits[i]['tax'], 2)
            elif item == '净利润':
                v = round(profits[i]['net'], 2)
            row[period] = v
        data.append(row)
    return data

def gen_fake_cf(company: str, periods: list):
    p = COMPANY_PROFILE[company]
    n = len(periods)
    # 先用利润表生成净利润
    is_data = gen_fake_is(company, periods)
    net_profits = []
    for row in is_data:
        if row['item'] == '净利润':
            net_profits = [row[period] for period in periods]
            break
    # 经营活动现金流净额 = 净利润*（0.9~1.2）
    op_nets = [np.round(np.float64(net_profits[i]) * random.uniform(0.9, 1.2), 2) for i in range(n)]
    # 投资活动现金流净额 = 资产规模的1%~5%，正负取决于公司类型
    base_asset = 10_000_0000 * random.uniform(0.95, 1.05)
    assets = [base_asset * ((1 + p['asset_growth']) ** i) * random.uniform(0.98, 1.02) for i in range(n)]
    invest_nets = [np.round(assets[i] * random.uniform(-0.05, 0.01) if company != 'beta' else assets[i]*random.uniform(-0.03, 0.03), 2) for i in range(n)]
    # 筹资活动现金流净额 = 资产规模的-2%~+4%，成长型多为正，压力型多为负
    finance_nets = [np.round(assets[i] * random.uniform(-0.02, 0.04) if company == 'beta' else assets[i]*random.uniform(-0.04, 0.01), 2) for i in range(n)]
    # 现金及现金等价物净增加额 = 三项净额之和
    cash_nets = [np.round(op_nets[i] + invest_nets[i] + finance_nets[i], 2) for i in range(n)]
    # 生成表格
    data = []
    for idx, item in enumerate(CF_TEMPLATE):
        row = {'item': item}
        for i, period in enumerate(periods):
            v = None
            if item == '经营活动产生的现金流量净额':
                v = op_nets[i]
            elif item == '投资活动产生的现金流量净额':
                v = invest_nets[i]
            elif item == '筹资活动产生的现金流量净额':
                v = finance_nets[i]
            elif item == '五、现金及现金等价物净增加额':
                v = cash_nets[i]
            row[period] = v
        data.append(row)
    return data

PERIODS = ["2020", "2021", "2022", "2023", "2024", "2025_Q1"]

# 生成静态数据
STATIC_FINANCE_DATA = {}
for company in COMPANY_PROFILE.keys():
    STATIC_FINANCE_DATA[company] = {}
    STATIC_FINANCE_DATA[company]["合并-bs"] = gen_fake_bs(company, PERIODS)
    STATIC_FINANCE_DATA[company]["合并-is"] = gen_fake_is(company, PERIODS)
    STATIC_FINANCE_DATA[company]["合并-cf"] = gen_fake_cf(company, PERIODS)

@router.get("/finance/table")
def get_finance_table(
    sheet: Literal["合并-bs", "合并-is", "合并-cf"] = Query("合并-bs", description="表名"),
    company: str = Query("aura", description="公司ID: aura/beta/crisis"),
    periods: str = Query(None, description="逗号分隔的期间列表，如2020,2021,2022,2023,2024,2025_Q1")
):
    if company not in STATIC_FINANCE_DATA or sheet not in STATIC_FINANCE_DATA[company]:
        return {"error": "不支持的公司或表名"}
    data = STATIC_FINANCE_DATA[company][sheet]
    # 只保留指定期间
    if periods:
        period_list = [p.strip() for p in periods.split(",") if p.strip() in PERIODS]
        result = []
        for row in data:
            filtered = {"item": row["item"]}
            for p in period_list:
                filtered[p] = row.get(p)
            result.append(filtered)
        data = result
    return {"sheet": sheet, "company": company, "data": data}

@router.get('/finance/fake_table')
def get_fake_finance_table(
    sheet: Literal['合并-bs', '合并-is', '合并-cf'] = Query('合并-bs', description='表名'),
    company: str = Query('aura', description='公司ID: aura/beta/crisis'),
    periods: str = Query('2020,2021,2022,2023,2024,2025_Q1', description='逗号分隔的期间列表')
):
    if company not in STATIC_FINANCE_DATA or sheet not in STATIC_FINANCE_DATA[company]:
        raise HTTPException(400, '不支持的公司类型或表名')
    data = STATIC_FINANCE_DATA[company][sheet]
    period_list = [p.strip() for p in periods.split(',') if p.strip() in PERIODS]
    result = []
    for row in data:
        filtered = {"item": row["item"]}
        for p in period_list:
            filtered[p] = row.get(p)
        result.append(filtered)
    return {'sheet': sheet, 'company': company, 'data': result} 