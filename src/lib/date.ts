// @ts-ignore
import {DateTime, Duration, Interval} from 'luxon'

export default class DateLib {
    static get dateTime () {
        return DateTime
    }

    /**
     * JSDate、miliseconds、ISO文字列からLuxon.DateTimeオブジェクトを作成して返す
     *
     * @param {DateTime | Date | number | string | null | undefined} date
     * @return {DateTime|null}
     */
    static getDateTime (date: DateTime | Date | number | string | null | undefined) {
        if (!date) {
            return null
        }
        let dateObj
        if (date instanceof DateTime) {
            return date
        }
        if (date instanceof Date) {
            dateObj = DateTime.fromJSDate(date)
        } else if (typeof date === 'number') {
            dateObj = DateTime.fromMillis(date)
        } else {
            dateObj = DateTime.fromISO(date)
        }
        return dateObj
    }

    /**
     * baseDateの月＋baseDayの日を返す。日付が存在しない場合は、末日を返す
     * @example baseDay = 31, baseDate = '2020-02-01' の場合、2020-02-29
     * @example baseDay = 29, baseDate = '2020-02-01' の場合、2020-02-29
     *
     * @param {number} baseDay
     * @param {DateTime} baseDate
     * @param {boolean} isEndTime - 基準日の直前の23:59:59.999を得たい場合はtrue（期限終了日時を取得するために使う）
     * @return {DateTime}
     */
    static getDateByBaseDay (baseDay: number, baseDate: DateTime | null = null, isEndTime: boolean = false) {
        const _baseDate = baseDate || DateLib.now()
        const lastDay = _baseDate.daysInMonth
        const _baseDay = lastDay < baseDay ? lastDay : baseDay
        const date = _baseDate.set({ day: _baseDay })
        // isEndTimeの場合は、前日のendを返却
        return !isEndTime ? date.startOf('day') : date.minus({ day: 1 }).endOf('day')
    }

    /**
     * baseDateより前のbaseDayを日とした日付を得る
     * baseDateを超えない、baseDateの日付を求める
     *
     * @example baseDay = 20, baseDate = '2020-04-03' の場合、2020-03-20T00:00:00
     * @example baseDay = 20, baseDate = '2020-04-25' の場合、2020-04-20T00:00:00
     * @example baseDay = 30, baseDate = '2020-03-25' の場合、2020-02-29T00:00:00
     * @example baseDay = 30, baseDate = '2020-04-30' の場合、2020-04-30T00:00:00
     *
     * @param {number} baseDay - 基準日。基本的に課金開始日
     * @param {DateTime} baseDate - 調べたい日
     * @return {DateTime}
     */
    static getStartDateOfBaseDay (baseDay: number, baseDate: DateTime | null = null) {
        const _baseDate = baseDate || DateLib.now()
        // baseDay が baseDate.day より大きい場合は、先月の日付を得る
        const targetDate = _baseDate.day < baseDay ? _baseDate.minus({ month: 1 }) : _baseDate
        return DateLib.getDateByBaseDay(baseDay, targetDate)
    }

    /**
     * baseDateを超えないbaseDateの日付 + 1ヶ月後(23:59:59.999)を得る
     *
     * @example baseDay = 20, baseDate = '2020-04-03' の場合、2020-04-19T23:59:59
     * @example baseDay = 20, baseDate = '2020-04-25' の場合、2020-05-19T23:59:59
     * @example baseDay = 30, baseDate = '2020-03-25' の場合、2020-03-29T23:59:59
     * @example baseDay = 30, baseDate = '2020-04-30' の場合、2020-05-29T23:59:59
     * @example baseDay = 31, baseDate = '2020-03-30' の場合、2020-03-30T23:59:59
     *
     * @param {number} baseDay - 基準日。基本的に課金開始日
     * @param {DateTime} baseDate - 調べたい日
     * @param start
     * @return {DateTime}
     */
    static getEndDateOfBaseDay (baseDay: number, baseDate: DateTime | null = null, start: DateTime | null = null) {
        const _start = start || DateLib.getStartDateOfBaseDay(baseDay, baseDate)
        return DateLib.getDateByBaseDay(baseDay, _start.plus({ month: 1 }), true)
    }

    /**
     * end - startの日数を求める。1.5日の場合は1日を返す。
     *
     * @param {DateTime} start
     * @param {DateTime} end
     * @param {'days' | 'hours' | 'seconds'} [metric=days] - days | hours | seconds
     * @return {number}
     */
    static period (start: DateTime, end: DateTime, metric: string = 'days') {
        // @ts-ignore
        return Math.floor((Interval.fromDateTimes(start, end).toDuration(metric).toObject())[metric])
    }

    /**
     * 現在の時刻をローカルタイムゾーン付きのDateTimeで取得する
     *
     * @return {DateTime}
     */
    static now () {
        return DateTime.local()
    }

    /**
     * 月初のDateTimeを取得する
     *
     * @param {DateTime} date - luxon.DateTime
     * @param {?Object} plus - dateに加算したいオブジェクト(year, month, day, hour, minute, second)
     * @return {DateTime}
     */
    static startOfMonth (date: DateTime | null = null, plus = {}) {
        const _date = date || DateLib.now()
        return _date.plus(plus).startOf('month')
    }

