
import { _decorator, Component, Node, EventKeyboard, KeyCode, Collider2D, Contact2DType, IPhysics2DContact, Vec3, UITransform, director, AudioClip, EventMouse, EventTouch } from 'cc';
import { item } from './item';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = retractableHand
 * DateTime = Sat Feb 12 2022 01:15:48 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = retractableHand.ts
 * FileBasenameNoExtension = retractableHand
 * URL = db://assets/script/retractableHand.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

interface State {
    enter(retractableHand: retractableHand): void;
    handleInput(event: EventKeyboard | EventMouse | EventTouch): State | null;
    update(deltaTime: number): void;
    exit(abnormal?: boolean): void;
}

class RotateState implements State {
    protected retractableHand: retractableHand | null = null;
    protected rotateSpeed = 0;
    protected rotateDirection = 1;

    enter(retractableHand: retractableHand): void {
        this.retractableHand = retractableHand;
        this.rotateSpeed = retractableHand.rotateSpeed;
        this.rotateDirection = retractableHand.rotateDirection;
    }
    handleInput(event: EventKeyboard | EventMouse | EventTouch): State | null {
        if ((event instanceof EventKeyboard && event.keyCode === KeyCode.ARROW_DOWN) || event) {
            return new ExtendState();
        }
        return null;
    }
    update(deltaTime: number): void {
        if (Math.abs(this.retractableHand.node.angle) >= 70) {
            this.rotateDirection *= -1;
            this.retractableHand.node.angle = Math.sign(this.retractableHand.node.angle) * 70;    //避免angle+=speed*deltaTime后仍大于取值范围
        }

        this.retractableHand.node.angle += this.rotateSpeed * this.rotateDirection * deltaTime;
    }
    exit(abnormal?: boolean): void {
        this.retractableHand.rotateDirection = this.rotateDirection;
    }
}

class ExtendState implements State {
    protected retractableHand: retractableHand | null = null;
    protected extendSpeed = 0;
    protected extendMaxLength = 0;

    protected extendLength = 0;

    enter(retractableHand: retractableHand): void {
        this.retractableHand = retractableHand;
        this.extendSpeed = retractableHand.extendSpeed;
        this.extendMaxLength = retractableHand.extendMaxLength;

        director.emit('playAudioEffect', this.retractableHand.extendAudioEffect);
    }
    handleInput(event: EventKeyboard): State | null {
        return null;
    }
    update(deltaTime: number): void {
        const deltaLength = this.extendSpeed * deltaTime;
        const expectedExtendLength = this.extendLength + deltaLength;

        const increments = expectedExtendLength >= this.extendMaxLength ? this.extendMaxLength - this.extendLength : deltaLength;
        this.retractableHand.transform.height += increments;

        this.extendLength += increments;
        if (this.extendLength >= this.extendMaxLength || this.retractableHand.capturedItem) {
            this.retractableHand.changeState(new RetractState());
        }
    }
    exit(abnormal?: boolean): void {

    }
}

class RetractState implements State {
    protected retractableHand: retractableHand | null = null;
    protected retractSpeed = 0;

    protected needRetractLength: number = 0;

    enter(retractableHand: retractableHand): void {
        this.retractableHand = retractableHand;
        this.retractSpeed = retractableHand.retractSpeed;

        this.needRetractLength = retractableHand.transform.height - retractableHand.initialLength;

        if (retractableHand.capturedItem) {
            director.emit('playAudioEffect', this.retractableHand.retractAudioEffect);
        }
    }
    handleInput(event: EventKeyboard): State | null {
        return null;
    }
    update(deltaTime: number): void {
        const speed = this.retractSpeed - (this.retractableHand.capturedItem?.speedDecrement ?? 0);
        const deltaLength = speed * deltaTime;
        const remainingRetractLength = this.needRetractLength - deltaLength;

        const decrements = remainingRetractLength >= 0 ? deltaLength : this.needRetractLength;
        this.retractableHand.transform.height -= decrements;

        this.needRetractLength -= decrements;
        if (this.needRetractLength <= 0) {
            this.retractableHand.changeState(new RotateState());
        }
    }
    exit(abnormal?: boolean): void {
        if (this.retractableHand.capturedItem) {
            if (!abnormal) {
                director.emit('addScore', this.retractableHand.capturedItem.score);
                director.emit('playAudioEffect', this.retractableHand.capturedItem.capturedClip);
            }
            this.retractableHand.capturedItem = null;
            this.retractableHand.hook.removeAllChildren();
        }
    }
}

@ccclass('retractableHand')
export class retractableHand extends Component {

    @property({ group: { name: 'Rotate', id: '1' } })
    public rotateSpeed = 60;

    @property({ group: { name: 'Extend', id: '2' } })
    public extendSpeed = 100;
    @property({ group: { name: 'Extend', id: '2' } })
    public extendMaxLength = 300;
    @property({ group: { name: 'Extend', id: '2' }, type: AudioClip })
    public extendAudioEffect: AudioClip | null = null;

    @property({ group: { name: 'Retract', id: '3' } })
    public retractSpeed = 100;
    @property({ group: { name: 'Retract', id: '3' }, type: AudioClip })
    public retractAudioEffect: AudioClip | null = null;

    @property(Node)
    public hook: Node | null = null;

    public transform: UITransform | null = null;
    public initialLength = 0;
    public rotateDirection = 1;
    public capturedItem: item | null = null;

    protected state: State | null = null;

    start() {
        this.transform = this.node.getComponent(UITransform);
        this.initialLength = this.transform.height;

        this.hook?.getComponent(Collider2D)?.on(Contact2DType.BEGIN_CONTACT, this.captureItem, this);
    }

    update(deltaTime: number) {
        this.state?.update(deltaTime);
    }

    public init() {
        this.node.angle = 0;
        this.transform.height = this.initialLength;
        this.changeState(new RotateState());
    }

    public reset() {
        this.node.angle = 0;
        this.transform.height = this.initialLength;
        this.resetState();
    }

    public handleInput(event: EventKeyboard | EventMouse | EventTouch) {
        const state = this.state.handleInput(event);
        this.changeState(state);
    }

    public changeState(state: State) {
        if (state) {
            if (this.state) {
                this.state.exit();
                this.state = null;
            }

            this.state = state;
            this.state.enter(this);
        }
    }

    protected resetState() {
        this.state.exit(true);
        this.state = null;
    }

    protected captureItem(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        console.log(otherCollider.node.name);

        const itemNode = otherCollider.node;
        itemNode.setParent(this.hook);

        const transform = itemNode.getComponent(UITransform);
        const offsetY = -transform?.contentSize.height / 2 ?? 0;
        itemNode.position = new Vec3(0, offsetY, 0);

        this.capturedItem = itemNode.getComponent(item);
    }
}
