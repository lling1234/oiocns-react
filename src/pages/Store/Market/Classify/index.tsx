import {
  AppstoreFilled,
  DatabaseFilled,
  FileTextFilled,
  FundFilled,
} from '@ant-design/icons';
import { Menu, Button, Row, Col } from 'antd';
import React, { useEffect, useState } from 'react';
import cls from './index.module.less';
import MarketClassifyTree from '@/components/CustomTreeComp';
import StoreSiderbar from '@/ts/controller/store/sidebar';
import StoreContent from '@/ts/controller/store/content';
import NewStoreModal from '@/components/NewStoreModal';
import DeleteCustomModal from '@/components/DeleteCustomModal';
import DetailDrawer from './DetailDrawer';
import JoinOtherShop from './JoinOtherShop';
import marketCtrl from '@/ts/controller/store/marketCtrl';
import userCtrl from '@/ts/controller/setting/userCtrl';

const MarketClassify: React.FC<any> = ({ history }) => {
  const Person = userCtrl.User;
  const [list, setList] = useState<any[]>([]);
  const [deleOrQuit, setDeleOrQuit] = useState<'delete' | 'quit'>('delete');
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false); // 创建商店
  const [isJoinShop, setIsJoinShop] = useState<boolean>(false); // 加入商店
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false); // 删除商店
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false); // 基础详情
  const [treeDataObj, setTreeDataObj] = useState<any>({}); // 被选中的树节点
  const [dataSource, setDataSource] = useState<any>([]); // table数据

  /**
   * @description: 创建商店
   * @param {any} formData
   * @return {*}
   */
  const onOk = (formData: any) => {
    marketCtrl.Market.createMarket({ ...formData });
    setIsAddOpen(false);
  };

  /**
   * @description: 加入商店
   * @return {*}
   */
  const onJoinOk = async (val: any) => {
    setIsJoinShop(false);
    setDataSource([]);
    const res = await Person?.applyJoinMarket(val[0]?.id);
    console.log('申请加入商店成功', res);
  };

  /**
   * @description: 加入商店搜索回调
   * @param {any} val
   * @return {*}
   */
  const onChange = async (val: any) => {
    const res = await marketCtrl.Market.getMarketByCode(val.target.value);
    if (res?.success) {
      setDataSource(res.data.result);
    }
  };

  /**
   * @description: 删除 / 退出商店确认
   * @return {*}
   */
  const onDeleteOrQuitOk = () => {
    setIsDeleteOpen(false);
    {
      deleOrQuit === 'delete'
        ? marketCtrl.Market.deleteMarket(treeDataObj?.id)
        : marketCtrl.Market.quitMarket(treeDataObj?.id);
    }
  };

  /**
   * @description: 取消的回调
   * @return {*}
   */
  const onCancel = () => {
    setIsAddOpen(false);
    setIsDeleteOpen(false);
    setIsJoinShop(false);
    setDataSource([]);
  };

  const onClose = () => {
    setIsDetailOpen(false);
  };

  useEffect(() => {
    marketCtrl.Market.getJoinMarkets(false).then((res) => {
      let arr: any = res.map((itemModel: any, index: any) => {
        const item = itemModel.market;
        let arrs = ['基础详情', '用户管理'];
        arrs.push(`${item.belongId === Person.target.id ? '删除商店' : '退出商店'}`);
        return {
          title: item.name,
          key: `0-${index}`,
          id: item.id,
          node: itemModel,
          children: [],
          belongId: item.belongId,
          menus: arrs,
        };
      });
      setList(arr);
    });
  }, []);

  useEffect(() => {
    StoreSiderbar.curPageType = 'market';
    StoreSiderbar.getTreeData();
    return () => {
      return StoreSiderbar.unsubscribe('marketTreeData');
    };
  }, []);

  const [selectMenu, setSelectMenu] = useState<string>('');
  const items = [
    {
      label: '开放市场',
      key: 'openMarket',
      icon: <AppstoreFilled />,
      children: [
        {
          label: '应用市场',
          key: '/market/shop',
          icon: <AppstoreFilled />,
        }, // 菜单项务必填写 key
        {
          label: '文档共享库',
          key: '/market/docx',
          icon: <FileTextFilled />,
        },
        { label: '数据市场', key: '/market/data', icon: <FundFilled /> },
        { label: '公益仓', key: '/market/publicProperty', icon: <DatabaseFilled /> },
      ],
    },
  ];

  const handleChange = (path: string) => {
    console.log('是是是', path);
    if (path === '/market/shop') {
      StoreContent.changeMenu('market');
    }
    setSelectMenu(path);
    history.push(path);
  };

  /**
   * @description: 树表头展示
   * @return {*}
   */
  const ClickBtn = (
    <>
      <Row>
        <Col>商店分类</Col>
      </Row>
      <Button
        type="link"
        onClick={() => {
          setIsAddOpen(true);
        }}>
        创建商店
      </Button>
      <Button
        type="link"
        onClick={() => {
          setIsJoinShop(true);
        }}>
        加入商店
      </Button>
    </>
  );

  /*******
   * @desc: 点击目录 触发事件
   * @param {any} item
   * @return {*}
   */
  const handleTitleClick = (item: any) => {
    // 触发内容去变化
    StoreContent.changeMenu(item);
  };

  /**
   * @description: 删除商店弹窗
   * @param {any} item
   * @return {*}
   */
  const handleDeleteShop = (item?: any) => {
    setIsDeleteOpen(true);
    setDeleOrQuit('delete');
    setTreeDataObj(item);
  };

  /**
   * @description: 退出商店弹窗
   * @param {any} item
   * @return {*}
   */
  const handleQuitShop = (item?: any) => {
    setIsDeleteOpen(true);
    setDeleOrQuit('quit');
    setTreeDataObj(item);
  };

  /**
   * @description: 目录更多操作 触发事件
   * @param {string} key
   * @param {any} node
   * @return {*}
   */
  const handleMenuClick = (key: string, node: any) => {
    console.log('handleMenuClick55', key, node);
    switch (key) {
      case '删除商店':
        handleDeleteShop(node);
        break;
      case '退出商店':
        handleQuitShop(node);
        break;
      case '基础详情':
        setIsDetailOpen(true);
        setTreeDataObj(node);
        break;
      case '用户管理':
        history.push('/market/usermanagement');
        marketCtrl.setCurrentMarket(node?.node);
        // StoreSiderbar.handleSelectMarket(node?.node);
        break;
      default:
        break;
    }
  };

  return (
    <div className={cls.container}>
      <div className={cls.subTitle}>常用分类</div>
      <Menu
        mode="inline"
        items={items}
        defaultOpenKeys={['openMarket']}
        onClick={({ key }) => handleChange(key)}
      />
      <MarketClassifyTree
        key={selectMenu}
        handleTitleClick={handleTitleClick}
        handleMenuClick={handleMenuClick}
        treeData={list}
        menu={'menus'}
        title={ClickBtn}
      />
      <NewStoreModal title="创建商店" open={isAddOpen} onOk={onOk} onCancel={onCancel} />
      <DeleteCustomModal
        title="提示"
        deleOrQuit={deleOrQuit}
        open={isDeleteOpen}
        onOk={onDeleteOrQuitOk}
        onCancel={onCancel}
        content={treeDataObj.title}
      />
      <DetailDrawer
        title={treeDataObj.title}
        nodeDetail={treeDataObj?.node?.market}
        open={isDetailOpen}
        onClose={onClose}
      />
      <JoinOtherShop
        title="搜索商店"
        open={isJoinShop}
        onCancel={onCancel}
        onOk={onJoinOk}
        onChange={onChange}
        dataSource={dataSource || []}
      />
    </div>
  );
};

export default MarketClassify;
