import React from 'react';
import { Card, Table, Tag, Space, Typography } from 'antd';
import { DatabaseOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const DataSources = ({ data, loading }) => {
  const columns = [
    {
      title: '数据源名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'connected' ? 'green' : 'orange'}>
          {status === 'connected' ? <CheckCircleOutlined /> : <SyncOutlined spin />}
          {status === 'connected' ? ' 已连接' : ' 配置中'}
        </Tag>
      ),
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
    },
    {
      title: '记录数',
      dataIndex: 'recordCount',
      key: 'recordCount',
      render: (count) => count.toLocaleString(),
    }
  ];

  return (
    <Card title={<><DatabaseOutlined /> 数据源管理</>} loading={loading}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        size="small"
        pagination={false}
      />
    </Card>
  );
};

export default DataSources; 