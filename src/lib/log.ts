import DateLib from '../lib/date'

const Env = import.meta.env

class Log {
    static get DEBUG () { return 0 }
    static get INFO () { return 1 }
    static get NOTICE () { return 2 }
    static get WARN () { return 3 }
    static get ERROR () { return 4 }
    static get CRIT () { return 5 }

    static get kindName () { return ['DEBUG', 'INFO', 'NOTICE', 'WARN', 'ERROR', 'CRIT'] }

    static logCb(
        kind: number,
        logCallback: (msg1: string, msg2: Array<string | object>) => void,
        messages: Array<string | object>): void
    {
        const format = (typeof messages === 'object' && Array.isArray(messages)) ? messages.shift() : ''
        const LOG_WITH_TIME = parseInt(Env.VITE_LOG_WITH_TIME)
        const time = LOG_WITH_TIME ? DateLib.now().toISO() + ' ' : ''

        const message = `${time}[${Log.kindName[kind]}] ${format}`

        // stack trace情報付加
        const obj = {}
        let _messages = messages
        // captureStackTraceが定義されている場合は呼び元を末尾に付与する。
        // if ('captureStackTrace' in Error) {
        //     Error.captureStackTrace(obj)
        //     const stack = obj.stack
        //     // 直前のスタック(lib/log以上のログを見つける
        //     const stacks = stack.split('at ')
        //     stacks.shift() // １つ目はErrorという文字列なので無視する。
        //     const str = stacks.find(line => !line.includes('lib/log'))
        //     // 末尾にくっつける
        //     _messages = messages.concat('@ ' + str.substring(0, str.lastIndexOf('\n')))
        // }

        if (kind >= (Env.VITE_LOG_LEVEL != null ? Env.VITE_LOG_LEVEL : 1)) {
            logCallback(message, _messages)
        }
    }

    /**
     * @param kind
     * @param messages
     * @deprecated Log.debugなどを使って下さい。
     */
    static log(kind: number, ...messages: Array<string>) {
        const LOG_WITH_TIME = Env.VITE_LOG_WITH_TIME
        console.warn('LOG_WITH_TIME', LOG_WITH_TIME)

        const format = (typeof messages === 'object' && Array.isArray(messages)) ? messages.shift() : ''
        const time = LOG_WITH_TIME ? DateLib.now().toISO() + ' ' : ''
        const message = `${time}[${Log.kindName[kind]}] ${format}`
        if (kind >= Env.VITE_LOG_LEVEL) {
            switch (kind) {
                case Log.DEBUG:
                    console.debug(message, ...messages)
                    break
                case Log.INFO:
                    console.info(message, ...messages)
                    break
                case Log.NOTICE:
                    console.log(message, ...messages)
                    break
                case Log.WARN:
                    console.warn(message, ...messages)
                    break
                case Log.ERROR:
                case Log.CRIT:
                    console.error(message, ...messages)
                    console.log(`[${Log.kindName[kind]}] ${format}`, ...messages)
                    break
            }
        }
    }
    static debug(...messages: Array<any>) {
        Log.logCb(Log.DEBUG, (arg1, arg2) => console.debug(arg1, ...arg2), messages)
    }
    static info(...messages: Array<any>) {
        Log.logCb(Log.INFO, (arg1, arg2) => console.info(arg1, ...arg2), messages)
    }
    static notice(...messages: Array<any>) {
        Log.logCb(Log.NOTICE, (arg1, arg2) => console.log(arg1, ...arg2), messages)
    }
    static warn(...messages: Array<any>) {
        Log.logCb(Log.WARN, (arg1, arg2) => console.warn(arg1, ...arg2), messages)
    }
    static error(...messages: Array<any>) {
        Log.logCb(Log.ERROR, (arg1, arg2) => console.error(arg1, ...arg2), messages)
    }
    static crit(...messages: Array<any>) {
        Log.logCb(Log.CRIT, (arg1, arg2) => console.error(arg1, ...arg2), messages)
    }
}

export default Log
