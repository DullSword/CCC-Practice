
import { _decorator, Component, Node, resources, TiledMapAsset, TiledMap, UITransform, RigidBody2D, ERigidBody2DType, BoxCollider2D, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = MapManager
 * DateTime = Tue Jan 25 2022 02:52:03 GMT+0800 (中国标准时间)
 * Author = DullSword
 * FileBasename = MapManager.ts
 * FileBasenameNoExtension = MapManager
 * URL = db://assets/script/MapManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

const DirectionOffset = {
    top: { row: -1, column: 0 },
    down: { row: 1, column: 0 },
    left: { row: 0, column: -1 },
    right: { row: 0, column: 1 },
};

const SpreadDirToMask = {
    top: 8,             //1000
    down: 4,            //0100
    left: 2,            //0010
    right: 1            //0001
};

const RSpreadDirToMask = {
    top: SpreadDirToMask.down,
    down: SpreadDirToMask.top,
    left: SpreadDirToMask.right,
    right: SpreadDirToMask.left,
};

const DirectionMaskDigit = 4;
const DirectionAndTypeMaskDigit = 5;

type Location = {
    row: number,
    column: number
};

type Room = {
    row: number,
    column: number
};

type NearRooms = {
    top: Room | null,
    down: Room | null,
    left: Room | null,
    right: Room | null
}

type MapsData = string[][];

@ccclass('MapManager')
export class MapManager extends Component {

    @property(Node)
    public loading: Node | null = null;

    @property
    public width = 3;
    @property
    public height = 3;
    @property
    public minRoomSize = 3;

    private _roomSize = 0;
    private _infectedRooms = new Map();

    onLoad() {
        this.loading.active = false;

        this._roomSize = this.width * this.height;
    }

    init() {
        let mapsData = this.spawnRandomMapsData();

        console.log(mapsData);

        this.loadMaps(mapsData);
    }

    spawnRandomMapsData(): MapsData {
        let hostRoomRow = Math.floor(Math.random() * this.height);
        let hostRoomColumn = Math.floor(Math.random() * this.width);
        let hostRoom: Room = { row: hostRoomRow, column: hostRoomColumn };

        this.infect(hostRoom);

        let mapsData: MapsData = [];

        for (let row = 0; row < this.height; row++) {
            if (!mapsData[row]) {
                mapsData[row] = [];
            }
            for (let column = 0; column < this.width; column++) {
                let idx = this.locationToIdx(row, column);
                let spreadMask = this._infectedRooms.get(idx);
                if (spreadMask) {
                    let str = spreadMask.toString(2);
                    mapsData[row][column] = str.padStart(DirectionMaskDigit, '0').padEnd(DirectionAndTypeMaskDigit, '0');
                } else {
                    mapsData[row][column] = '00000';
                }
            }
        }

        return mapsData;
    }

    infect(hostRoom: Room) {
        let queue = [];
        queue.push(hostRoom);

        while (queue.length) {
            const infectedRoom = queue.shift();
            const freshinfectedRooms = this.getFreshinfectedRooms(infectedRoom);

            freshinfectedRooms.forEach(room => queue.push(room));
        }
    }

    getFreshinfectedRooms(hostRoom: Room): Room[] {
        const nearRooms = this.getNearRooms(hostRoom);
        let freshinfectedRooms: Room[] = [];
        let spreadMask = 0;     //0000

        for (let dir in nearRooms) {
            const room = nearRooms[dir];
            const infectProbability = ((this._roomSize - this._infectedRooms.size) / (this._roomSize - this.minRoomSize)) ** 10;

            if (room && Math.random() <= infectProbability) {
                spreadMask |= SpreadDirToMask[dir];

                const idx = this.getRoomIdx(room);
                if (this._infectedRooms.has(idx)) {
                    let _spreadMask = this._infectedRooms.get(idx);
                    _spreadMask |= RSpreadDirToMask[dir];
                    this._infectedRooms.set(idx, _spreadMask);
                } else {
                    this._infectedRooms.set(idx, RSpreadDirToMask[dir]);
                    freshinfectedRooms.push(room);
                }
            }
        }

        const idx = this.getRoomIdx(hostRoom);

        if (this._infectedRooms.has(idx)) {
            let _spreadMask = this._infectedRooms.get(idx);
            _spreadMask |= spreadMask;
            this._infectedRooms.set(idx, _spreadMask);
        } else {
            this._infectedRooms.set(idx, spreadMask);
        }

        return freshinfectedRooms;
    }

    getNearRooms(currentRoom: Room): NearRooms {
        const top = this.getDirectionRoom(currentRoom, DirectionOffset.top);
        const down = this.getDirectionRoom(currentRoom, DirectionOffset.down);
        const left = this.getDirectionRoom(currentRoom, DirectionOffset.left);
        const right = this.getDirectionRoom(currentRoom, DirectionOffset.right);

        let ret: NearRooms = {
            top: null,
            down: null,
            left: null,
            right: null
        };
        this.isRoomValid(top) && (ret.top = top);
        this.isRoomValid(down) && (ret.down = down);
        this.isRoomValid(left) && (ret.left = left);
        this.isRoomValid(right) && (ret.right = right);

        return ret;
    }

    getDirectionRoom(currentRoom: Room, directionOffset: Location): Room {
        const { row: currentRoomRow, column: currentRoomColumn } = currentRoom;
        const { row: offsetRow, column: offsetColumn } = directionOffset;

        return { row: currentRoomRow + offsetRow, column: currentRoomColumn + offsetColumn };
    }

    isRoomValid(room: Room): boolean {
        const { row, column } = room;
        return (row >= 0 && row < this.height && column >= 0 && column < this.width);
    }

    getRoomIdx(room: Room): number {
        const { row, column } = room;
        return this.locationToIdx(row, column);
    }

    locationToIdx(row: number, column: number): number {
        return row * this.width + column;
    }

    loadMaps(mapsData: MapsData) {
        this.loading.active = true;

        let loadCnt = 0;
        let firstMap: { row: number, column: number } | null = null;

        for (let row = 0; row < mapsData.length; row++) {
            for (let column = 0; column < mapsData[row].length; column++) {
                let mapName = mapsData[row][column];

                if (mapName === '00000') continue;

                loadCnt += 1;
                if (!firstMap) {
                    firstMap = { row, column };
                }

                resources.load(`map/${mapName}`, TiledMapAsset, (err, tiledMapAsset) => {
                    let map = new Node(mapName);
                    map.layer = 1;
                    map.setParent(this.node);

                    let tiledMap = map.addComponent(TiledMap);
                    tiledMap.enableCulling = false;
                    tiledMap.tmxAsset = tiledMapAsset;

                    let transformComp = map.getComponent(UITransform);
                    transformComp.setAnchorPoint(0, 0);

                    let y = -(row - firstMap.row) * transformComp.contentSize.y;
                    let x = (column - firstMap.column) * transformComp.contentSize.x;
                    map.setPosition(x, y);

                    this.spawnTiledCollider(tiledMap);

                    if (--loadCnt === 0) {
                        this.loading.active = false;
                    }
                });
            }
        }
    }

    spawnTiledCollider(tilemap: TiledMap) {
        let tileSize = tilemap.getTileSize();
        let mapSize = tilemap.getMapSize();

        let wall = tilemap.getLayer('wall');
        let fog = tilemap.getLayer('fog');

        for (let i = 0; i < mapSize.width; i++) {
            for (let j = 0; j < mapSize.height; j++) {
                let wallTiledTile = wall.getTiledTileAt(i, j, true);
                if (wallTiledTile.grid != 0) {
                    let rigidBody = wallTiledTile.node.addComponent(RigidBody2D);
                    rigidBody.type = ERigidBody2DType.Static;
                    let boxCollider = wallTiledTile.addComponent(BoxCollider2D);
                    boxCollider.group = 1 << 2;
                    boxCollider.size = tileSize;
                    boxCollider.offset = new Vec2(tileSize.width / 2, tileSize.height / 2);
                    boxCollider.apply();
                }

                let fogTiledTile = fog.getTiledTileAt(i, j, true);
                if (fogTiledTile.grid != 0) {
                    let rigidBody = fogTiledTile.node.addComponent(RigidBody2D);
                    rigidBody.type = ERigidBody2DType.Static;
                    let boxCollider = fogTiledTile.addComponent(BoxCollider2D);
                    boxCollider.group = 1 << 3;
                    boxCollider.sensor = true;
                    boxCollider.size = tileSize;
                    boxCollider.offset = new Vec2(tileSize.width / 2, tileSize.height / 2);
                    boxCollider.apply();
                }
            }
        }
    }
}
