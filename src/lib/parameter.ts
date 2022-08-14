class Parameter {
    /**
     * レース時間（秒）
     */
    raceTime: number
    /**
     * 目標ラップタイム（秒）
     */
    targetLapTime: number
    /**
     * 目標燃費（Litter/ラップ）
     */
    targetFuelConsumption: number
    /**
     * 満タン量（Litter）
     */
    fullFuel: number
    /**
     * タイヤ１セットで走るスティント数（スティント/タイヤセット）
     */
    tireStint: number
    /**
     * ピットスルーのタイムロス（秒）
     */
    pitThroughTime: number
    /**
     * 満タン給油時間（秒）
     */
    refillFuelTime: number
    /**
     * タイヤ交換時間
     */
    tireReplacementTime: number
    /**
     * 最低燃料確保量
     *
     * この燃料以下にならないようにピットストップすることになる
     */
    fuelMinKeep: number

    /**
     * iRacingサブセッションID
     */
    subSessionId: number
    /**
     * 自車カーインデックス
     */
    carIdx: number

    // calculated
    /**
     * １スティント当たりラップ数（ラップ数/スティント）
     */
    lapsPerStint: number
    /**
     * 1L辺りの給油時間(秒/Litter)
     */
    fillFuelSecPerLitter: number

    constructor(
        raceTime: number,
        targetLapTime: number,
        targetFuelConsumption: number,
        fullFuel: number,
        tireStint: number,
        pitThroughTime: number,
        refillFuelTime: number,
        tireReplacementTime: number,
        subSessionId: number,
        carIdx: number,
        fuelMinKeep: number = 1.0,
    ) {
        this.raceTime = raceTime
        this.targetLapTime = targetLapTime
        this.targetFuelConsumption = targetFuelConsumption
        this.fullFuel = fullFuel
        this.tireStint = tireStint
        this.pitThroughTime = pitThroughTime
        this.refillFuelTime = refillFuelTime
        this.tireReplacementTime = tireReplacementTime
        this.fuelMinKeep = fuelMinKeep

        this.subSessionId = subSessionId
        this.carIdx = carIdx

        this.lapsPerStint = fullFuel / targetFuelConsumption
        this.fillFuelSecPerLitter = refillFuelTime / fullFuel
    }
}

export default Parameter
