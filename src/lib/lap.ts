import Parameter from './parameter'
import DateLib from "./date";

export type ParamForLap = {
    lap: number
    lapTime?: number
    fuelConsumption?: number
    tireStint?: number
}

export type AwsRawLap = {
    SubSessionId: number
    CarIdx: string
    TrackId: number
    Lap: string
    LapTime: number
    PitIn: boolean
    PitOut: boolean
    Fuel: number
    RTime: string
    DriverId: number
}

type AwsNormalizedData = {
    lap: number
    remainingTime: number
    beginningOfFuel: number
    endOfFuel: number
    driverId: number
    lapTimeResult: number
    pitIn: boolean
    pitOut: boolean
}

export default class Lap {
    defaultParam: Parameter
    lap: number
    lapTime: number
    lapTimeResult: number
    fuelConsumption: number
    fuelConsumptionResult: number
    remainingTime: number
    fuelLevel: number
    endOfFuel: number
    pitIn: boolean
    pitOut: boolean
    changeTires: boolean
    tireStint: number
    driverId: number

    isPlan: boolean

    /**
     * タイヤ１セットでの走行スティント数
     *
     * 交換直後は、1
     */
    tireStintAcc: number = 1

    constructor(defaultParam: Parameter,
                lap: number,
                lapTime: number,
                fuelConsumption: number,
                remainingTime: number,
                fuelLevel: number,
                endOfFuel: number,
                pitIn: boolean,
                pitOut: boolean,
                changeTires: boolean,
                tireStint: number,
                tireStintAcc: number = 1,
                driverId: number = -1,
                isPlan: boolean = true,
                lapTimeResult: number = -1,
                fuelConsumptionResult: number = -1
    ) {
        this.defaultParam = defaultParam;
        this.lap = lap;
        this.lapTime = lapTime;
        this.fuelConsumption = fuelConsumption;
        this.remainingTime = remainingTime;
        this.fuelLevel = fuelLevel;
        this.endOfFuel = endOfFuel;
        this.pitIn = pitIn;
        this.pitOut = pitOut;
        this.changeTires = changeTires;
        this.tireStint = tireStint
        this.tireStintAcc = tireStintAcc
        this.driverId = driverId
        this.isPlan = isPlan
        this.lapTimeResult = lapTimeResult
        this.fuelConsumptionResult = fuelConsumptionResult
    }

    /**
     * 次のラップの情報を計算し、新規Lapインスタンスとして返す。
     *
     * @param {ParamForLap} paramForLaps? ラップ毎のパラメータ
     */
    public cloneNextLap (paramForLaps?: ParamForLap): Lap | null {
        if (this.remainingTime < 0) {
            return null
        }

        // ラップ毎設定がある場合は上書き
        this.lapTime = paramForLaps?.lapTime ?? this.lapTime
        this.fuelConsumption = paramForLaps?.fuelConsumption ?? this.fuelConsumption
        this.tireStint = paramForLaps?.tireStint ?? this.tireStint

        // 残り燃料計算
        let fuelLevel = this.fuelLevel - this.fuelConsumption
        let pitOut = false
        let tireChange = false
        let tireStintAcc = this.tireStintAcc

        // 燃料は、１周分＋最低燃料が残っている必要あり
        if (fuelLevel < this.fuelConsumption + this.defaultParam.fuelMinKeep) {
            fuelLevel = this.defaultParam.fullFuel
            pitOut = true
            // 規定スティント走っていたらタイヤ交換
            if (this.tireStint <= this.tireStintAcc) {
                tireChange = true
                tireStintAcc = 1
            } else {
                tireStintAcc++
            }
        }
        // フィニッシュラインでの残量
        const endOfFuel = fuelLevel - this.fuelConsumption
        // 残り時間計算
        const basicRemainingTime = this.remainingTime - this.lapTime
        const remainingTime = basicRemainingTime
            - (pitOut ? this.defaultParam.pitThroughTime + this.defaultParam.refillFuelTime : 0)
            - (tireChange ? this.defaultParam.tireReplacementTime : 0)

        return new Lap(
            this.defaultParam,
            this.lap + 1,
            this.lapTime,
            this.fuelConsumption,
            remainingTime,
            fuelLevel,
            endOfFuel,
            false,
            pitOut,
            tireChange,
            this.tireStint,
            tireStintAcc
        )
    }

    /**
     * デフォルトパラメータからラップ配列を作る
     */
    public static makeLapsPlan (param: Parameter, paramForLaps?: ParamForLap[], baseLap?: Lap): Array<Lap> {
        const laps: Array<Lap> = []
        // ラップ毎のパラメータがある場合はそちらを優先する
        const paramForLap = paramForLaps?.find(v => v.lap === 1)
        // １ラップ目を作る
        const firstLap = baseLap ?? new Lap(
            param,
            1,
            paramForLap?.lapTime || param.targetLapTime,
            paramForLap?.fuelConsumption || param.targetFuelConsumption,
            param.raceTime,
            param.fullFuel,
            param.fullFuel - (paramForLap?.fuelConsumption || param.targetFuelConsumption),
            false,
            false,
            false,
            paramForLap?.tireStint || param.tireStint
        )
        laps.push(firstLap)

        let curLap = firstLap
        let i = 0

        while (i++ < 1000) { // 保険で1000周までで抜ける
            const param = paramForLaps?.find(v => v.lap === curLap.lap)
            const lap = curLap.cloneNextLap(param)

            if (lap == null) {
                break;
            }

            // このラップがピットアウトの場合は、前の周（最後の要素）をピットインにする
            const lapLength = laps.length
            if (lapLength > 0 && lap?.pitOut) {
                laps[lapLength - 1].pitIn = true
            }

            laps.push(lap)
            curLap = lap
        }
        return laps
    }

