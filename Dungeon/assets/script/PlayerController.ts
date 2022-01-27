
import { _decorator, Component, input, Input, EventKeyboard, KeyCode, Vec3, Animation, RigidBody2D, Vec2, Collider2D, Contact2DType, IPhysics2DContact, TiledTile, CircleCollider2D, TiledLayer, CCString } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = hero
 * DateTime = Thu Jan 20 2022 21:28:56 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = hero.ts
 * FileBasenameNoExtension = hero
 * URL = db://assets/Script/hero.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

enum Direction {
    PLAYER_NONE,
    PLAYER_UP,
    PLAYER_DOWN,
    PLAYER_LEFT,
    PLAYER_RIGHT
}

@ccclass('PlayerController')
export class PlayerController extends Component {

    private _animation: Animation | null = null;
    private _rigidbody: RigidBody2D | null = null;
    private _circleCollider: CircleCollider2D | null = null;

    private _inputCommand: Map<KeyCode, number> = new Map();

    private _direction = Direction.PLAYER_NONE;
    private _position: Vec3 = new Vec3();

    private _animationClipMap: Map<Direction, string> = new Map();

    @property
    public speed = 400;

    @property({ group: { name: 'playerAnimClipName' }, type: CCString })
    public playerUp: '';
    @property({ group: { name: 'playerAnimClipName' }, type: CCString })
    public playerDown: '';
    @property({ group: { name: 'playerAnimClipName' }, type: CCString })
    public playerLeft: '';
    @property({ group: { name: 'playerAnimClipName' }, type: CCString })
    public playerRight: '';

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this.node.getPosition(this._position);
        this._animation = this.node.getComponent(Animation);

        this._rigidbody = this.node.getComponent(RigidBody2D);
        this._circleCollider = this.getComponent(CircleCollider2D);
        this._circleCollider?.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

        this._animationClipMap.set(Direction.PLAYER_UP, this.playerUp);
        this._animationClipMap.set(Direction.PLAYER_DOWN, this.playerDown);
        this._animationClipMap.set(Direction.PLAYER_LEFT, this.playerLeft);
        this._animationClipMap.set(Direction.PLAYER_RIGHT, this.playerRight);
    }

    update(deltaTime: number) {
        let deltaVelocity: Vec2 = new Vec2();
        let direction: Direction = Direction.PLAYER_NONE;

        if (this._inputCommand.get(KeyCode.KEY_W) || this._inputCommand.get(KeyCode.ARROW_UP)) {
            deltaVelocity.y = this.speed * deltaTime;
            direction = Direction.PLAYER_UP;
        } else if (this._inputCommand.get(KeyCode.KEY_S) || this._inputCommand.get(KeyCode.ARROW_DOWN)) {
            deltaVelocity.y = -this.speed * deltaTime;
            direction = Direction.PLAYER_DOWN;
        }

        if (this._inputCommand.get(KeyCode.KEY_A) || this._inputCommand.get(KeyCode.ARROW_LEFT)) {
            deltaVelocity.x = -this.speed * deltaTime;
            direction = Direction.PLAYER_LEFT;
        } else if (this._inputCommand.get(KeyCode.KEY_D) || this._inputCommand.get(KeyCode.ARROW_RIGHT)) {
            deltaVelocity.x = this.speed * deltaTime;
            direction = Direction.PLAYER_RIGHT;
        }

        this._rigidbody.linearVelocity = deltaVelocity;

        this.setDirection(direction);
    }

    setDirection(direction: Direction) {
        if (this._direction == direction) return;

        this._direction = direction;
        this.playAnimation(direction);
    }

    playAnimation(direction: Direction) {
        const clipName = this._animationClipMap.get(direction);
        clipName && this._animation?.play(clipName);
    }

    onKeyDown(event: EventKeyboard) {
        this._inputCommand.set(event.keyCode, 1);
        // console.log(this._inputCommand);
    }

    onKeyUp(event: EventKeyboard) {
        this._inputCommand.set(event.keyCode, 0);
        // console.log(this._inputCommand);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group === (1 << 3)) {
            let node = otherCollider.node;
            this.scheduleOnce(() => {
                node.getComponent(TiledTile).grid = 0;
                node.parent.getComponent(TiledLayer).markForUpdateRenderData(true);
            }, 0);
        }
    }
}
