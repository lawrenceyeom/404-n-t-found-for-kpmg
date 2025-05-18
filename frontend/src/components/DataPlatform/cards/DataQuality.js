import React from 'react';
import { Card, Table, Tag, Space, Typography } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const DataQuality = ({ data, loading }) => {
  const columns = [
    {
      title: '数据源',
      dataIndex: 'source',
      key: 'source',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '完整性',
      dataIndex: 'completeness',
      key: 'completeness',
      render: (score) => (
        <Tag color={score >= 90 ? 'green' : score >= 70 ? 'orange' : 'red'}>
          {score}%
        </Tag>
      ),
    },
    {
      title: '准确性',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (score) => (
        <Tag color={score >= 90 ? 'green' : score >= 70 ? 'orange' : 'red'}>
          {score}%
        </Tag>
      ),
    },
    {
      title: '一致性',
      dataIndex: 'consistency',
      key: 'consistency',
      render: (score) => (
        <Tag color={score >= 90 ? 'green' : score >= 70 ? 'orange' : 'red'}>
          {score}%
        </Tag>
      ),
    },
    {
      title: '及时性',
      dataIndex: 'timeliness',
      key: 'timeliness',
      render: (score) => (
        <Tag color={score >= 90 ? 'green' : score >= 70 ? 'orange' : 'red'}>
          {score}%
        </Tag>
      ),
    }
  ];

  return (
    <Card title={<><SafetyOutlined /> 数据质量</>} loading={loading}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="source"
        size="small"
        pagination={false}
      />
    </Card>
  );
};

export default DataQuality; 