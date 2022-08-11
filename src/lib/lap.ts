import Parameter from './parameter'

export type ParamForLap = {
    lap: number
    lapTime?: number
    fuelConsumption?: number
    planTireStint?: number
}

export default class Lap {
    defaultParam: Parameter
    lap: number
    planLapTime: number
    planFuelConsumption: number
    planRemainingTime: number
    planFuelLevel: number
    planPitOut: boolean
    planChangeTires: boolean
    planTireStint: number

    /**
     * タイヤ１セットでの走行スティント数
     *
     * 交換直後は、1
     */
    planTireStintAcc: number = 1

    resultRemainingTime: number = -1
    resultFuelLevel: number = -1
    resultPitIn: boolean = false
    resultPitExit: boolean = false

    // calculated

    constructor(defaultParam: Parameter,
                lap: number,
                planLapTime: number,
                planFuelConsumption: number,
                planRemainingTime: number,
                planFuelLevel: number,
                planPitOut: boolean,
                planChangeTires: boolean,
                planTireStint: number,
                planTireStintAcc: number = 1
    ) {
        this.defaultParam = defaultParam;
        this.lap = lap;
        this.planLapTime = planLapTime;
        this.planFuelConsumption = planFuelConsumption;
        this.planRemainingTime = planRemainingTime;
        this.planFuelLevel = planFuelLevel;
        this.planPitOut = planPitOut;
        this.planChangeTires = planChangeTires;
        this.planTireStint = planTireStint
        this.planTireStintAcc = planTireStintAcc
    }

    /**
     * 次のラップの情報を計算し、新規Lapインスタンスとして返す。
     *
     * @param {ParamForLap} paramForLaps? ラップ毎のパラメータ
     */
    public cloneNextLap (paramForLaps?: ParamForLap): Lap | null {
        if (this.planRemainingTime < 0) {
            return null
        }

        // ラップ毎設定がある場合は上書き
        this.planLapTime = paramForLaps?.lapTime ?? this.planLapTime
        this.planFuelConsumption = paramForLaps?.fuelConsumption ?? this.planFuelConsumption
        this.planTireStint = paramForLaps?.planTireStint ?? this.planTireStint

        // 残り燃料計算
        let fuelLevel = this.planFuelLevel - this.planFuelConsumption
        let pitOut = false
        let tireChange = false
        let planTireStintAcc = this.planTireStintAcc

        // 燃料は、１周分＋最低燃料が残っている必要あり
        if (fuelLevel < this.planFuelConsumption + this.defaultParam.fuelMinKeep) {
            fuelLevel = this.defaultParam.fullFuel
            pitOut = true
            // 規定スティント走っていたらタイヤ交換
            if (this.planTireStint <= this.planTireStintAcc) {
                tireChange = true
                planTireStintAcc = 1
            } else {
                planTireStintAcc++
            }
        }
        // 残り時間計算
        const basicRemainingTime = this.planRemainingTime - this.planLapTime
        const remainingTime = basicRemainingTime
            - (pitOut ? this.defaultParam.pitThroughTime : 0)
            - (tireChange ? this.defaultParam.tireReplacementTime : 0)

        return new Lap(
            this.defaultParam,
            this.lap + 1,
            this.planLapTime,
            this.planFuelConsumption,
            remainingTime,
            fuelLevel,
            pitOut,
            tireChange,
            this.planTireStint,
            planTireStintAcc
        )
    }

    /**
     * デフォルトパラメータからラップ配列を作る
     */
    public static makePlanLaps (param: Parameter, paramForLaps?: ParamForLap[]): Array<Lap> {
        const laps: Array<Lap> = []
        // ラップ毎のパラメータがある場合はそちらを優先する
        const paramForLap = paramForLaps?.find(v => v.lap === 1)
        // １ラップ目を作る
        const firstLap = new Lap(
            param,
            1,
            paramForLap?.lapTime ?? param.targetLapTime,
            paramForLap?.fuelConsumption ?? param.targetFuelConsumption,
            param.raceTime,
            param.fullFuel,
            false,
            false,
            paramForLap?.planTireStint ?? param.planTireStint,
            1
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
            laps.push(lap)
            curLap = lap
        }
        return laps
    }
}
