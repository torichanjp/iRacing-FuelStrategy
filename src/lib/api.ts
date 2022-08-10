import {default as AppError, ErrMessage} from './app-error'
import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios'
import Utils from './utils'
import Log from './log'

axios.defaults.baseURL = 'http://127.0.0.1:5173'
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'

type ApiErrorMessage = {
    msg: string
    param: any
}

type ApiData = [
    {
        SubSessionId: string
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
]

type ApiConfig = AxiosRequestConfig & {}

type ApiResponse<T> = AxiosResponse<T> & {
    throwOnFail?: () => ApiResponse<T>
    isError?: boolean
    isOk?: boolean
    getData?: ApiData
    getMessage?: string
    getSuccess?: boolean
    status?: number,
    data?: T
}

/**
 * レスポンスに対する、res.dataを返す、res, res.dataがundefinedでもサニタイズして返す。
 * 注）dataは定義されていなければundefinedが返る（呼び出し元で判別しやすくするため）
 *
 * @param {ApiResponse} res
 * @param err
 * @return {{code: string, data: {}, success: boolean, message, rawMessage: string}}
 */
const sanitizeResponseData = function (res: AxiosResponse<ApiData>, err: (AxiosError | Error | undefined) = undefined) {
    // codeが指定されている場合はcodeを優先する。
    // codeが指定されておらず、errの場合はネットワークエラーとして処理する。code = WNETWORK1000
    // let success = !err
    // let code = 'WNETWORK1000'
    // let message = ErrMessage[code]
    // let data
    // let rawMessage = err && err.message ? err.message : 'No message'
    //
    // if (res && res.data && res.data.success !== undefined) {
    //     // statusが200以外もデータを処理する場合があるためここを通す
    //     success = res.data.success
    //     rawMessage = res.data.message ? res.data.message : rawMessage
    //     // 苦し紛れだが、successがあり、codeがない場合は、rawMessageを使う
    //     code = res.data.code ? res.data.code : undefined
    //     message = code
    //         ? (ErrMessage[code] ? ErrMessage[code] : 'エラーが発生しました')
    //         : rawMessage
    //     data = res.data.data
    // } else if (!res) {
    //     // ネットワークエラーの時はresがundefined
    //     Log.warn('[api.sanitizeResponseData.sanitizeResponseData] err', err)
    //     success = false
    // } else if (!err && res && res.data && res.data.success === undefined) {
    //     // レスポンスはあったが、期待するデータでない場合は未知なレスポンス
    //     success = false
    //     code = 'WERR9000'
    //     message = ErrMessage[code] ? ErrMessage[code] : '未知のエラーが発生しました'
    //     rawMessage = 'Unknown message'
    // }
    // return { success, code, message, data, rawMessage }
    return res.data
}

/**
 * レスポンスは基本的にエラーが発生してもPromise.resolve()を返すが、Throwしたい場合は、メソッドチェインで、throwOnFail()を呼び出す
 *
 * @param {Object} res - サニタイズしたresponseオブジェクト
 * @param {Error} err - 基本的にはaxiosが返すErrorオブジェクト
 * @return {{
 *   throwOnFail: (function(): Object),
 *   getSuccess: (function(): boolean),
 *   getMessage: (function(): string),
 *   getCode: (function(): string),
 *   getData: (function(): Object)
 * }}
 */
const additionalObj = function (res: ApiResponse<ApiData>, err: AxiosError | Error | undefined = undefined) {
    const isError = res.status !== 200
    return {
        throwOnFail: function (): ApiResponse<ApiData> {
            if (res.status !== 200 || err) {
                const data = res.data
                Log.warn('[api.throwOnFail.throwOnFail] status[%d], message[%s]',
                    res.status,
                    res.statusText
                )
                throw new AppError(res.statusText, res.status, data)
            }
            return res
        },
        isError: (): boolean => isError,
        isOk: (): boolean => !isError,
        getData: (): ApiData => res.data,
        getMessage: (): string => res.statusText,
    }
}

export default class Api {
    static headers: any

    static registerHeaders (headers: object) {
        Api.headers = Object.assign({}, Api.headers, headers)
    }

    static get (url: string, config: ApiConfig = {}): Promise<ApiResponse<ApiData>> {
        const _config = Api.mergeHeadersToConfig(config, Api.headers)
        Log.debug('[api.Api.get] _config', _config.toString())
        return axios.get(url, _config)
            .then((res: AxiosResponse<any>): Promise<ApiResponse<ApiData>> => {
                // todo impl
                return Api.response(res)
            })
            .catch(err => {
                return Api.response(err.response, err)
            })
    }

    static post (url: string, data: any, config: ApiConfig = {}): Promise<ApiResponse<ApiData>>  {
        const _config = Api.mergeHeadersToConfig(config, Api.headers)
        return axios.post(url, data, _config)
            .then(res => {
                // todo impl
                return Api.response(res)
            })
            .catch(err => {
                return Api.response(err.response, err)
            })
    }

    static put (
        url: string,
        data: any,
        config: ApiConfig,
        callback: ((config: ApiConfig) => object) | null = null
    ): Promise<ApiResponse<ApiData>>  {
        let _config = Api.mergeHeadersToConfig(config, Api.headers)
        if (callback) {
            _config = callback(_config)
        }
        return axios.put(url, data, _config)
            .then((res: AxiosResponse<any>) => {
                Log.debug('[api.Api.put] res', res)
                // todo impl
                return Api.response(res)
            })
            .catch(err => {
                return Api.response(err.response, err)
            })
    }

    static patch (
        url: string,
        data: any,
        config: ApiConfig,
        callback: ((config: object) => object) | null = null
    ): Promise<ApiResponse<ApiData>>  {
        let _config = Api.mergeHeadersToConfig(config, Api.headers)
        if (callback) {
            _config = callback(_config)
        }
        return axios.patch(url, data, _config)
            .then(res => {
                Log.debug('[api.Api.patch] res', res)
                // todo impl
                return Api.response(res)
            })
            .catch(err => {
                return Api.response(err.response, err)
            })
    }

    /**
     * DELETEは、dataを含める仕様ではないらしい（リソースの削除なので）
     * @param url
     * @param config
     * @param callback
     * @returns {Promise<Config<any> | never>}
     */
    static delete (url: string, config: ApiConfig, callback: ((config: ApiConfig) => ApiConfig) | null = null) {
        let _config = Api.mergeHeadersToConfig(config, Api.headers)
        if (callback) {
            _config = callback(_config)
        }
        // deleteはconfigにdataを含める必要がある
        return axios.delete(url, _config)
            .then(res => {
                Log.debug('[api.Api.delete] res', res)
                // todo impl
                return Api.response(res)
            })
            .catch(err => {
                return Api.response(err.response, err)
            })
    }

    // static filePut (url, filePath, config) {
    //   var params = new FormData();
    //   params.append('file', fileSelectDom.files[0]);
    //
    // }

    static response (
        res: AxiosResponse<ApiData>,
        err: AxiosError | Error | undefined = undefined
    ): Promise<ApiResponse<ApiData>> {
        Log.debug('[api.Api.response] res', res)

        // メソッドチェーンで、.throwOnFail()を呼び出すと、success=falseの時にエラーをThrowする。
        const _res: ApiResponse<ApiData> = Object.assign(
            {},
            res,
            { status: res?.status ?? 999 }, // リクエストエラー時はres=undefinedになるので独自コードを割り当て。
            { data: sanitizeResponseData(res, err) }
        )
        Object.assign(_res, additionalObj(_res, err))

        const data = _res.data

        return new Promise((resolve, reject) => {
            if (_res.isOk) {
                Log.debug('[api.Api.response] success')
                resolve(_res)
            } else {
                Log.debug('[api.Api.response] failed')
                reject(_res)
            }
        })
    }

    static mergeHeadersToConfig (config: ApiConfig, headers: object): ApiConfig {
        let conf
        // configが指定されていない場合は、headersのコピーを返す
        const headersCopy = Object.assign({}, headers)
        if (Utils.isNullOrUndefined(config)) {
            conf = { headers: headersCopy }
        } else {
            // config.headersもheadersもない場合はundefined
            const _headers = Utils.keyIn(config, 'headers')
                ? Object.assign({}, headersCopy, config.headers)
                : (Utils.isNullOrUndefined(headers) ? undefined : headersCopy)
            conf = Object.assign({}, config)
            conf.headers = _headers
        }
        // // APIトークンがない場合はストレージから取得して付与する
        // Log.debug('[api.Api.mergeHeadersToConfig] conf', conf)
        // // todo trueなのにどうしてもfalseになる（「-」が悪いっぽい）
        // // if (!Utils.propCheck(conf, 'headers.x-access-token')) {
        Log.debug('[api.Api.mergeHeadersToConfig] Getting x-access-token')
        // }
        // if (conf && conf.headers) {
        //     conf.headers['Access-Control-Allow-Origin'] = '*'
        //     conf.withCredentials = true
        // }

        return conf
    }

    /**
     * Objectを、x-www-form-urlencodedで送信する
     * express-validateする時は必要
     *
     * @param obj
     * @return {URLSearchParams}
     */
    static formDataFromObj(obj: object): URLSearchParams {
        return Object.entries(obj).reduce((acc, [k, v]) => {
            acc.append(k, v)
            return acc
        }, new URLSearchParams())
    }
}
