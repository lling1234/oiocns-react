import React from 'react';
import { Avatar } from 'antd';
import * as im from 'react-icons/im';
import { ISpeciesItem, ITodoGroup, WorkType } from '@/ts/core';
import todoCtrl from '@/ts/controller/todo/todoCtrl';
import thingCtrl from '@/ts/controller/thing';
import { ToTopOutlined } from '@ant-design/icons';
import { MenuItemType } from 'typings/globelType';
import { getUuid } from '@/utils/tools';

export const loadPlatformTodoMenu = async () => {
  let friendTodo = await loadChildren(todoCtrl.FriendTodo);
  let companyTodo = await loadChildren(todoCtrl.CompanyTodo);
  let groupTodo = await loadChildren(todoCtrl.GroupTodo);

  let PublishTodo = await loadChildren(todoCtrl.PublishTodo);
  let MarketTodo = await loadChildren(todoCtrl.MarketTodo);
  return [
    {
      key: WorkType.OrgTodo,
      label: '组织',
      itemType: WorkType.OrgTodo,
      icon: <im.ImTree />,
      children: [
        ...friendTodo.children,
        {
          key: WorkType.CompanyTodo,
          label: '单位',
          itemType: WorkType.CompanyTodo,
          icon: <im.ImTree />,
          ...companyTodo,
        },
        {
          key: WorkType.GroupTodo,
          label: '集团',
          itemType: WorkType.GroupTodo,
          icon: <im.ImTree />,
          ...groupTodo,
        },
      ],
      count: friendTodo.count + companyTodo.count + groupTodo.count,
    },
    {
      key: WorkType.StoreTodo,
      label: '商店',
      itemType: WorkType.StoreTodo,
      icon: <im.ImCart />,
      children: [
        {
          key: WorkType.PublishTodo,
          label: '上架',
          itemType: WorkType.PublishTodo,
          icon: <ToTopOutlined />,
          ...PublishTodo,
        },
        {
          key: WorkType.JoinStoreTodo,
          label: '加入',
          itemType: WorkType.JoinStoreTodo,
          icon: <im.ImBarcode />,
          ...MarketTodo,
        },
      ],
      count: PublishTodo.count + MarketTodo.count,
    },
    {
      children: [],
      key: WorkType.OrderTodo,
      label: '订单',
      itemType: WorkType.OrderTodo,
      item: todoCtrl.OrderTodo,
      count: await todoCtrl.OrderTodo?.getCount(),
      icon: <im.ImBarcode />,
    },
  ];
};

export const loadPlatformApplyMenu = async () => {
  return [
    {
      key: WorkType.OrgApply,
      label: '组织',
      itemType: WorkType.OrgApply,
      icon: <im.ImCart />,
      children: [
        {
          key: WorkType.FriendApply,
          label: '加好友',
          itemType: WorkType.FriendApply,
          icon: <im.ImCart />,
          children: [],
        },
        {
          key: WorkType.CompanyApply,
          label: '加单位',
          itemType: WorkType.CompanyApply,
          icon: <im.ImCart />,
          children: [],
        },
        {
          key: WorkType.GroupApply,
          label: '加集团',
          itemType: WorkType.GroupApply,
          icon: <im.ImCart />,
          children: [],
        },
      ],
    },
    {
      key: WorkType.StoreApply,
      label: '商店',
      itemType: WorkType.StoreApply,
      icon: <im.ImCart />,
      children: [
        {
          key: WorkType.PublishApply,
          label: '上架',
          itemType: WorkType.PublishApply,
          icon: <ToTopOutlined />,
          item: todoCtrl.PublishApply,
          children: [],
        },
        {
          key: WorkType.JoinStoreApply,
          label: '加入',
          itemType: WorkType.JoinStoreApply,
          icon: <im.ImBarcode />,
          item: todoCtrl.MarketApply,
          children: [],
        },
      ],
    },
    {
      key: WorkType.OrderApply,
      label: '订单',
      item: todoCtrl.OrderTodo,
      itemType: WorkType.OrderApply,
      icon: <im.ImCart />,
      children: [],
    },
  ];
};

/** 获取事菜单 */
export const loadThingMenus = async (prefix: string, isWork: boolean = false) => {
  const root = await thingCtrl.loadSpeciesTree();
  if (root) {
    return await buildSpeciesTree(root?.children, prefix + '事', isWork);
  }
  return [];
};

const loadChildren = async (todoGroups: ITodoGroup[]) => {
  let sum = 0;
  let children = [];
  for (const todoGroup of todoGroups) {
    const icon = todoGroup.icon ? (
      <Avatar size={18} src={todoGroup.icon} />
    ) : (
      <im.ImOffice />
    );
    let count = todoGroup.id ? await todoGroup.getCount() : 0;
    children.push({
      icon: icon,
      key: getUuid(),
      label: todoGroup.name,
      itemType: todoGroup.type,
      item: todoGroup,
      count: count,
      children: [],
    });
    sum += count;
  }
  return {
    children: children,
    count: sum,
  };
};

/** 编译分类树 */
const buildSpeciesTree = async (
  species: ISpeciesItem[],
  itemType: string,
  isWork: boolean,
): Promise<MenuItemType[]> => {
  var result: MenuItemType[] = [];
  for (let item of species) {
    result.push({
      key: itemType + item.id,
      item: item,
      label: item.name,
      icon: <im.ImNewspaper />,
      itemType: itemType,
      menuType: isWork ? 'checkbox' : undefined,
      menus: [],
      children: await buildSpeciesTree(item.children, itemType, isWork),
      count:
        itemType.indexOf('todo') > -1
          ? todoCtrl.getWorkTodoBySpeciesId(item.id).length
          : undefined,
    });
  }
  return result;
};
