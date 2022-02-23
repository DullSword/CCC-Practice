
import { _decorator, Component, Node, Prefab, instantiate, Label } from 'cc';
import { MenuData } from './menuData'
import { menu } from './menu';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = UIManager
 * DateTime = Sun Feb 13 2022 23:02:35 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = UIManager.ts
 * FileBasenameNoExtension = UIManager
 * URL = db://assets/script/UIManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('UIManager')
export class UIManager extends Component {

    @property(Label)
    protected time: Label | null = null;

    @property(Label)
    protected score: Label | null = null

    @property(Prefab)
    protected menuTemplate: Prefab | null = null;

    protected instantiatedMenuMap: Map<String, Node> = new Map();

    public showMenu(menuName: String, menuData: MenuData) {
        if (this.instantiatedMenuMap.has(menuName)) {
            const menuNode = this.instantiatedMenuMap.get(menuName);
            menuNode.active = true;
            menuNode.getComponent(menu).init(menuData);
        } else {
            const menuNode = instantiate(this.menuTemplate);
            this.instantiatedMenuMap.set(menuName, menuNode);
            menuNode.setParent(this.node);
            menuNode.getComponent(menu).init(menuData);
        }
    }

    public hideAllMenu() {
        this.instantiatedMenuMap.forEach((value) => {
            value.active = false;
        })
    }

    public setTime(time: number) {
        this.time.string = time.toString();
    }

    public setScore(score: number) {
        this.score.string = score.toString();
    }
}
