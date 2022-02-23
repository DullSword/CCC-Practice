
import { _decorator, Component, Node, UITransform, SpriteFrame, AudioClip } from 'cc';
import { item } from './item';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = itemManager
 * DateTime = Tue Feb 15 2022 22:56:40 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = itemManager.ts
 * FileBasenameNoExtension = itemManager
 * URL = db://assets/script/itemManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

type MaxLimit = {
    maxLimitX: number,
    maxLimitY: number
}

type ItemMaxSize = {
    itemMaxWidth: number,
    itemMaxHeight: number
}

type Point = {
    x: number,
    y: number
}

@ccclass("Item")
class Item {
    @property
    public name = '';

    @property(SpriteFrame)
    public spriteFrame: SpriteFrame | null = null;

    @property(AudioClip)
    public capturedClip: AudioClip | null = null;

    @property
    public width = 0;

    @property
    public height = 0;

    @property
    public score = 0;

    @property
    public weight = 0;

    @property
    public speedDecrement = 0;
}

@ccclass('itemManager')
export class itemManager extends Component {

    @property({ group: { name: 'Spawn', id: '1' }, slide: true })
    protected spawnPercent = 0;
    @property({ group: { name: 'Spawn', id: '1' } })
    protected spawnRowSpace = 0;
    @property({ group: { name: 'Spawn', id: '1' } })
    protected spawnColumnSpace = 0;

    @property({ group: { name: 'Item', id: '2' }, type: [Item] })
    protected items: Item[] = [];

    protected maxLimitX = 0;
    protected maxLimitY = 0;
    protected itemMaxWidth = 0;
    protected itemMaxHeight = 0;
    protected totalWeight = 0;

    start() {
        const { maxLimitX, maxLimitY } = this.getMaxLimit();
        this.maxLimitX = maxLimitX;
        this.maxLimitY = maxLimitY;

        const { itemMaxWidth, itemMaxHeight } = this.getItemMaxSize();
        this.itemMaxWidth = itemMaxWidth;
        this.itemMaxHeight = itemMaxHeight;

        for (const item of this.items) {
            this.totalWeight += item.weight;
        }
    }

    protected getMaxLimit(): MaxLimit {
        const transform = this.node?.getComponent(UITransform);  //锚点为(0,0)
        const maxLimitX = transform?.contentSize?.width ?? 0;
        const maxLimitY = transform?.contentSize?.height ?? 0;

        console.log("maxLimitX:", maxLimitX);
        console.log("maxLimitY:", maxLimitY);

        return { maxLimitX, maxLimitY }
    }

    protected getItemMaxSize(): ItemMaxSize {
        let itemMaxWidth = 0;
        let itemMaxHeight = 0;
        for (const item of this.items) {
            const width = item.width;
            const height = item.height;
            if (width > itemMaxWidth) {
                itemMaxWidth = width;
            }
            if (height > itemMaxHeight) {
                itemMaxHeight = height;
            }
        }

        console.log("itemMaxWidth:", itemMaxWidth);
        console.log("itemMaxHeight:", itemMaxHeight);

        return { itemMaxWidth, itemMaxHeight };
    }

    public spawnItem() {
        if (this.itemMaxWidth === 0 || this.itemMaxHeight === 0) {
            console.log("item size abnormal");
            return;
        }

        let points = this.generatePoints();
        const handledPoints = this.handlePoints(points);
        console.log("handledPoints:", handledPoints);

        for (const point of handledPoints) {
            const itemIdx = this.chooseItemIdxByWeight();
            const { name, spriteFrame, capturedClip, width, height, score, speedDecrement } = this.items[itemIdx];

            const itemNode = new Node(name);
            itemNode.addComponent(item).init({ name, spriteFrame, capturedClip, width, height, score, speedDecrement });

            itemNode.setParent(this.node);

            const { x, y } = this.shakeItemCenter(point, itemNode);
            itemNode.setPosition(x, y);
        }
    }

    public cleanItem() {
        this.node.removeAllChildren();
    }

    protected generatePoints(): Point[] {
        const containerWidth = this.itemMaxHeight + this.spawnRowSpace * 2;
        const containerHeight = this.itemMaxWidth + this.spawnColumnSpace * 2;
        const rowCount = Math.floor(this.maxLimitY / containerWidth);
        const columnCount = Math.floor(this.maxLimitX / containerHeight);

        let points: Point[] = [];

        for (let row = 0; row < rowCount; row++) {
            for (let column = 0; column < columnCount; column++) {
                const x = column * containerWidth + containerWidth / 2;
                const y = row * containerHeight + containerHeight / 2;
                points.push({ x, y });
            }
        }

        return points;
    }

    protected handlePoints(points: Point[]): Point[] {
        this.shufflePoints(points);

        const slicedPoints = this.slicePoints(points);

        return slicedPoints;
    }

    protected shufflePoints(points: Point[]) {
        let i = points.length;
        while (i) {
            const random = Math.floor(Math.random() * i);
            i--;
            let temp = points[i];
            points[i] = points[random];
            points[random] = temp;
        }
    }

    protected slicePoints(points: Point[]): Point[] {
        const pointCount = points.length;
        const sliceCount = Math.floor(pointCount * Math.min(this.spawnPercent / 100, 1));

        const slicedPoints = points.slice(0, sliceCount);
        return slicedPoints;
    }

    protected chooseItemIdxByWeight(): number {
        let randomValue = Math.random() * this.totalWeight;
        let itemIdx = 0;
        for (let i = 0; i < this.items.length; i++) {
            const weight = this.items[i].weight;
            if ((randomValue -= weight) < 0) {
                itemIdx = i;
                break;
            }
        }
        return itemIdx;
    }

    protected shakeItemCenter(center: Point, item: Node): Point {
        const { x, y } = center;

        const transform = item.getComponent(UITransform);
        const width = transform?.contentSize?.width ?? 0;
        const height = transform?.contentSize?.height ?? 0;

        const offsetXScalar = (this.itemMaxWidth - width) / 2;
        const offsetYScalar = (this.itemMaxHeight - height) / 2;
        const offsetX = Math.floor(Math.random() * (offsetXScalar - (-offsetXScalar))) + (-offsetXScalar);   //Math.floor( Math.random() * (m-n) )+n
        const offsetY = Math.floor(Math.random() * (offsetYScalar - (-offsetYScalar))) + (-offsetYScalar);
        const shakedX = x + offsetX;
        const shakedY = y + offsetY;

        return { x: shakedX, y: shakedY };
    }
}
