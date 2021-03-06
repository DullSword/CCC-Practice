
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

    @property({ group: { name: 'Background' }, type: AudioClip })
    protected backgroundClip: AudioClip | null = null;
    @property({ group: { name: 'Background' } })
    protected backgroundVolume = 1;

    protected audioSource: AudioSource | null = null;

    start() {
        this.audioSource = this.node.addComponent(AudioSource);
        this.audioSource.clip = this.backgroundClip;
        this.audioSource.loop = true;
        this.audioSource.playOnAwake = false;
        this.audioSource.volume = this.backgroundVolume;

        this.audioSource.pause();

        this.audioButton?.on(Button.EventType.CLICK, this.switchAudio, this);
    }

    public playEffect(effectClip: AudioClip) {
        this.audioSource.playOneShot(effectClip, 1);
    }

    public switchAudio() {
        const sprite = this.audioButton.getComponent(Sprite)

        if (this.audioSource.playing) {
            sprite && (sprite.spriteFrame = this.audioOff);
            director.off('playAudioEffect', this.playEffect, this);
            this.audioSource.pause();
        } else {
            sprite && (sprite.spriteFrame = this.audioOn);
            director.on('playAudioEffect', this.playEffect, this);
            this.audioSource.play();
        }
    }
}
