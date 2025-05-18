import React from 'react';
import { Card, List, Tag, Space, Progress, Typography } from 'antd';
import { OrderedListOutlined, LoadingOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TaskQueue = ({ data, loading }) => {
  return (
    <Card title={<><OrderedListOutlined /> 任务队列</>} loading={loading}>
      <List
        dataSource={data}
        renderItem={item => (
          <List.Item key={item.id}>
            <List.Item.Meta
              title={<Space>{item.name} 
                <Tag color={
                  item.status === 'completed' ? 'green' : 
                  item.status === 'running' ? 'processing' : 
                  item.status === 'pending' ? 'orange' : 'red'
                }>
                  {item.status === 'completed' ? <CheckCircleOutlined /> : 
                   item.status === 'running' ? <LoadingOutlined /> : 
                   item.status === 'pending' ? <ClockCircleOutlined /> : <ClockCircleOutlined />}
                  {item.status === 'completed' ? ' 已完成' : 
                   item.status === 'running' ? ' 运行中' : 
                   item.status === 'pending' ? ' 等待中' : ' 失败'}
                </Tag>
              </Space>}
              description={
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                  <Text>类型: {item.type} | 优先级: {item.priority}</Text>
                  {item.status === 'running' && (
                    <Progress percent={item.progress} size="small" />
                  )}
                  <Text>创建时间: {item.created}</Text>
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

export default TaskQueue; 