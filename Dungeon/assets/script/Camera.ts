
import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Camera
 * DateTime = Sat Jan 22 2022 07:52:32 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = Camera.ts
 * FileBasenameNoExtension = Camera
 * URL = db://assets/script/Camera.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('Camera')
export class Camera extends Component {
    @property(Node)
    public player: Node | null = null;

    update(deltaTime: number) {
        if (this.player) {
            let w_pos = new Vec3(Vec3.ZERO);
            let c_pos = new Vec3(Vec3.ZERO);
            this.player.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 1000), w_pos);
            this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(w_pos, c_pos);
            this.node.position = c_pos;
        }
    }
}
