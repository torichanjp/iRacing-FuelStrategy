import Api from '../api'
import Utils from '../utils'
import Log from '../log'

type Params = {
    SubSessionId: string,
    CarIdx?: number
}

const base = import.meta.env.VITE_API_BASE_URL

class Lap extends Api {
    static async getLaps (subSessionId: string, carIdx?: number) {
        Log.debug(`subSessionId: ${subSessionId}`)
        Log.debug(`carIdx: ${carIdx}`)
        const params: Params = {
            SubSessionId: subSessionId,
            CarIdx: carIdx
        }

        // const response = (await Lap.get(`https://8869kf85xl.execute-api.ap-northeast-1.amazonaws.com/prd`, {params: Utils.removeEmptyFromObj(params)}))
        const response = (await Lap.get(`${base}/default/`, {headers: {'Content-Type': 'application/json'}, params: Utils.removeEmptyFromObj(params)}))
        // const response = (await Lap.get(`${base}/default/`))
            .throwOnFail?.()
        return response?.data ?? []
    }
}

export default Lap
