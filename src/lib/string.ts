import Utils from './utils'

export const HALF_2_FULL = 0
export const FULL_2_HALF = 1
export const REGEXP_AL_NUM_SIGN = /^[a-zA-Z0-9!"#$%&'()=~|`{}+*<>?_\-^\\@[\];:,./]+$/

export default class StringLib {
    /**
     * １文字目を大文字にする
     *
     * @param {string} str
     * @return {string}
     */
    static capitalizeFirstLetter (str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    /**
     * 前後のスペースを削除する（全角スペースも対象）
     *
     * @param {string} str
     * @return {string}
     */
    static trim (str: string): string {
        const _str = str || ''
        const regex = new RegExp('^[ 　]*(.*?)[ 　]*$')
        return _str.replace(regex, '$1')
    }

    /**
     * キャメルケースへ変換 sampleString
     * @param {string} str
     * @return {string}
     */
    static camelCase (str: string): string {
        const _str = str.charAt(0).toLowerCase() + str.slice(1)
        return _str.replace(/[-_](.)/g, function (match, group1) {
            return group1.toUpperCase()
        })
    }

    /**
     * スネークケースへ変換
     * @param {string} str
     * @return {string}
     */
    static snakeCase (str: string): string {
        const camel = StringLib.camelCase(str)
        return camel.replace(/[A-Z]/g, function (s) {
            return '_' + s.charAt(0).toLowerCase()
        })
    }

    /**
     * ケバブケースへ変換
     * @param {string} str
     * @return {string}
     */
    static kebabCase (str: string): string {
        const camel = StringLib.camelCase(str)
        return camel.replace(/[A-Z]/g, function (s) {
            return '-' + s.charAt(0).toLowerCase()
        })
    }

    /**
     * ロケールに対応した表示形式で表示する
     *
     * @param str
     * @return {string}
     */
    static format (str: string): string {
        return parseInt(str).toLocaleString()
    }

    /**
     * ランダム文字列を返す
     *
     * @param {number} len - 生成する文字数
     * @param {?string} [baseStr=] - 生成に利用する文字列（出力にはこの文字のみ含まれる）
     * @return {string} - 生成した len 文字の文字列
     */
    static genRandomStr(len: number = 8, baseStr: string | null = null): string {
        const charset = baseStr || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!"#$%&\'()-=^~`{}[]+*;:/<>,.?'
        let output = ''
        for (let i = 0, n = charset.length; i < len; ++i) {
            output += charset.charAt(Math.floor(Math.random() * n))
        }
        return output
    }

    /**
     * パスカルケースへ変換 SampleString
     * @param {string} str
     * @return {string}
     */
    static pascalCase (str: string): string {
        const camel = StringLib.camelCase(str)
        return camel.charAt(0).toUpperCase() + camel.slice(1)
    }

    static removeSpaces (str: string): string {
        return (str || '').replace(/\s+/g, '')
    }

    /**
     * 英数字を全角<=>半角変換する
     *
     * @ref han2ZenAlNum / zen2HanAlNum
     * @param targetString
     * @param {number} pattern - HALF_2_FULL | FULL_2_HALF
     * @return {string}
     */
    static changeAlNum (targetString: string, pattern: number): string {
        const regEx = pattern === HALF_2_FULL ? /[0-9a-z]/gi : /[０-９ａ-ｚ]/gi
        return targetString.replace(regEx, function (s) {
            return String.fromCharCode(s.charCodeAt(0) + (pattern === HALF_2_FULL ? 1 : -1) * 0xFEE0)
        })
    }

    /**
     * Change half-sized kana to full-sized one
     * @param {String} targetString
     * @param {Number} pattern Specify the change pattern.
     * @return {String} The changed string
     */
    static changeKana (targetString: string, pattern: number) {
        const originalKanaMap = {
            'ｶﾞ': 'ガ',
            'ｷﾞ': 'ギ',
            'ｸﾞ': 'グ',
            'ｹﾞ': 'ゲ',
            'ｺﾞ': 'ゴ',
            'ｻﾞ': 'ザ',
            'ｼﾞ': 'ジ',
            'ｽﾞ': 'ズ',
            'ｾﾞ': 'ゼ',
            'ｿﾞ': 'ゾ',
            'ﾀﾞ': 'ダ',
            'ﾁﾞ': 'ヂ',
            'ﾂﾞ': 'ヅ',
            'ﾃﾞ': 'デ',
            'ﾄﾞ': 'ド',
            'ﾊﾞ': 'バ',
            'ﾋﾞ': 'ビ',
            'ﾌﾞ': 'ブ',
            'ﾍﾞ': 'ベ',
            'ﾎﾞ': 'ボ',
            'ﾊﾟ': 'パ',
            'ﾋﾟ': 'ピ',
            'ﾌﾟ': 'プ',
            'ﾍﾟ': 'ペ',
            'ﾎﾟ': 'ポ',
            'ｳﾞ': 'ヴ',
            'ﾜﾞ': 'ヷ',
            'ｦﾞ': 'ヺ',
            'ｱ': 'ア',
            'ｲ': 'イ',
            'ｳ': 'ウ',
            'ｴ': 'エ',
            'ｵ': 'オ',
            'ｶ': 'カ',
            'ｷ': 'キ',
            'ｸ': 'ク',
            'ｹ': 'ケ',
            'ｺ': 'コ',
            'ｻ': 'サ',
            'ｼ': 'シ',
            'ｽ': 'ス',
            'ｾ': 'セ',
            'ｿ': 'ソ',
            'ﾀ': 'タ',
            'ﾁ': 'チ',
            'ﾂ': 'ツ',
            'ﾃ': 'テ',
            'ﾄ': 'ト',
            'ﾅ': 'ナ',
            'ﾆ': 'ニ',
            'ﾇ': 'ヌ',
            'ﾈ': 'ネ',
            'ﾉ': 'ノ',
            'ﾊ': 'ハ',
            'ﾋ': 'ヒ',
            'ﾌ': 'フ',
            'ﾍ': 'ヘ',
            'ﾎ': 'ホ',
            'ﾏ': 'マ',
            'ﾐ': 'ミ',
            'ﾑ': 'ム',
            'ﾒ': 'メ',
            'ﾓ': 'モ',
            'ﾔ': 'ヤ',
            'ﾕ': 'ユ',
            'ﾖ': 'ヨ',
            'ﾗ': 'ラ',
            'ﾘ': 'リ',
            'ﾙ': 'ル',
            'ﾚ': 'レ',
            'ﾛ': 'ロ',
            'ﾜ': 'ワ',
            'ｦ': 'ヲ',
            'ﾝ': 'ン',
            'ｧ': 'ァ',
            'ｨ': 'ィ',
            'ｩ': 'ゥ',
            'ｪ': 'ェ',
            'ｫ': 'ォ',
            'ｯ': 'ッ',
            'ｬ': 'ャ',
            'ｭ': 'ュ',
            'ｮ': 'ョ',
            '｡': '。',
            '､': '、',
            'ｰ': 'ー',
            '｢': '「',
            '｣': '」',
            '･': '・'
        }
        let kanaMap: any
        switch (pattern) {
            case HALF_2_FULL:
                kanaMap = originalKanaMap
                break
            case FULL_2_HALF:
                kanaMap = Utils.objFlip(originalKanaMap, false)
                break
            default:
                throw new Error('Illegal Argument Exception')
        }
        const reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g')
        return targetString
            .replace(reg, function (match) {
                return kanaMap[match]
            })
    }

    static encodeRFC5987ValueChars (str: string): string {
        return (
            encodeURIComponent(str)
                // RFC3986 では "!" は予約文字だが、RFC5987 ではそうではないため、
                // エスケープする必要がないことに注意
                .replace(/['()]/g, escape) // i.e., %27 %28 %29
                .replace(/\*/g, '%2A')
                // 以下の文字、| ` ^ は RFC5987 ではパーセントエンコーディングする必要がないので、
                // 通信上での可読性向上のため unescape を行う
                .replace(/%(?:7C|60|5E)/g, unescape)
        )
    }

    /**
     * str1とstr2で差が出る位置を取得する
     * 同じ場合は-1を返す
     *
     * @param str1
     * @param str2
     * @return {number}
     */
    static findDifferentPos (str1: string, str2: string): number {
        if (str1 === str2) {
            return -1
        }
        str1 = str1 || ''
        str2 = str2 || ''
        const str1len = str1.length
        const str2len = str2.length

        let i = 0
        for (;i < (str1len > str2len ? str1len : str2len); i++) {
            const str1i = str1.charCodeAt(i)
            const str2i = str2.charCodeAt(i)
            if (!(str1i && str2i && str1i === str2i)) {
                break
            }
        }
        return i
    }

    /**
     * html文字列を表示要にエスケープする
     *
     * @param {string} text
     * @return {string} エスケープされたHTML文字列
     */
    static escapeHTML (text: string): string {
        const replacement = function(ch: string): string {
            const characterReference: {[key: string]: string} = {
                '"': '&quot;',
                '&': '&amp;',
                '\'': '&#39;',
                '<': '&lt;',
                '>': '&gt;'
            }
            return characterReference[ch]
        }
        return text.replace(/["&'<>]/g, replacement)
    }

    static makeString (len: number, pad: string): string {
        return ''.padEnd(len, pad)
    }

    /**
     * 文字列を指定した文字でマスクする。
     * leftPost + rightPos が文字長以上の場合は元の文字列を返す
     *
     * @param {string} str
     * @param {?string} pad - マスクする文字
     * @param {number} leftPos - マスクを開始する位置（一番左が0）
     * @param {number} rightPos - マスクを終了する位置（一番右が0）
     * @return {string}
     */
    static maskString (str: string, pad: string = '●', leftPos: number = 0, rightPos: number = 0): string {
        const _str = str || ''
        const _strLen = _str.length
        const maskLen = _strLen - leftPos - rightPos
        return maskLen <= 0 ? str : (
            _str.substring(0, leftPos) +
            StringLib.makeString(maskLen, pad) +
            _str.substring(leftPos + maskLen)
        ).substring(0, _str.length)
    }

    /**
     * 数値を16進数文字列に変換する。
     *
     * @param {number} number - 変換したい数値
     * @param {boolean} with0x - 先頭に'0x'をつける場合はtrue
     * @return {string} - 変換後の16進文字列
     */
    static numToHexStr (number: number, with0x: boolean = false): string {
        return (with0x ? '0x' : '') + number.toString(16)
    }

    /**
     * 16進文字列を数値に変換
     *
     * @param {string} str
     * @return {number}
     */
    static hexStrToNum (str: string): number {
        return parseInt(str, 16)
    }

    /**
     * ファイルパスで使用しないほうがいい文字を取り除く
     *
     * @param {string} text
     * @return {string} エスケープされたファイルパス文字列
     */
    static escapeNotPathChar (text: string): string {
        const regex = /[¥:/\\*?"<>|]/g
        return text.replace(regex, '_')
    }

    /**
     * 半角英数字を全角英数字に変換する
     *
     * @param {string} str
     * @return {string}
     */
    static han2ZenAlNum (str: string): string {
        return StringLib.changeAlNum(str, HALF_2_FULL)
    }

    /**
     * 半角カナを全角カナに変換する
     *
     * @param {string} str
     * @return {String}
     */
    static han2ZenKana (str: string): string {
        return StringLib.changeKana(str, HALF_2_FULL)
    }

    static isBlank (str: string): boolean {
        return Utils.isBlank(str)
    }

    /**
     * 全角英数字を半角英数字に変換
     * @param str
     * @return {*}
     */
    static zen2HanAlNum (str: string): string {
        return StringLib.changeAlNum(str, FULL_2_HALF)
    }

    static zen2HanKana (str: string): string {
        return StringLib.changeKana(str, FULL_2_HALF)
    }
}
