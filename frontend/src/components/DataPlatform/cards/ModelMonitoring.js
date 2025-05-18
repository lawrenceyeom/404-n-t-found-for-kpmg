import React from 'react';
import { Card, List, Tag, Space, Progress, Typography } from 'antd';
import { MonitorOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ModelMonitoring = ({ data, loading }) => {
  return (
    <Card title={<><MonitorOutlined /> 模型监控</>} loading={loading}>
      <List
        dataSource={data}
        renderItem={item => (
          <List.Item key={item.id}>
            <List.Item.Meta
              title={<Space>{item.name} 
                <Tag color={item.health >= 90 ? 'green' : item.health >= 70 ? 'orange' : 'red'}>
                  {item.health >= 90 ? <CheckCircleOutlined /> : <WarningOutlined />}
                  {item.health >= 90 ? ' 健康' : item.health >= 70 ? ' 警告' : ' 异常'}
                </Tag>
              </Space>}
              description={
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                  <Text>模型健康度:</Text>
                  <Progress 
                    percent={item.health} 
                    strokeColor={item.health >= 90 ? '#52c41a' : item.health >= 70 ? '#faad14' : '#f5222d'}
                    size="small"
                  />
                  <Text>精确率: {item.precision}% | 召回率: {item.recall}%</Text>
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

export default ModelMonitoring; 