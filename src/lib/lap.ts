import Parameter from './parameter'

export default class Lap {
    defaultParam: Parameter
    lap: number
    planLapTime: number
    planFuelConsumption: number
    planRemainingTime: number
    planFuelLevel: number
    planPitOut: boolean
    planChangeTires: boolean
    stintPerTireSet: number

    /**
     * タイヤ１セットでの走行スティント数
     *
     * 交換直後は、1
     */
    planTireStint: number = 1

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
                stintPerTireSet: number,
                planTireStint: number = 1
    ) {
        this.defaultParam = defaultParam;
        this.lap = lap;
        this.planLapTime = planLapTime;
        this.planFuelConsumption = planFuelConsumption;
        this.planRemainingTime = planRemainingTime;
        this.planFuelLevel = planFuelLevel;
        this.planPitOut = planPitOut;
        this.planChangeTires = planChangeTires;
        this.stintPerTireSet = stintPerTireSet
        this.planTireStint = planTireStint
    }

    public cloneNextLap (): Lap | null {
        if (this.planRemainingTime < 0) {
            return null
        }

        // 残り燃料計算
        let fuelLevel = this.planFuelLevel - this.planFuelConsumption
        let pitOut = false
        let tireChange = false
        let planTireStint = this.planTireStint

        if (fuelLevel < this.defaultParam.fuelMinKeep) {
            fuelLevel = this.defaultParam.fullFuel
            pitOut = true
            // 規定スティント走っていたらタイヤ交換
            if (this.defaultParam.stintPerTireSet === this.planTireStint) {
                tireChange = true
                planTireStint = 1
            } else {
                planTireStint++
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
            this.stintPerTireSet,
            planTireStint
        )
    }

    /**
     * デフォルトパラメータからラップ配列を作る
     */
    public static makePlanLaps (param: Parameter): Array<Lap> {
        const laps: Array<Lap> = []
        // １ラップ目を作る
        const firstLap = new Lap(
            param,
            1,
            param.targetLapTime,
            param.targetFuelConsumption,
            param.raceTime,
            param.fullFuel,
            false,
            false,
            param.stintPerTireSet,
            1
        )
        laps.push(firstLap)

        let curLap = firstLap
        let i = 0

        while (i++ < 1000) { // 保険で1000周までで抜ける
            const lap = curLap.cloneNextLap()
            if (lap == null) {
                break;
            }
            laps.push(lap)
            curLap = lap
        }
        return laps
    }
}
