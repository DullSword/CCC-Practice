
import { director } from 'cc';

/**
 * Predefined variables
 * Name = menuData
 * DateTime = Fri Feb 18 2022 23:01:09 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = menuData.ts
 * FileBasenameNoExtension = menuData
 * URL = db://assets/script/menuData.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */


type MenuData = {
    title: string,
    content: string,
    button: {
        text: string,
        clickCallback: Function
    }
}

const startMenuData: MenuData = {
    title: '抓奖牌',
    content: '',
    button: {
        text: '开始游戏',
        clickCallback: () => {
            director.emit('initGame');
        }
    }
}

const endMenuData: MenuData = {
    title: '恭喜你',
    content: '',
    button: {
        text: '重新开始',
        clickCallback: () => {
            director.emit('initGame');
        }
    }
}

export type {
    MenuData
};

export {
    startMenuData,
    endMenuData
};
