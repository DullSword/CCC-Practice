
import { _decorator, Component, Sprite, resources, SpriteFrame, Label, input, Input, __private, EventKeyboard, KeyCode, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = DialogManager
 * DateTime = Sat Jan 22 2022 04:35:16 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = DialogManager.ts
 * FileBasenameNoExtension = DialogManager
 * URL = db://assets/script/DialogManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

enum Role {
    BRAVEMAN,
    DEMONKING
}

const RoleInfoMap = {
    [Role.BRAVEMAN]: {
        name: "勇者",
        avatarUrl: "role/braveman"
    },
    [Role.DEMONKING]: {
        name: "魔王",
        avatarUrl: "role/demonking"
    }
}

type DialogInfo = {
    role: number,
    content: string
}

@ccclass('DialogManager')
export class DialogManager extends Component {

    @property(Sprite)
    public avatar: Sprite | null = null;

    @property(Label)
    public roleName: Label | null = null;

    @property(Label)
    public content: Label | null = null;

    @property({ type: CCFloat, min: 0.1 })
    public wordSpeed = 0.5;

    private _dialogData: DialogInfo[] = [];
    private _dialogIndex = -1;

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this.nextTextData();
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    init(data: DialogInfo[]) {
        this._dialogData = data;
        this.node.active = true;
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode == KeyCode.SPACE) {
            this.nextTextData();
        }
    }

    nextTextData() {
        if (++this._dialogIndex < this._dialogData.length) {
            this.changeDialog(this._dialogData[this._dialogIndex]);
        } else {
            this.closeDialog();
        }
    }

    changeDialog(data: { role?: number, content?: string }) {
        let { name, avatarUrl } = RoleInfoMap[data.role];

        resources.load(`${avatarUrl}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
            this.avatar.spriteFrame = spriteFrame;
        });

        this.roleName.string = name;

        let words = data.content.split('');
        let setText = () => {
            if (words.length > 0) {
                this.content.string += words.shift();
                // log(`left word: ${words.join('')}`);
            } else {
                // log("unschedule");
                this.unschedule(setText);
            }
        };
        this.unscheduleAllCallbacks();
        this.content.string = "";
        this.schedule(setText, this.wordSpeed, data.content.length);
    }

    closeDialog() {
        this.node.active = false;
    }
}
