import { Emitter } from '@/ts/base/common';
import { XAttribute } from '@/ts/base/schema';
import {
  DomainTypes,
  emitter,
  getFileSysItemRoot,
  IFileSystemItem,
  IObjectItem,
  ISpeciesItem,
} from '@/ts/core';
/**
 * 仓库控制器
 */
class StoreController extends Emitter {
  private _tabIndex: string = '1';
  private _checkedSpeciesList: ISpeciesItem[] = [];
  public currentKey: string = '';
  private _home: IObjectItem;
  private _root: IFileSystemItem = getFileSysItemRoot();
  constructor() {
    super();
    emitter.subscribePart([DomainTypes.User, DomainTypes.Company], () => {
      this._root = getFileSysItemRoot();
      setTimeout(async () => {
        this._home = await this._root.create('主目录');
        this.changCallback();
      }, 200);
    });
  }
  /** 根目录 */
  public get root(): IFileSystemItem {
    return this._root;
  }
  /** 主目录 */
  public get home(): IObjectItem {
    return this._home;
  }
  /** 页面Tab控制序列 */
  public get tabIndex() {
    return this._tabIndex;
  }
  public setTabIndex(index: string): void {
    this._tabIndex = index;
    this.changCallback();
  }

  public get checkedSpeciesList() {
    return this._checkedSpeciesList;
  }

  public async addCheckedSpeciesList(speciesItems: ISpeciesItem[], spaceId: string) {
    speciesItems = speciesItems.filter((item) => item != undefined);
    let existIds = this._checkedSpeciesList.map((item: any) => item.id);
    let items = speciesItems.filter((item: any) => !existIds.includes(item.id));
    for (let speciesItem of items) {
      let targetAttrs: XAttribute[] =
        (
          await speciesItem.loadAttrs(spaceId, true, true, {
            offset: 0,
            limit: 1000,
            filter: '',
          })
        ).result || [];
      for (let targetAttr of targetAttrs) {
        if (targetAttr.speciesId == speciesItem.id) {
          targetAttr.species = speciesItem.target;
        } else if (existIds.includes(targetAttr.speciesId)) {
          targetAttr.species = this._checkedSpeciesList.filter(
            (item) => item.id == targetAttr.speciesId,
          )[0].target;
        }
      }
      speciesItem.attrs = targetAttrs;
    }
    this._checkedSpeciesList = [...this._checkedSpeciesList, ...items];
    this.changCallback();
  }
}

export default new StoreController();
