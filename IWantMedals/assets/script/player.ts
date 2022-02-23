
import { _decorator, Component, input, Input, EventKeyboard, EventMouse, EventTouch } from 'cc';
import { retractableHand } from './retractableHand';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = player
 * DateTime = Sat Feb 12 2022 01:09:45 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = player.ts
 * FileBasenameNoExtension = player
 * URL = db://assets/script/player.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('player')
export class player extends Component {

    @property(retractableHand)
    protected retractableHand: retractableHand | null = null;

    public init() {
        this.registerInput();
        this.retractableHand.init();
    }

    public reset() {
        this.unregisterInput();
        this.retractableHand.reset();
    }

    protected registerInput() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.TOUCH_START, this.onKeyDown, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onKeyDown, this);
    }

    protected unregisterInput() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.TOUCH_START, this.onKeyDown, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onKeyDown, this);
    }

    protected onKeyDown(event: EventKeyboard | EventMouse | EventTouch) {
        this.retractableHand.handleInput(event);
    }
}
