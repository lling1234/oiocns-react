import { Button, Card, Descriptions, message, Modal, Typography } from 'antd';
import Layout from 'antd/lib/layout/layout';
import React, { useRef, useState } from 'react';

import userCtrl from '@/ts/controller/setting';
import cls from './index.module.less';
import TeamIcon from '@/bizcomponents/GlobalComps/teamIcon';
import { useHistory } from 'react-router-dom';
import { schema } from '@/ts/base';
import CardOrTable from '@/components/CardOrTableComp';
import { CompanyColumn, PersonColumns } from '../../config/columns';
import SearchCompany from '@/bizcomponents/SearchCompany';
import { TargetType } from '@/ts/core';
import PageCard from '@/components/PageCard';
import { common } from 'typings/common';
import useCtrlUpdate from '@/hooks/useCtrlUpdate';

/**
 * 个人信息
 * @returns
 */
const PersonSetting: React.FC = () => {
  const history = useHistory();
  const parentRef = useRef<any>(null);
  const [key, forceUpdate] = useCtrlUpdate(userCtrl);
  const [tabKey, setTabKey] = useState<string>('friends');
  const [modalType, setModalType] = useState('');
  const [searchCallback, setSearchCallback] = useState<schema.XTarget[]>();
  const handleOk = async () => {
    let success = false;
    if (searchCallback && searchCallback.length > 0) {
      if (searchCallback && searchCallback.length > 0) {
        searchCallback.forEach(async (item) => {
          switch (modalType) {
            case 'company':
              success = await userCtrl.user.applyJoinCompany(
                item.id,
                item.typeName as TargetType,
              );
              break;
            case 'friend':
              success = await userCtrl.user.applyFriend(item);
              break;
          }
        });
      }
    }
    if (success) {
      message.success('操作成功!');
      setModalType('');
    }
  };
  // 标题tabs页
  const TitleItems = [
    {
      tab: `我的好友`,
      key: 'friends',
    },
    {
      tab: `加入的单位`,
      key: 'companys',
    },
  ];
  // 信息内容
  const content = (
    <div className={cls['person-info-info']}>
      <Card bordered={false}>
        <Descriptions
          bordered
          size="middle"
          title={'个人信息'}
          column={2}
          extra={[
            <Button type="link" key="updatePassword">
              修改密码
            </Button>,
          ]}>
          <Descriptions.Item label="昵称">
            <TeamIcon share={userCtrl.user.shareInfo} size={40} preview={true} />
            {userCtrl.user.name}
          </Descriptions.Item>
          <Descriptions.Item label="姓名">{userCtrl.user.teamName}</Descriptions.Item>
          <Descriptions.Item label="账号">
            <Typography.Paragraph copyable>
              {userCtrl.user.target.code}
            </Typography.Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="联系方式">
            {userCtrl.user.target.team?.code}
          </Descriptions.Item>
          <Descriptions.Item label="座右铭">
            {userCtrl.user.target.team?.remark}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
  // 操作内容渲染函数
  const renderOperation = (item: schema.XTarget): common.OperationType[] => {
    return [
      {
        key: 'remove',
        label: tabKey === 'companys' ? '退出' : '移除',
        onClick: async () => {
          if (tabKey === 'companys') {
            await userCtrl.user.quitCompany(item.id);
          } else {
            await userCtrl.user.removeMember(item);
          }
          forceUpdate();
        },
      },
    ];
  };

  return (
    <div className={cls['person-info-container']}>
      <Layout className={cls.container}>{content}</Layout>
      <Layout className={cls.container}>
        <PageCard
          bordered={false}
          tabList={TitleItems}
          onTabChange={(key) => setTabKey(key)}
          tabBarExtraContent={
            <>
              <Button type="link" onClick={() => history.push('/todo/org')}>
                查看申请记录
              </Button>
              <Button type="link" onClick={() => setModalType('friend')}>
                添加好友
              </Button>
              <Button type="link" onClick={() => setModalType('company')}>
                加入单位
              </Button>
            </>
          }>
          <div className={cls['page-content-table']} ref={parentRef}>
            <CardOrTable<schema.XTarget>
              key={key}
              dataSource={[]}
              showChangeBtn={false}
              parentRef={parentRef}
              params={tabKey}
              operation={renderOperation}
              request={async (page) => {
                if (tabKey === 'companys') {
                  const targets = userCtrl.user.joinedCompany?.map((i) => i.target);
                  return {
                    result: targets,
                    limit: page.limit,
                    offset: page.offset,
                    total: targets.length,
                  };
                } else {
                  return await userCtrl.user.loadMembers(page);
                }
              }}
              columns={tabKey === 'companys' ? CompanyColumn : PersonColumns}
              rowKey={'id'}
            />
          </div>
        </PageCard>
        <Modal
          title={modalType === 'company' ? '加入单位' : '添加好友'}
          destroyOnClose={true}
          open={modalType === 'company' || modalType === 'friend'}
          onOk={handleOk}
          onCancel={() => setModalType('')}
          width={670}>
          {' '}
          <div>
            <SearchCompany
              searchCallback={setSearchCallback}
              searchType={
                modalType === 'company' ? TargetType.Company : TargetType.Person
              }
            />
          </div>
        </Modal>
      </Layout>
    </div>
  );
};

export default PersonSetting;
