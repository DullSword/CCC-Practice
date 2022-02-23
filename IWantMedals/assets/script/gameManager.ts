
import { _decorator, Component, director } from 'cc';
import { UIManager } from './UIManager';
import { itemManager } from './itemManager';
import { player } from './player'
import { audioManager } from './audioManager';
import { startMenuData, endMenuData } from './menuData';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = gameManager
 * DateTime = Sat Feb 12 2022 22:37:10 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = gameManager.ts
 * FileBasenameNoExtension = gameManager
 * URL = db://assets/script/gameManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('gameManager')
export class gameManager extends Component {

    @property
    protected gameTime = 60;

    @property(UIManager)
    protected UIManager: UIManager | null = null;

    @property(itemManager)
    protected itemManager: itemManager | null = null;

    @property(audioManager)
    protected audioManager: audioManager | null = null;

    @property(player)
    protected player: player | null = null;

    protected remainingTime = 0;
    protected score = 0;

    onEnable() {
        director.on('initGame', this.initGame, this);
        director.on('addScore', this.addScore, this);
    }

    onDisable() {
        director.off('initGame', this.initGame, this);
        director.off('addScore', this.addScore, this);
    }

    start() {
        this.UIManager.showMenu('start', startMenuData);
    }

    protected initGame() {
        this.itemManager.spawnItem();

        this.UIManager.hideAllMenu();

        this.player.init();

        this.resetScore();
        this.resetTime();

        this.schedule(this.countdown, 1, this.gameTime - 1);
    }

    protected endGame() {
        this.player.reset();

        endMenuData.content = `获得 ${this.score} 昏`;
        this.UIManager.showMenu('end', endMenuData);

        this.itemManager.cleanItem();
    }

    protected countdown() {
        this.remainingTime--;
        this.UIManager.setTime(this.remainingTime);

        if (this.remainingTime === 0) {
            this.endGame();
            this.unschedule(this.countdown);
        }
    }

    protected resetScore() {
        this.score = 0;
        this.UIManager.setScore(0);
    }

    protected resetTime() {
        this.UIManager.setTime(this.gameTime);
        this.remainingTime = this.gameTime;
    }

    protected addScore(score: number) {
        this.score += score;
        this.UIManager.setScore(this.score);
    }
}
