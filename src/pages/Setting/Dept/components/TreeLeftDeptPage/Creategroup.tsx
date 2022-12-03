import { Button, Modal } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import React, { useState, useEffect } from 'react';

import cls from './index.module.less';
import MarketClassifyTree from '@/components/CustomTreeComp';
import userCtrl from '@/ts/controller/setting/userCtrl';
import { schema } from '@/ts/base';
import SettingService from '../../service';
import { IDepartment } from '@/ts/core/target/itarget';
import { getUuid } from '@/utils/tools';

const x = 3;
const y = 2;
const z = 1;
const defaultData: DataNode[] = [];

const generateData = (_level: number, _preKey?: React.Key, _tns?: DataNode[]) => {
  const preKey = _preKey || '0';
  const tns = _tns || defaultData;

  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);

const dataList: { key: React.Key; title: string }[] = [];
const generateList = (data: DataNode[]) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { key } = node;
    dataList.push({ key, title: key as string });
    if (node.children) {
      generateList(node.children);
    }
  }
};
generateList(defaultData);

type CreateGroupPropsType = {
  createTitle: string;
  currentKey: string;
  setCurrent: (current: schema.XTarget) => void;
  handleMenuClick: (key: string, item: any) => void; // 点击操作触发的事件
};

const Creategroup: React.FC<CreateGroupPropsType> = ({
  createTitle,
  handleMenuClick,
  setCurrent,
}) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const setting = SettingService.getInstance();

  useEffect(() => {
    if (userCtrl.Space && userCtrl.Space == undefined) {
      Modal.info({
        title: '提示',
        content: (
          <div>
            <p>请选择加入的部门空间！</p>
          </div>
        ),
        onOk() {
          location.href = '/home';
        },
      });
    }

    initData();
    // 控制选中的部门ID。
    setting.setCompanyID = userCtrl?.Space?.target.id + '';
    const id = userCtrl.subscribe(() => {
      initData();
      setting.getCompanyCtrl.changCallback();
    });
    return () => {
      userCtrl.unsubscribe(id);
    };
  }, ['', userCtrl.Space]);

  const initData = async () => {
    const data = await userCtrl?.Space?.getDepartments();
    if (data?.length) {
      const tree = data.map((n) => {
        return createTeeDom(n);
      });
      setTreeData(tree);
    }
  };
  const createTeeDom = (n: IDepartment) => {
    const { target } = n;
    return {
      key: target.id + getUuid(),
      title: target.name,
      icon: target.avatar,
      // children: [],
      isLeaf: false,
      target: n,
    };
  };
  const updateTreeData = (list: any[], key: React.Key, children: any[]): any[] =>
    list.map((node) => {
      if (node.key === key) {
        return {
          ...node,
          children,
          isLeaf: children.length == 0,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });

  const loadDept = async ({ key, children, target }: any) => {
    if (children) {
      return;
    }
    const deptChild = await setting.getDepartments(target.target.id);
    // await target.getDepartments(); 不从缓存里面取，查询底下的部门
    setTreeData((origin) =>
      updateTreeData(
        origin,
        key,
        deptChild.map((n) => createTeeDom(n)),
      ),
    );
  };

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info: any) => {
    console.log('选中树节点', selectedKeys);
    if (info.selected) {
      setCurrent(info.node.target.target);
      setting.setCurrTreeDeptNode(info.node.target.target.id);
    }
  };

  const menu = ['新增部门'];

  return (
    <div>
      <div className={cls.topMes}>
        <Button
          className={cls.creatgroup}
          type="primary"
          onClick={() => handleMenuClick('新增部门', {})}>
          {createTitle}
        </Button>
        <MarketClassifyTree
          // key={selectMenu}
          // isDirectoryTree
          showIcon
          searchable
          // handleTitleClick={handleTitleClick}
          handleMenuClick={handleMenuClick}
          treeData={treeData}
          title={'内设集团'}
          menu={menu}
          loadData={loadDept}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
};

export default Creategroup;
