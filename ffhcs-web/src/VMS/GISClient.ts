import Debug from "debug"
const debug = Debug("ffhcs:vms")
import axios from 'axios'
import logger from '@shared/Logger'
import {API} from '../Config'
import moment from 'moment'

/*
상태코드 정의
  000 : 비행 전
  001 : 비행 시작 보고 이후
  002 : 비행 종료 보고 이후
*/
export class GISData {
  public fcno: string
  public longitude: string
  public latitude: string
  public altitude: number
  public speed: number
  public heading: number
  public state_code: string
  public send_date: Date

  constructor(fcno: string, longitude: string, latitude: string, altitude: number, speed: number, heading: number, state_code: string, send_date: Date) {
    this.fcno = fcno
    this.longitude = longitude
    this.latitude = latitude
    this.altitude = altitude
    this.speed = speed
    this.heading = heading
    this.state_code = state_code
    this.send_date = send_date
  }

}

/*
GIS 서버로부터 현재 헬기 좌표값을 얻는다.
http://125.60.28.89:10082/fhicgis/rest/getLatestCoords
[
{"fcno":"0002      ","longitude":"128.646942  ","latitude":"35.898151   ","altitude":"70   ","speed":"15 ","heading":"263","state_code":"001","send_date":"20210506122640"},
{"fcno":"0201      ","longitude":"126.787437  ","latitude":"37.555149   ","altitude":"31   ","speed":"0  ","heading":"202","state_code":"001","send_date":"20210503155157"},
]
*/
export async function getLatestCoords() : Promise<Array<GISData>> {
  let url = API.GISAddr + '/fhicgis/rest/getLatestCoords'
  debug(`axios.get ${url}`)
  let res = await axios({
    url,
    method: "GET",
  })

  let results: Array<GISData> = []
  if (res.data) {
    for (let a of res.data) {
      let send_date = moment(a.send_date, "YYYYMMDDHHmmss").toDate()
      let data = new GISData(a.fcno.trim(),
        a.longitude.trim(),
        a.latitude.trim(),
        Number(a.altitude),
        Number(a.speed),
        Number(a.heading),
        a.state_code.trim(), send_date)
      results.push(data)
    }
  } else {
    logger.warning(`[getLatestCoords] server returned negative status: ${res.data.response.status}`)
  }
  return results
}
