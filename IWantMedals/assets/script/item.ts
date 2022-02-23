
import { _decorator, Component, Sprite, UITransform, BoxCollider2D, Size, SpriteFrame, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = item
 * DateTime = Sun Feb 13 2022 02:04:53 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = item.ts
 * FileBasenameNoExtension = item
 * URL = db://assets/script/item.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

type itemData = {
    name: string,
    spriteFrame: SpriteFrame,
    capturedClip: AudioClip,
    width: number,
    height: number,
    score: number,
    speedDecrement: number
}

@ccclass('item')
export class item extends Component {

    public capturedClip: AudioClip | null = null;
    public score = 0;
    public speedDecrement = 0;

    public init(itemData: itemData) {
        const { name, spriteFrame, capturedClip, width, height, score, speedDecrement } = itemData;

        this.capturedClip = capturedClip;
        this.score = score;
        this.speedDecrement = speedDecrement;

        this.node.layer = 1 << 25;                                           //UI_2D
        this.node.addComponent(Sprite).spriteFrame = spriteFrame;
        this.node.getComponent(UITransform).setContentSize(width, height);   //添加Sprite自动会添加UITransform
        const collider = this.node.addComponent(BoxCollider2D);
        collider.group = 1 << 2;                                             //ITEM
        collider.sensor = true;
        collider.size = new Size(width, height);
    }
}
