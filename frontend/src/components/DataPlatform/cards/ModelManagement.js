import React from 'react';
import { Card, List, Tag, Space, Button, Typography } from 'antd';
import { AreaChartOutlined, CheckCircleOutlined, SyncOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ModelManagement = ({ data, loading }) => {
  return (
    <Card title={<><AreaChartOutlined /> 模型管理</>} loading={loading}>
      <List
        dataSource={data}
        renderItem={item => (
          <List.Item
            key={item.id}
            extra={
              <Button type="link" size="small">
                详情 <RightOutlined />
              </Button>
            }
          >
            <List.Item.Meta
              title={<Space>{item.name} <Tag color={item.status === 'deployed' ? 'green' : 'processing'}>
                {item.status === 'deployed' ? <CheckCircleOutlined /> : <SyncOutlined spin />}
                {item.status === 'deployed' ? ' 已部署' : ' 训练中'}
              </Tag></Space>}
              description={
                <Space direction="vertical" size={0}>
                  <Text>类型: {item.type}</Text>
                  <Text>版本: {item.version}</Text>
                  <Text>准确率: {item.accuracy}%</Text>
                </Space>
              }
            />
          </List.Item>
        )}
        size="small"
      />
    </Card>
  );
};

export default ModelManagement; 