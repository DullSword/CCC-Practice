
import { _decorator, Component } from 'cc';
import { MapManager } from './MapManager';
import { DialogManager } from './DialogManager';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = GameManager
 * DateTime = Fri Jan 21 2022 18:08:30 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = GameManager.ts
 * FileBasenameNoExtension = GameManager
 * URL = db://assets/Script/GameManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('GameManager')
export class GameManager extends Component {

    @property(MapManager)
    public mapManager: MapManager | null = null;

    @property(DialogManager)
    public dialogManager: DialogManager | null = null;

    start() {
        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape;

        this.mapManager.init();

        // this.dialogManager.init(
        //     [
        //         {
        //             role: 0,
        //             content: "我是勇者！"
        //         },
        //         {
        //             role: 1,
        //             content: "我是魔王！"
        //         }
        //     ]
        // );
    }
}