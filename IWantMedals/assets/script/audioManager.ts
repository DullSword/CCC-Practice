
import { _decorator, Component, Node, AudioClip, AudioSource, director, Button, SpriteFrame, Sprite } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = audioManager
 * DateTime = Wed Feb 16 2022 21:10:36 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = audioManager.ts
 * FileBasenameNoExtension = audioManager
 * URL = db://assets/script/audioManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('audioManager')
export class audioManager extends Component {

    @property(Node)
    protected audioButton: Node | null = null;
    @property(SpriteFrame)
    protected audioOn: SpriteFrame | null = null;
    @property(SpriteFrame)
    protected audioOff: SpriteFrame | null = null;

    @property(AudioClip)
    protected background: AudioClip | null = null;

    protected audioSource: AudioSource | null = null;

    start() {
        this.audioSource = this.node.addComponent(AudioSource);

        this.audioButton?.on(Button.EventType.CLICK, this.switchAudio, this);
        director.on('playAudioEffect', this.playEffect, this);
    }

    public playMusic() {
        this.audioSource.clip = this.background;
        this.audioSource.loop = true;
        this.audioSource.volume = 1;
        this.audioSource.play();
    }

    public playEffect(effectClip: AudioClip) {
        this.audioSource.playOneShot(effectClip, 1);
    }

    protected switchAudio() {
        const sprite = this.audioButton.getComponent(Sprite)

        if (this.audioSource.playing) {
            sprite && (sprite.spriteFrame = this.audioOff);
            director.off('playAudioEffect', this.playEffect, this);
            this.audioSource.stop();
        } else {
            sprite && (sprite.spriteFrame = this.audioOn);
            director.on('playAudioEffect', this.playEffect, this);
            this.audioSource.play();
        }
    }
}