    private static normalizeAwsRowData(laps: AwsRawLap[], fullFuel: number, rTime: number): AwsNormalizedData[] {
        if (laps.length === 0) {
            return []
        }
        // ラップ: {Fuel, LapTime}でマップを作る
        const _laps = laps
            .sort(
            (a, b) =>
                parseInt(a.Lap) - parseInt(b.Lap))
            .reduce((acc: {[key: string]: any}, lap) =>
        {
            const l = parseInt(lap.Lap)
            acc[lap.Lap] = {
                // Fuel、RemainingTimeは、end of lapからbeginning of lapにしたいので1周づつずらす
                lap: l,
                beginningOfFuel: l === 1 ? fullFuel : acc?.[l - 1]?.endOfFuel ?? -1,
                endOfFuel: lap.Fuel,
                driverId: lap?.DriverId ?? -1,
                rTime: DateLib.HMSToSec(lap.RTime),
                remainingTime: l === 1 ? rTime : acc[l - 1]?.rTime ?? -1,
                lapTimeResult: (lap?.LapTime ?? -1) / 1000, // milli秒を秒に変換
                pitIn: lap?.PitIn ?? false,
                pitOut: lap?.PitOut ?? false
            }
            return acc;
        }, {});

        // 最終ラップを取得
        const max = Object.keys(_laps).reduce(function (acc, b) {
            return Math.max(acc, parseInt(b));
        }, -Infinity);

        return [...Array(max)].map((_, i) => {
            const _lap: {[key: string]: any} = _laps[i+1];
            if (_lap == null) {
                return {
                    lap: -1,
                    remainingTime: 0,
                    beginningOfFuel: -1,
                    endOfFuel: -1,
                    driverId: -1,
                    lapTimeResult: 0,
                    pitIn: false,
                    pitOut: false
                };
            }

            return {
                lap: _lap.lap,
                remainingTime: _lap.remainingTime,
                beginningOfFuel: _lap.beginningOfFuel,
                endOfFuel: _lap.endOfFuel,
                driverId: _lap.driverId,
                lapTimeResult: _lap.lapTimeResult,
                pitIn: _lap.pitIn,
                pitOut: _lap.pitOut
            };
        })
    }

    public static awsRowDataToLaps (awsRawData: AwsRawLap[], defaultParam: Parameter, paramForLaps?: ParamForLap[]) {
        // RTime(RemainingTime)とFuelは、１ラップずつ後ろにずれる
        // 例えばラップ1が "Fuel": 95.0, "RTime": "5:50:40" とすると、
        // 両者ともラップ1終了時点の値なので、ラップ2開始時点のデータにする必要があるため
        const awsData = Lap.normalizeAwsRowData(awsRawData, defaultParam.fullFuel, defaultParam.raceTime)
        if (awsData.length === 0) {
            return []
        }

        // ラップデータを作る
        const awsDataLen = awsData.length
        const laps = awsData.map((v, idx)  => {
            // 燃費計算
            const _fuelConsumption = idx < (awsDataLen - 1) ? v.beginningOfFuel - awsData[idx+1].beginningOfFuel : -1
            const fuelConsumption = _fuelConsumption > 0 ? _fuelConsumption : -1
            return new Lap(
                defaultParam,
                v.lap,
                -1,
                0,
                v.remainingTime,
                v.beginningOfFuel,
                v.endOfFuel,
                v.pitIn,
                v.pitOut,
                false,
                0,
                0,
                v.driverId,
                false, // 結果として作る
                v.lapTimeResult,
                fuelConsumption
            )
        })
        // test
        // laps.splice(10)

        // 最後のラップをクローンし、計画用パラメータをセットする。
        const lastLap = laps[laps.length-1]
        const dummyLap = lastLap.cloneNextLap(paramForLaps?.find(v => v.lap === lastLap.lap))
        if (dummyLap) {
            dummyLap.lap = lastLap.lap
            dummyLap.fuelConsumption = defaultParam.targetFuelConsumption
            dummyLap.tireStint = defaultParam.tireStint
            dummyLap.tireStintAcc = 1 // ここ難しいのでとりあえず1
            dummyLap.lapTime = defaultParam.targetLapTime // とりあえず
            // 残りは計画として作成する。
            const lapsPlan = Lap.makeLapsPlan(defaultParam, paramForLaps, dummyLap)
            // 最初のラップはlastLapと重複しているので削除する
            lapsPlan.shift()
            return laps.concat(lapsPlan)
        }
        throw new Error()
    }
}
