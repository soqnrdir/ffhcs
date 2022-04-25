import Debug from "debug"
const debug = Debug("ffhcs:vms")
import axios from 'axios'
import {parseStringPromise} from 'xml2js'
import iconv from 'iconv-lite'
import logger from '@shared/Logger'

export class VMSCamera {

  public createdAt: Date
  public chType: number   // 채널 타입 => 1: 계기판, 2: 승객(환자), 3: 전방, 4: 호이스트
  public vmsKey: string
  public vmsEnable: boolean
  public vmsName: string
  public vmsUrl1: string
  public vmsUrl2: string
  public vmsOnline1: boolean
  public vmsOnline2: boolean

  constructor() {
    this.createdAt = new Date()
    this.chType = 0
    this.vmsKey = ''
    this.vmsEnable = false
    this.vmsName = ''
    this.vmsUrl1 = ''
    this.vmsUrl2 = ''
    this.vmsOnline1 = false
    this.vmsOnline2 = false
  }

}

export class VMSCameraGroup {
  public createdAt: Date
  public vmsServer: string
  public vmsGroupKey: string
  public vmsGroupName: string
  public cameras: Array<VMSCamera>

  constructor(vmsServer: string) {
    this.createdAt = new Date()
    this.vmsServer = vmsServer
    this.vmsGroupKey = ''
    this.vmsGroupName = ''
    this.cameras = []
  }

  getStatus() : number {
    for (var camera of this.cameras) {
      if (camera.vmsOnline1 || camera.vmsOnline2) // 카메라 한대라도 연결되었다면 On 상태임
        return 1  // online
    }

    return 2 // offline
  }
}

export class VMSEventStatus {
  public Key: string
  public HighStreamConnection: boolean
  public LowStreamConnection: boolean

  constructor() {
    this.Key = ''
    this.HighStreamConnection = false
    this.LowStreamConnection = false
  }

}

function chTypeFromCameraName(name: string) : number {
  if (name.endsWith('계기판'))
    return 1
  else if (name.endsWith('승객(환자)'))
    return 2
  else if (name.endsWith('전방'))
    return 3
  else if (name.endsWith('호이스트'))
    return 4
  return 0
}

/*
<CameraGroup>
	<CameraGroupList>
		<CameraGroupListItem>
			<Key>1</Key>
			<Name>Group Name1</Name>
			<CameraListItem>
      [{"Key":["30"],"Enable":["1"],
      "Name":["Camera Name"],
      "Type":["Dome"],
      "Address":["192.168.1.115"],
      "Port":["80"],
      "RTSP_URL1":["rtsp://naiz.re.kr:8002/2/stream1"],
      "RTSP_URL2":["rtsp://naiz.re.kr:8002/2/stream2"],
      "Latitude":["37.557406"],"Longitude":["126.861532"],
      "DeviceUser":["admin"],"DevicePassword":["1234"],
      "RecordingServer":[{"Address":["naiz.re.kr"],"Port":["8002"],
      "RtspPort":["554"],"ID":["admin"],"Password":["admin"],"Channel":["2"]}],
      "UserField":[{"FieldName":["IntegratedDeviceID"],"FieldValue":["999999990304"]}]}
*/
function processCameraGroupList(serverId: string, vmsData: Object) : Array<VMSCameraGroup> {
  let result : Array<VMSCameraGroup> = []
  let CameraGroupList = vmsData['CameraGroup']['CameraGroupList'][0]
  let CameraGroupListItem = CameraGroupList['CameraGroupListItem']
  debug(`CameraGroupList: ${CameraGroupListItem.length}`)
  for (let groupItem of CameraGroupListItem) {
    let vmsCameraGroup = new VMSCameraGroup(serverId)
    vmsCameraGroup.vmsGroupKey = groupItem['Key'][0]
    vmsCameraGroup.vmsGroupName = groupItem['Name'][0]
    let CameraListItem = groupItem['CameraListItem']
    if (!CameraListItem)  // 하위 노드가 없는 경우 무시
      continue
    for (let cameraItem of CameraListItem) {
      let name = cameraItem['Name'][0]
      let chType = chTypeFromCameraName(name)
      let enable = parseInt(cameraItem['Enable'][0]) != 0
      let key = cameraItem['Key'][0]
      if (chType == 0) {
        if (!enable)
          continue
        // 이름으로 못찾는 경우 순차적으로 chType적용
        chType = vmsCameraGroup.cameras.length + 1
        debug(`assign undetermined name to type: key=${key} name=${name} -> ${chType}`)
        if (chType > 4)
          continue
      }
      let vmsCamera = new VMSCamera()
      vmsCamera.chType = chType
      vmsCamera.vmsName = name
      vmsCamera.vmsKey = key
      vmsCamera.vmsEnable = enable
      vmsCamera.vmsUrl1 = cameraItem['RTSP_URL1'][0]
      vmsCamera.vmsUrl2 = cameraItem['RTSP_URL2'][0]
      vmsCameraGroup.cameras.push(vmsCamera)
    }
    debug(`CameraGroup: [${result.length}]${vmsCameraGroup.vmsGroupName}->${vmsCameraGroup.cameras.length}`)
    result.push(vmsCameraGroup)
  }
  return result
}

