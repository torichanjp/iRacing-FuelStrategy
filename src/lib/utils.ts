import DateLib from './date'
import StringLib from './string'
import Log from './log'

type Object = object & {
    [key: string]: any
}

const Utils = {
    /**
     * 配列をオブジェクトに変換する
     *
     * @param {Array<*>} arr
     * @param {?string} [key=null] - オブジェクトのキーにしたい文字列。arrがオブジェクトでないか、nullを指定した場合は、indexがキーとなる。
     * @param {Function} valueCb - valueをカスタマイズしたい場合はは指定する。デフォルトは元のデータ(v => v)
     *
     * @example ['a', 'b', 'c'] -> {'0': 'a', '1': 'b', '2': 'c'}
     * @example [{ k: 'key', v: 'value' }] -> { key: { k: 'key', v: 'value' } }
     *
     * @return {Object}
     */
    array2Obj (arr:Array<any>, key: string | null = null, valueCb = undefined): any {
        const _func = !valueCb ? (v: any): any => v : valueCb
        return arr.reduce((acc: any, v: any, index: number) => {
            if (Utils.isNullOrUndefined(key) || !Utils.isObject(v)) {
                acc[index] = _func(v)
            } else {
                // @ts-ignore
                acc[v[key]] = _func(v)
            }
            return acc
        }, {})
    },
    /**
     * キーが{ 'xxx.yyy': value }形式のオブジェクトを、{xxx: { yyy: value } }に正規化する
     * @param {Object} obj - オブジェクト
     * @return {Object}
     */
    normalizeObjKeyWithPeriod (obj: any): any {
        return Object.entries(obj).reduce((pacc, [k, v]) => {
            const value = Utils.isPureObject(v) ? Utils.normalizeObjKeyWithPeriod(v) : v
            const newObj = k.split('.').reverse().reduce((acc, k) => {
                return {[k]: acc}
            }, value)
            return {...pacc, ...newObj}
        }, {})
    },
    /**
     * @deprecated Use StringLib
     *
     * @param str
     * @return {string}
     */
    encodeRFC5987ValueChars(str: string): string {
        return StringLib.encodeRFC5987ValueChars(str)
    },
    /**
     * html文字列を表示要にエスケープする
     *
     * @deprecated Use StringLib
     *
     * @param {string} text
     * @return {string} エスケープされたHTML文字列
     */
    escapeHTML(text: string): string {
        return StringLib.escapeHTML(text)
    },
    /**
     * ファイルパスで使用しないほうがいい文字を取り除く
     *
     * @deprecated Use StringLib
     *
     * @param {string} text
     * @return {string} エスケープされたファイルパス文字列
     */
    escapeNotPathChar(text: string): string {
        return StringLib.escapeNotPathChar(text)
    },
    /**
     * Objectを格納している配列で、key = valueのObjectのIndex番号を返す
     * 配列で最初に見つかった番号を返すことに注意
     *
     * @param {Array<Object>}arr - Objectが格納された配列
     * @param {string} key - Object内のキー
     * @param {*} value - 検索する値
     * @returns {number} - 見つかった場合は0以上のIndex、arrが配列でない、または対象が見つからない場合は-1
     */
    findIndexOfObjects(arr: Array<object>, key: string, value: any): number {
        if (!Array.isArray(arr)) {
            return -1
        }
        return arr.findIndex(obj => {
            // @ts-ignore
            return key in obj && obj[key] === value
        })
    },
    /**
     * '$var'のような変数表現をparamsで置換する。$で始まらない場合は、数値にキャストして返す。
     * @param {string} variable - 変数表現の文字列。'$max', '$min'など
     * @param {Object|Map<string, Number>} params - variablesの先頭$を取り除いた文字をkeyとしたObjectまたはMap
     *
     * @example replaceVariable('$var', {var: 10}) returns 10
     * @example replaceVariable('20', {var: 10}) returns 20
     *
     * @return {Number} - 変換された数値
     */
    getValueFromVariable: function(variable: any, params: {[key: string]: number}): number {
        let v = variable // shorthand
        if (typeof v === 'string' && v.startsWith('$')) {
            const paramKey = v.substring(1)
            const _params = Utils.isMap(params) ? Utils.mapToObject(params) : params
            // @ts-ignore
            if (_params && _params[paramKey] !== undefined) {
                // @ts-ignore
                v = _params[paramKey]
            } else {
                throw new Error(`variable[${variable}] can not be replaced. params[${_params.toString()}]`)
            }
        } else {
            v = Number(v)
        }
        return v
    },
    /**
     * 指定した値から連続したデータを生成して返す
     * @param start
     * @param count
     * @return {Array<Number>}
     */
    genSequenceArray (start: number = 0, count: number): Array<number> {
        let cur = start
        return new Array(count).fill(0).map(() => {
            return cur++
        })
    },
    isInteger: function(n: any): boolean {
        return Number.isInteger(n)
    },
    /**
     * Mapオブジェクトかチェックする
     */
    isMap: function(map: any): boolean {
        return map && map.constructor && (map.constructor.name === 'Map' || map.constructor.name === 'MongooseMap')
    },
    isNullOrUndefined: function(data: any): boolean {
        return data === undefined || data === null
    },
    isObject: function(obj: any): boolean {
        return typeof obj === 'object'
    },
    isPureObject: function(obj: any): boolean {
        if (!obj) {
            return false
        }
        return obj.constructor && obj.constructor === Object
    },
    isBlank: function(data: any): boolean {
        return this.isNullOrUndefined(data) || data === ''
    },
    keyIn: function(obj: any, key: string): boolean {
        return typeof obj === 'object' && key in obj
    },
    /**
     * srcに指定したオブジェクトをdestにマージする。元のオブジェクトを更新するので、更新したくない場合は
     * Object.assign({}, dest)または{...dest}でコピーしておく。
     *
     * @param dest
     * @param src
     * @param mergeNullOrUndefined
     * @return {[string, any]}
     */
    mergeObjects (dest: any, src: any, mergeNullOrUndefined: boolean = false): any {
        return Object.entries(src).reduce((acc, v) => {
            const [key, value] = v
            if (!Utils.isNullOrUndefined(value) || mergeNullOrUndefined) {
                acc[key] = value
            }
            return acc
        }, dest)
    },
    /**
     * MapをObjectに変換
     * @param {Map|Object} map
     * @return {Object}
     */
    mapToObject: (map: Map<any, any> | object): object => {
        if (!map) {
            return {}
        }
        if (!Utils.isMap(map)) {
            return map
        }
        // @ts-ignore
        return [...map].reduce((l, [k, v]) => Object.assign(l, {[k]: v}), {})
    },
    /**
     * Objectのkeyとvalueを入れ替える
     *
     * @param {Object} targetObj
     * @param {boolean} areKeysNumeric - キーが数値の場合はtrueを指定する。文字列の数値で良い場合は指定しないかfalseを指定する。
     * @return {{}} - 入れ替えたオブジェクト
     */
    objFlip: (targetObj: any, areKeysNumeric: boolean = false) => {
        return Object.keys(targetObj).reduceRight(function (newMap, key) {
            // @ts-ignore
            newMap[targetObj[key]] = areKeysNumeric ? parseInt(key, 10) : key
            return newMap
        }, {})
    },
    /**
     * ObjectをMapに変換
     * @param {Object|Map} object
     * @return {Map<string, *>}
     */
    objectToMap: (object: object | Map<string, any>) => {
        if (!object) {
            return new Map()
        }
        if (Utils.isMap(object)) {
            return object
        }
        return new Map(Object.entries(object))
    },
    /**
     * obj.objStrが存在するか？ typeが指定された場合は変数タイプもチェックする。
     *
     * @param {object} obj トップオブジェクト
     * @param {string} objStr トップオブジェクトに続くオブジェクトの＊文字列＊
     * @param {string|undefined} type 変数タイプ('string'|'number'|'array'|'boolean'|'symbol'|'function'
     * @returns {boolean}
     *    true 存在する（typeが指定された場合は型も一致）,
     *    false 存在しないかnull（typeが指定された場合は存在しないか型が一致しない）
     */
    propCheck: function(obj: object, objStr: string, type: string | undefined = undefined) {
        if (typeof obj !== 'object') {
            return false
        }
        const objs = objStr.split('.')
        for (let i = 0; i < objs.length; i++) {
            // 対象の途中のオブジェクトがnullだと in でエラーになるのでnullがあったらやめる(#37)
            // @ts-ignore
            if (!(objs[i] in obj) || obj[objs[i]] === null) {
                return false
            }
            // @ts-ignore
            obj = obj[objs[i]]
        }
        if (typeof type === 'string') {
            return (
                typeof obj === 'string' ||
                (type === 'array' && Array.isArray(obj))
            )
        }
        return true
    },
    /**
     * BabelでPromise.allSettledが使えないようなので実装
     *
     * @param promises
     * @return {Promise<*[]>}
     */
    promiseAllSettled: function (promises: Array<Promise<any>>) {
        let wrappedPromises = promises.map(p => Promise.resolve(p).then(
            val => ({ status: 'fulfilled', value: val }),
            err => ({ status: 'rejected', reason: err })))
        return Promise.all(wrappedPromises)
    },
    /**
     * 範囲を作る
     *
     * @param {number} size 作成する範囲の数
     * @param {number} startAt 開始番号
     */
    range (size: number, startAt: number = 0) {
        return [...Array(size).keys()].map(i => i + startAt)
    },
    /**
     * 指定したオブジェクトから、valueがnullまたはundefinedの要素を削除して新しいオブジェクトを返す
     * １階層目のみなので注意
     *
     * @param {Object} obj
     * @return {Object}
     */
    removeEmptyFromObj (obj: Object): Object {
        const _obj = Object.assign({}, obj)
        Object.entries(_obj).forEach(([k, v]) => {
            if (v === undefined || v === null) {
                // @ts-ignore
                delete _obj[k]
            }
        })
        return _obj
    },
    /**
     * f(args)を実行し、judgeFunc(戻り値)が falseの時は、 waitMilliSec ミリ秒待ち再度実行
     * trueの場合は、戻り値を返す
     * 最大 retryNum 回繰り返す
     *
     * @param {number} waitMilliSec 失敗時に待機する秒数（ミリ秒）
     * @param {number} retryNum 失敗時にリトライする回数
     * @param {function} execFunc 呼び出す関数
     * @param {function} judgeFunc 成功・失敗を判断する関数
     * @param {...*} args f に渡す引数
     * @returns {Promise<*>}
     */
    execWithRetry: async function(
        waitMilliSec: number,
        retryNum: number,
        execFunc: (args: Array<any>) => Promise<any>,
        judgeFunc: (arg: Promise<any>) => boolean,
        ...args: any
    ) {
        for (let i = 0; i < retryNum; i++) {
            try {
                // @ts-ignore
                const ret = await execFunc(...args)
                if (judgeFunc(ret)) {
                    return ret
                }
            } catch (err: any) {
                Log.error('utils.default.execWithRetry', err.message ? err.message : err)
            } finally {
                await new Promise(resolve => {
                    setTimeout(() => {
                        resolve(true)
                    }, waitMilliSec)
                })
            }
        }
        return Promise.reject(new Error(`Failed exec function ${retryNum} times`))
    },
    async sleep(milliSec: number) {
        await new Promise(resolve => {
            setTimeout(() => {
                return resolve(true)
            }, milliSec)
        })
    },
    /**
     * setTimeoutのPromise対応版
     * 直列にsetTimeoutを実行したい時などに利用
     *
     * @param {function} func - milliSec秒後に実行する関数
     * @param {number} [milliSec=1000] - funcを実行するまでに待機する時間（ミリ秒）
     * @returns {Promise<{timerId: number, result}>} timerId: setTimeoutの戻り値 result: funcのリターン値
     */
    setTimeout(func: () => any, milliSec: number = 1000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                try {
                    resolve({timeId: timer, result: func()})
                } catch (err) {
                    reject(err)
                }
            }, milliSec)
        })
    },
    /**
     * 1m, 1h, 1d, 1wを秒に直す
     * 末尾が[mhdw]以外ならparseIntして返す
     * @param {string} str - 1h, 1d, 1w, 1mなどの文字列
     */
    str2Seconds (str: string = ''): number {
        const len = str.length
        if (len <= 1) {
            return parseInt(str)
        }
        const char = str.substring(len - 1, len)
        const num = parseInt(str)
        let seconds
        switch (char) {
            case 'm':
                seconds = num * 60
                break
            case 'h':
                seconds = num * 3600
                break
            case 'd':
                seconds = num * 3600 * 24
                break
            case 'w':
                seconds = num * 3600 * 24 * 7
                break
            default:
                seconds = num
        }
        return seconds
    },
    /**
     * 配列をユニークにする。
     * 要素数が少ない配列向け
     *
     * @see https://gist.github.com/piroor/829ecb32a52c2a42e5393bbeebe5e63f
     *
     * @param {Array} array
     * @return {Array<*>}
     */
    arrayUnique (array: Array<any>): Array<any> {
        return array.filter((elem, index, self) => self.indexOf(elem) === index)
    },
    /**
     * １文字目を大文字にする
     *
     * @deprecated Use StringLib
     *
     * @param {string} str
     * @return {string}
     */
    capitalizeFirstLetter (str: string): string {
        return StringLib.capitalizeFirstLetter(str)
    },
    /**
     * 半角カナを全角カナに変換する
     *
     * @deprecated Use StringLib
     *
     * @param {string} str
     * @return {String}
     */
    han2ZenKana: (str: string): string => {
        return StringLib.han2ZenKana(str)
    },
    /**
     * 半角英数字を全角英数字に変換する
     *
     * @deprecated Use StringLib
     *
     * @param {string} str
     * @return {string}
     */
    han2ZenAlNum (str: string): string {
        return StringLib.han2ZenAlNum(str)
    },
    /**
     * 全角英数字を半角英数字に変換
     *
     * @deprecated Use StringLib
     *
     * @param str
     * @return {*}
     */
    zen2HanAlNum (str: string): string {
        return StringLib.zen2HanAlNum(str)
    },
    /**
     * @deprecated Use StringLib
     *
     * @param str
     * @return {String}
     */
    zen2HanKana: (str: string): string => {
        return StringLib.zen2HanKana(str)
    },
    /**
     * 配列と配列をzipする（同じインデックスのvalueを関数fでマージする。
     * 要素数が異なる場合は、多い方の要素数になる。
     * その場合、データがない方はnullになる。
     *
     * @param {Array<*>} xs
     * @param {Array<*>} ys
     * @param {function} f
     * @return {Array}
     * @example Utils.zip(xs, ys, (a, b) => {a, b}])
     */
    zip (xs: Array<any>, ys: Array<any>, f: (a: any, b: any) => any) {
        if (xs.length >= ys.length) {
            return xs.map((e, i) => f(e, ys?.[i] ?? null))
        } else {
            return ys.map((e, i) => f(xs?.[i] ?? null, e))
        }
    }
}

export default Utils
