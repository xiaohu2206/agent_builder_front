import {
  AppstoreAddOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  DeleteOutlined,
  DislikeOutlined,
  EditOutlined,
  FileSearchOutlined,
  LikeOutlined,
  MenuOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ProductOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import {
  Attachments,
  Bubble,
  Conversations,
  Prompts,
  Sender,
  Welcome,
} from '@ant-design/x';
import { Avatar, Button, Flex, type GetProp, Space, Spin, message } from 'antd';
import React, { useState } from 'react';
import styles from './AgentQA.module.less';
import { useAgentQAWithHistory } from './hooks/useAgentQAWithHistory';

const SENDER_PROMPTS: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    description: '帮我写一段代码',
    icon: <ScheduleOutlined />,
  },
  {
    key: '2',
    description: '解释一个概念',
    icon: <ProductOutlined />,
  },
  {
    key: '3',
    description: '分析问题',
    icon: <FileSearchOutlined />,
  },
  {
    key: '4',
    description: '提供建议',
    icon: <AppstoreAddOutlined />,
  },
];

const AgentQA: React.FC = () => {
  const {
    inputValue,
    isTyping,
    setInputValue,
    handleSendMessage,
    xMessages,
    abortController,
    // 对话历史相关
    conversations,
    currentConversationId,
    handleSwitchConversation,
    handleCreateNewConversation,
    handleDeleteConversation,
    renameConversation,
  } = useAgentQAWithHistory();

  // 状态管理
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);
  const [siderVisible, setSiderVisible] = useState(true); // 新增：侧边栏显示状态
  console.log("xMessages123123", xMessages)
  // 提交处理
  const onSubmit = (val: string) => {
    if (!val) return;

    if (isTyping) {
      message.error('请求正在进行中，请等待请求完成。');
      return;
    }

    setInputValue(val);
    // 延迟执行以确保inputValue已更新
    setTimeout(() => {
      handleSendMessage();
    }, 0);
  };

  // ==================== 组件节点 ====================
  const chatSider = (
    <div className={`${styles.sider} ${!siderVisible ? styles.siderHidden : ''}`}>
      {/* Logo */}
      <div className={styles.siderHeader} >
      <div className={styles.logo}>
        <img
          src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
          draggable={false}
          alt="logo"
          width={24}
          height={24}
        />
        <span>AI智能助手</span>
        
        </div>
        <div 
          className={styles.siderToggleHide}
          onClick={() => setSiderVisible(!siderVisible)}
          title={'隐藏侧边栏'}
        >
          <MenuOutlined />
        </div>
      </div>

      {/* 添加会话 */}
      <Button
        onClick={() => {
          if (isTyping) {
            message.error('消息正在请求中，请等待请求完成或取消后再创建新对话...');
            return;
          }

          handleCreateNewConversation();
        }}
        type="link"
        className={styles.addBtn}
        icon={<PlusOutlined />}
      >
        新建对话
      </Button>

      {/* 会话管理 */}
      <Conversations
        items={conversations}
        className={styles.conversations}
        activeKey={currentConversationId}
        onActiveChange={async (val) => {
          abortController?.abort();
          setTimeout(() => {
            handleSwitchConversation(val);
          }, 100);
        }}
        groupable
        styles={{ item: { padding: '0 8px' } }}
        menu={(conversation) => ({
          items: [
            {
              label: '重命名',
              key: 'rename',
              icon: <EditOutlined />,
              onClick: () => {
                const defaultTitle = typeof conversation.label === 'string' ? conversation.label : '';
                const newTitle = window.prompt('请输入新的对话标题:', defaultTitle || '');
                if (newTitle && newTitle.trim()) {
                  renameConversation(conversation.key, newTitle.trim());
                }
              },
            },
            {
              label: '删除',
              key: 'delete',
              icon: <DeleteOutlined />,
              danger: true,
              onClick: () => {
                handleDeleteConversation(conversation.key);
              },
            },
          ],
        })}
      />

      <div className={styles.siderFooter}>
        <Avatar size={24}>我</Avatar>
        <Button type="text" icon={<QuestionCircleOutlined />} />
      </div>
    </div>
  );

  const chatList = (
    <div className={styles.chatList}>
      {xMessages?.length ? (
        /* 消息列表 */
        <Bubble.List
          items={xMessages?.map((i) => ({
            ...i.message,
            classNames: {
              content: i.status === 'loading' ? styles.loadingMessage : '',
            },
            typing: i.status === 'loading' ? { step: 5, interval: 20, suffix: <>💗</> } : false,
          }))}
          style={{ height: '100%', paddingInline: 'calc(calc(100% - 700px) /2)' }}
          roles={{
            assistant: {
              placement: 'start',
              footer: (
                <div style={{ display: 'flex' }}>
                  <Button type="text" size="small" icon={<ReloadOutlined />} />
                  <Button type="text" size="small" icon={<CopyOutlined />} />
                  <Button type="text" size="small" icon={<LikeOutlined />} />
                  <Button type="text" size="small" icon={<DislikeOutlined />} />
                </div>
              ),
              loadingRender: () => <Spin size="small" />,
            },
            user: { placement: 'end' },
          }}
        />
      ) : (
        <Space
          direction="vertical"
          size={16}
          style={{ paddingInline: 'calc(calc(100% - 700px) /2)' }}
          className={styles.placeholder}
        >
          <Welcome
            variant="borderless"
            icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
            title="您好，我是AI智能助手"
            description="基于先进的AI技术，为您提供智能问答服务，让我们开始对话吧~"
            extra={<></>}
          />
        </Space>
      )}
    </div>
  );

  const senderHeader = (
    <Sender.Header
      title="上传文件"
      open={attachmentsOpen}
      onOpenChange={setAttachmentsOpen}
      styles={{ content: { padding: 0 } }}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={(info) => setAttachedFiles(info.fileList)}
        placeholder={(type) =>
          type === 'drop'
            ? { title: '拖拽文件到此处' }
            : {
                icon: <CloudUploadOutlined />,
                title: '上传文件',
                description: '点击或拖拽文件到此区域上传',
              }
        }
      />
    </Sender.Header>
  );

  const chatSender = (
    <>
      {/* 提示词 */}
      <Prompts
        items={SENDER_PROMPTS}
        onItemClick={(info) => {
          onSubmit(info.data.description as string);
        }}
        styles={{
          item: { padding: '6px 12px' },
        }}
        className={styles.senderPrompt}
      />
      {/* 输入框 */}
      <Sender
        value={inputValue}
        header={senderHeader}
        onSubmit={() => {
          handleSendMessage();
        }}
        onChange={setInputValue}
        onCancel={() => {
          abortController?.abort();
        }}
        prefix={
          <Button
            type="text"
            icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
            onClick={() => setAttachmentsOpen(!attachmentsOpen)}
          />
        }
        loading={isTyping}
        className={styles.sender}
        allowSpeech
        actions={(_, info) => {
          const { SendButton, LoadingButton, SpeechButton } = info.components;
          return (
            <Flex gap={4}>
              <SpeechButton className={styles.speechButton} />
              {isTyping ? <LoadingButton type="default" /> : <SendButton type="primary" />}
            </Flex>
          );
        }}
        placeholder="请输入您的问题或使用 / 调用技能"
      />
    </>
  );

  // ==================== 渲染 =================
  return (
    <div className={styles.layout}>
      {/* 侧边栏切换按钮 */}
      <div 
        className={`${styles.siderToggleShow} ${!siderVisible ? '' : styles.hide}`}
        onClick={() => setSiderVisible(!siderVisible)}
        title={'显示侧边栏'}
      >
        <MenuOutlined />
      </div>
      {chatSider}
      <div className={`${styles.chat} `}>
        {chatList}
        {chatSender}
      </div>
    </div>
  );
};

export default AgentQA;