function processEventStatus(vmsData: Object) : Array<VMSEventStatus> {
  let result : Array<VMSEventStatus> = []
  let EventStatusList = vmsData['Event']['EventStatusList'][0]
  let EventStatusListItem = EventStatusList['EventStatusListItem']
  debug(`CameraGroupList: ${EventStatusListItem.length}`)
  for (let eventStatusItem of EventStatusListItem) {
    let vmsEventStatus = new VMSEventStatus()
    vmsEventStatus.Key = eventStatusItem['Key'][0]
    vmsEventStatus.HighStreamConnection = parseInt(eventStatusItem['HighStreamConnection'][0]) != 0
    vmsEventStatus.LowStreamConnection = parseInt(eventStatusItem['LowStreamConnection'][0]) != 0
    result.push(vmsEventStatus)
  }
  return result
}

export async function getVMSGroupList(serverId: string, serverAddr: string, id: string, password: string, withStatusUpdate: boolean)
  : Promise<Array<VMSCameraGroup>> {
  let url = `${serverAddr}/camera_group/list.cgi?id=${id}&password=${password}&key=all&method=get`
  let xmlData : string
  try {
    xmlData = await requestToVMS(url)
  } catch (ex) {
    logger.error(`VMS request error=> ${ex.message}`)
    throw ex
  }
  let dataObject = await parseStringPromise(xmlData)
  //debug(JSON.stringify(dataObject))
  let result = processCameraGroupList(serverId, dataObject)
  if (!withStatusUpdate) {
    return result
  } else {
    await updateCameraStatus(serverAddr, id, password, result)
  }

  return result
}

export async function updateCameraStatus(serverAddr: string, id: string, password: string, cameraGroupList: Array<VMSCameraGroup>)
  : Promise<void> {
  let eventStatusList = await getVMSEventStatus(serverAddr, id, password)
  for (let cameraGroup of cameraGroupList) {
    for (let camera of cameraGroup.cameras) {
      var index = eventStatusList.findIndex(eventStatus => eventStatus.Key === camera.vmsKey)
      if (index < 0) {
        debug(`vmsKey not found: ${camera.vmsKey}`)
      } else {
        camera.vmsOnline1 = eventStatusList[index].HighStreamConnection
        camera.vmsOnline2 = eventStatusList[index].LowStreamConnection
        debug(`camera event update: key=${camera.vmsKey} ${camera.vmsName} vmsOnline1=${camera.vmsOnline1} vmsOnline2=${camera.vmsOnline2}`)
      }
    }
  }
}

export async function getVMSEventStatus(serverAddr: string, id: string, password: string)
  : Promise<Array<VMSEventStatus>> {
  let url = `${serverAddr}/event/status.cgi?id=${id}&password=${password}&key=all&method=get`
  let xmlData : string
  try {
    xmlData = await requestToVMS(url)
  } catch (ex) {
    debug(`VMS response=> ${ex.message}`)
    throw ex
  }
  let dataObject = await parseStringPromise(xmlData)
  //debug(JSON.stringify(dataObject))
  return processEventStatus(dataObject)
}

export async function requestToVMS(url: string) : Promise<string> {
  debug(`axios.get ${url}`)
  let res = await axios({
    url,
    method: "GET",
    responseType: "arraybuffer" // EUC-KR --> UTF-8 변환을 위해 필요함
  })
  // 서버 응답은 EUC-KR로 인코딩되어 있음으로 utf8로 변경
  // <?xml version="1.0" encoding="EUC-KR"?>
  let text = iconv.decode(res.data, 'EUC-KR')
  return text
}

