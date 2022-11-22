/*
 * @Author: SEN
 * @Date: 2022-11-17 13:30:54
 * @LastEditors: SEN
 * @LastEditTime: 2022-11-22 09:54:00
 * @FilePath: /oiocns-react/src/ts/core/provider.ts
 * @Description: 登录和注册的接口提供层
 */
import { SpaceType } from '@/store/type';
import { kernel, model } from '../base';
import MarketActionTarget from './target/mbase';
import Person from './target/person';
const sessionStorageName = 'sessionPerson';
export default class Provider {
  private static _person: Person | undefined;
  private static _workSpace: SpaceType | undefined;

  /**
   * 当前用户ID
   */
  public static get userId(): string {
    if (this.getPerson) {
      return this.getPerson.target.id;
    }
    throw new Error('未登录');
  }
  /**
   * 当前空间ID
   */
  public static get spaceId(): string {
    if (this.getPerson && this._workSpace && this._workSpace.id) {
      return this._workSpace.id;
    }
    throw new Error('未登录');
  }

  /**
   * 获取当前工作空间
   * @returns 工作当前空间
   */
  public static getWorkSpace(): SpaceType {
    if (this.getPerson && this._workSpace) {
      return this._workSpace;
    } else {
      throw new Error('未登录');
    }
  }

  /**
   * 切换工作空间
   * @param workSpace
   */
  public static setWorkSpace(workSpace: SpaceType) {
    this._workSpace = workSpace;
  }

  /**
   * 是否个人空间
   * @returns
   */
  public static isUserSpace(): boolean {
    return this._workSpace?.id == this._person?.target.id;
  }

  /**
   * 当前用户
   */
  public static get getPerson(): Person | undefined {
    if (this._person === undefined) {
      const sp = sessionStorage.getItem(sessionStorageName);
      if (sp && sp.length > 0) {
        this.setPerson(JSON.parse(sp));
      }
    }
    return this._person;
  }

  /**
   * 设置当前用户
   * @param data 数据
   */
  private static setPerson(data: any) {
    this._person = new Person(data);
    this.setWorkSpace({ id: this._person.target.id, name: '个人空间' });
    sessionStorage.setItem(sessionStorageName, JSON.stringify(data));
  }
  /**
   * 登录
   * @param account 账户
   * @param password 密码
   */
  public static async login(
    account: string,
    password: string,
  ): Promise<model.ResultType<any>> {
    let res = await kernel.login(account, password);
    if (res.success) {
      this.setPerson(res.data.person);
    }
    return res;
  }
  /**
   * 注册用户
   * @param name 姓名
   * @param motto 座右铭
   * @param phone 电话
   * @param account 账户
   * @param password 密码
   * @param nickName 昵称
   */
  public static async register(
    name: string,
    motto: string,
    phone: string,
    account: string,
    password: string,
    nickName: string,
  ): Promise<model.ResultType<any>> {
    let res = await kernel.register(name, motto, phone, account, password, nickName);
    if (res.success) {
      this.setPerson(res.data.person);
    }
    return res;
  }
}