    /**
     * 月末のDateTimeを取得する
     *
     * @param {DateTime} date - luxon.DateTime
     * @param {?Object} plus - dateに加算したいオブジェクト(year, month, day, hour, minute, second)
     * @return {DateTime}
     */
    static endOfMonth (date: DateTime | null = null, plus = {}) {
        const _date = date || DateLib.now()
        return _date.plus(plus).endOf('month')
    }

    /**
     * yearとmonthから、その年月の最終日時を取得する
     *
     * @param {number} year
     * @param {number} month
     * @return {DateTime}
     */
    static endOfYmdHMSByYearMonth (year: number, month: number) {
        return DateTime.local(year, month).endOf('month').endOf('day')
    }

    /**
     * 日の開始のDateTimeを取得する
     *
     * @param {DateTime} date - luxon.DateTime
     * @param {?Object} plus - dateに加算したいオブジェクト(year, month, day, hour, minute, second)
     * @return {DateTime}
     */
    static startOfDay (date: DateTime | null = null, plus = {}) {
        const _date = date || DateLib.now()
        return _date.plus(plus).startOf('day')
    }

    /**
     * 日の終了のDateTimeを取得する
     *
     * @param {DateTime} date - luxon.DateTime
     * @param {?Object} plus - dateに加算したいオブジェクト(year, month, day, hour, minute, second)
     * @return {DateTime}
     */
    static endOfDay (date: DateTime | null = null, plus = {}) {
        const _date = date || DateLib.now()
        return _date.plus(plus).endOf('day')
    }

    /**
     * dtMonthで指定した日付の月に、dateTimeが含まれていればtrue
     *
     * @param {DateTime} dtMonth - 指定した日時の月
     * @param {?DateTime} [dateTime=null] - 調べる日時。指定しないかnullの場合は現在日
     * @param {Object} plus - 調べるdateTimeに加減算する。ex) { month: 1 }：一ヶ月後
     * @return {boolean} true: 含まれる, false: 含まれない
     */
    static isMonth(dtMonth: DateTime, dateTime: DateTime | null = null, plus = {}): boolean {
        const _dateTime = (dateTime || DateLib.now()).plus(plus)
        return dtMonth.toFormat('yyyyLL') === _dateTime.toFormat('yyyyLL')
    }

    /**
     * dateに、P1Mなどの期間文字列で指定した期間を足したDateTimeを得る。
     * ※普通にDateTime.plus(duration)の場合、1/1 00:00:00＋P1Mだと、2/1 00:00:00となるが、
     *  本メソッドでは1/31 23:59:59.999を得たい場合に利用する。
     *
     * @param {DateTime} date
     * @param durationIsoString
     * @return {DateTime}
     */
    static endOfDurationIsoString(date: DateTime, durationIsoString: string): DateTime {
        return date
            .plus(Duration.fromISO(durationIsoString, undefined))
            .minus({ milliseconds: 1 })
    }

    static toFormat(date: DateTime, format: string, options: any = null): string {
        return date.toFormat(format, options)
    }

    /**
     * ○月○日の形式で返す(Localeによる)
     *
     * @param {DateTime} date
     * @return {string}
     */
    static toMonthDay (date: DateTime): string {
        const format = Object.assign({}, DateTime.DATE_MED)
        delete format.year
        return date.toLocaleString(format)
    }

    /**
     * ○年○月○日形式で返す(Localeによる)
     *
     * @param {DateTime} date
     * @return {string}
     */
    static toYearMonthDay (date: DateTime): string {
        return date.toLocaleString(DateTime.DATE_MED)
    }

    /**
     * ○年○月形式で返す(Localeによる)
     *
     * @param {DateTime} date
     * @return {string}
     */
    static toYearMonth (date: DateTime): string {
        const format = Object.assign({}, DateTime.DATE_MED)
        delete format.day
        return date.toLocaleString(format)
    }

    static secToHMS (sec: number) {
        return DateTime.fromMillis(sec * 1000).setZone('UTC').toLocaleString(DateTime.TIME_24_WITH_SECONDS)
    }

    static secToMS (sec: number, withMillisecond: boolean = false) {
        const format = 'm:ss' + (withMillisecond ? '.SSS' : '')
        // const format: {[key: string]: any} = {minute: '2-digit', second: '2-digit'}
        // if (withMillisecond) {
        //     format.millisecond = '3-digit'
        // }
        return DateTime
            .fromMillis(sec * 1000)
            .setZone('UTC')
            .toFormat(format)
            // .toLocaleString(format)
    }

    static HMSToSec (ms: string) {
        if (!ms.includes(':')) {
            return parseInt(ms)
        }
        const elem = ms.split(':')
        if (elem.length === 2) {
            return parseInt(elem[0]) * 60 + parseInt(elem[1])
        } else if (elem.length === 3) {
            return parseInt(elem[0]) * 3600 + parseInt(elem[1]) * 60 + parseInt(elem[2])
        } else {
            return -1
        }
    }
}
