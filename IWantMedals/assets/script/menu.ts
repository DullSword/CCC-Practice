
import { _decorator, Component, Button, Label } from 'cc';
import { MenuData } from './menuData';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = menu
 * DateTime = Tue Feb 15 2022 20:56:46 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = menu.ts
 * FileBasenameNoExtension = menu
 * URL = db://assets/script/menu.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('menu')
export class menu extends Component {

    @property(Label)
    protected title: Label | null = null;

    @property(Label)
    protected content: Label | null = null;

    @property(Button)
    protected button: Button | null = null;

    public init(menudata: MenuData) {
        const { title, content, button } = menudata;

        this.title && (this.title.string = title);
        this.content && (this.content.string = content);
        if (this.button) {
            this.button.getComponentInChildren(Label).string = button.text;
            this.button.node.on(Button.EventType.CLICK, button.clickCallback);
        }
    }
}
