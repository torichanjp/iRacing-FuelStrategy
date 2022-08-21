import Lap from '../lap'

type DriverAverage = {
    [driverId: number]: {sum: number, num: number}
}

type ObjNumberNumber = {
    [key: number]: number
}

type LapsFilterFunc = (laps: Lap) => boolean

export default class Driver {
    rawLaps: Lap[]

    constructor(laps: Lap[]) {
        this.rawLaps = laps
    }

    /**
     * 有効なラップの平均(sec)をドライバー毎に返す
     */
    public AverageAllByDriver (): ObjNumberNumber {
        return this.AverageByDriver(l => l.lapTimeResult > 0)
    }

    /**
     * ピットイン・アウト以外の有効なラップの平均(sec)をドライバー毎に返す
     */
    public AverageWithoutPit (): ObjNumberNumber {
        return this.AverageByDriver(l => l.lapTimeResult > 0 && !l.pitIn && !l.pitOut)
    }

    /**
     * 有効なラップの平均(sec)をドライバー毎に返す
     */
    public AverageByDriver (filterFunc: LapsFilterFunc): ObjNumberNumber  {
        // 有効タイム(>0)を抽出して平均を計算する
        // @ts-ignore
        const laps = this.rawLaps.filter(filterFunc)

        // ドライバー毎にタイム合計を求める
        const startSum: DriverAverage = {}
        const lapsSum = laps.reduce((acc: DriverAverage, lap: Lap) => {
            if (acc[lap.driverId]) {
                acc[lap.driverId].sum += lap.lapTimeResult
                acc[lap.driverId].num ++
            } else {
                acc[lap.driverId] = {sum: lap.lapTimeResult, num: 1}
            }
            return acc
        }, startSum)

        // ドライバー毎に平均を求める
        const startAvg: ObjNumberNumber = {}
        return Object.keys(lapsSum).reduce((acc: ObjNumberNumber, key: string) => {
            const _key = parseInt(key)
            acc[_key] = lapsSum[_key].sum / lapsSum[_key].num
            return acc
        }, startAvg)
    }
}
