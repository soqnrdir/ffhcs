import Debug from "debug"
const debug = Debug("ffhcs:vms")
import axios from 'axios'
import {parseStringPromise} from 'xml2js'
import iconv from 'iconv-lite'
import logger from '@shared/Logger'
import {API} from '../Config'

export class Addr {
  public type: string // parcel: 지번, road: 도로명 주소
  public text: string

  constructor(type: string, text: string) {
    this.type = type
    this.text = text
  }
}

export class GPSAddr {
  public longitude: string
  public latitude: string
  public addresses: Array<Addr>

  constructor(longitude: string, latitude: string) {
    this.longitude = longitude
    this.latitude = latitude
    this.addresses = []
  }

  // 좌표가 동일한지 판단
  isSameCoord(longitude: string, latitude: string) : boolean {
    return this.longitude == longitude && this.latitude == latitude
  }

  // Text 주소가 있는지 판단
  hasAddress() : boolean {
    return this.addresses.length > 0
  }
}

/*
$ curl -vv http://api.vworld.kr/req/address?service=address&request=getAddress&version=2.0&crs=epsg:4326&point=126.978275264,37.566642192&format=json&type=both&zipcode=false&simple=false&key=D16B536B-7B42-3477-AD30-32CF5C5F99DD

{
  "response": {
    "service": {
      "name": "address",
      "version": "2.0",
      "operation": "getAddress",
      "time": "15(ms)"
    },
    "status": "OK",
    "input": {
      "point": {
        "x": "126.978275264",
        "y": "37.566642192"
      },
      "crs": "epsg:4326",
      "type": "both"
    },
    "result": [
      {
        "type": "parcel",
        "text": "서울특별시 중구 태평로1가 31",
      },
      {
        "type": "road",
        "text": "서울특별시 중구 태평로1가 세종대로 110 서울특별시 청사 신관",
      }
    ]
  }
}
*/
export async function lookupAddr(longitude: string, latitude: string) : Promise<GPSAddr> {
  let url = 'http://api.vworld.kr/req/address?service=address&request=getAddress&version=2.0'
  url += '&crs=epsg:4326&format=json&type=both&zipcode=false&simple=false'
  url += `&key=${API.VWorldApiKey}`
  let point = `${longitude},${latitude}`
  url += `&point=${point}`
  debug(`axios.get ${url}`)
  let res = await axios({
    url,
    method: "GET",
  })

  let addr = new GPSAddr(longitude, latitude)
  if (res.data.response.status == 'OK') {
    for (let a of res.data.response.result) {
      addr.addresses.push(new Addr(a.type, a.text))
    }
  } else {
    logger.warn(`[lookupAddress] server returned negative status: ${res.data.response.status}`)
  }
  return addr
}
