// @ts-ignore
import ExtensibleCustomError from 'extensible-custom-error'

class AppError extends Error {
    status: number
    data: any

    static code: object
    static message: object

    /**
     * AppErrorオブジェクトコンストラクタ
     *
     * @param {string} message
     * @param {number} status
     * @param {number} code
     * @param {*} data
     * @param {Object} errors - express-validatorが生成したerrorsオブジェクト
     */
    constructor(
        message: any,
        status: number,
        data: any = undefined
    ) {
        super(message)
        // if (Error.captureStackTrace) {
        //     Error.captureStackTrace(this, AppError)
        // }

        let e: any = {}
        if (message instanceof AppError || message instanceof Error) {
            e = Object.assign({}, message)
        } else {
            e.message = message
            e.status = status
            e.data = data
        }
        this.name = this.constructor.name
        this.status = e.status || 500
        this.data = e.data
    }
}

const ErrCode = AppError.code = {
    /* Address */
    ADDR_PARAM_ERROR: 'EADDR1000',
    /* Auth */
    AUTH_FAILED_1: 'IAUTH9001',
    AUTH_FAILED_2: 'IAUTH9002',
    AUTH_FAILED_3: 'IAUTH9003',
    AUTH_FAILED_4: 'IAUTH9004',
    AUTH_TOKEN_EXPIRED: 'IAUTH9005',
    AUTH_USER_NOT_REGISTERD: 'IAUTH9007',
    NO_PRIVILEGES: 'IAUTH9006',
    NEED_ADMIN: 'IAUTH9003',
    NO_TOKEN: 'IAUTH9004',
    INVALID_TOKEN: 'IAUTH9005',
    UNABLE_GET_TOKEN: 'WAUTH9001',
    AUTH_PLAN_NOT_RETRIEVED: 'EAUTH9001',
    /* External Api */
    EXTAPI_FAILED: 'EEXTAPI1000',
    EXTAPI_PROP_NOT_EXISTS: 'EEXTAPI1010',
    EXTAPI_ETHUSER_FAILED: 'EEXTAPI1020',
    /* General */
    GENERAL_ERROR: 'EERR1000',
    GENERAL_PARAM_ERROR: 'EERR1010',
    INVALID_TYPE: 'EERR1001',
    NETWORK_ERROR: 'WNETWORK1000',
    NO_DEFINED_INTERFACE: 'EINT1000',
    NO_IMPLEMENTED_METHOD: 'ECLASS1000',
    /* Limit */
    LIMIT_ERROR: 'ELIMIT1000',
    LIMIT_NAME_NOT_FOUND: 'ELIMIT1010',
    LIMIT_NOT_HAS_PERMISSION: 'ELIMIT1020',
    LIMIT_EXCEEDED_CONTRACTORS: 'ELIMIT1030',
    LIMIT_EXCEEDED_CONTRACTS: 'ELIMIT1040',
    /* Mail */
    MAIL_NOT_USER_FINDER: 'EMAIL1000',
    MAIL_NO_FROM_ADDRESS: 'EMAIL1001',
    /* System */
    SYSTEM_ERROR: 'ESYS1000',
    /* User */
    USER_PARAM_ERROR: 'EUSER1000',
    USER_OTT_KIND_UNDEFINED: 'EUSER1010',
    USER_BILLING_HISTORIES_FAIL: 'EUSER1020',
    USER_BILLING_NEXT_DATE_FAIL: 'EUSER1021',
    USER_WITHDRAW_FAIL: 'EUSER1030',
    USER_ADD_FAIL: 'WUSER9200',
    USER_WITHDRAWN_FORCE: 'WUSER9201',
    USER_UPDATE_FAIL: 'IUSER9300',
    USER_DELETE_FAIL_1: 'IUSER9400',
    USER_DELETE_FAIL_2: 'IUSER9401',
    USER_NOT_FOUND: 'IUSER9500',
    /* Validate */
    VALIDATE_NO_KIND: 'IVALIDATE1001',
    VALIDATE_KEY_NOT_FOUND: 'EVALIDATE1001',
    /* Unknown */
    UNKNOWN: 'WERR9000'
}

const ErrMessage: {[key: string]: string} = AppError.message = {
    '0000': '処理が成功しました',
    WERR9000: '不明なエラーが発生しました',
    WNETWORK1000: '通信状況その他の問題により<br/>不明なエラーが発生したため、<br/>処理を正常に完了できませんでした。',
    IAUTH9002: 'ログインが失敗しました。メールアドレスかパスワードを確認してください。',
}

export { AppError as default, ErrCode, ErrMessage }
