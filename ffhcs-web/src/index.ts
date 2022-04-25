import './LoadEnv'; // Must be the first import
import Debug from "debug";
const debug = Debug("ffhcs:index")
import app from './Server';
import logger from '@shared/Logger';
import {Database, Server} from './Config'
import {openDatabase} from '@daos/Instance'
import vmsChecker from './VMS'

async function connectDatabase () {
  debug(`connect database: ${Database.driver}`)
  const knexInstance = await openDatabase(Database.driver)
  const numUsers = await knexInstance.count().from('users')
  debug('DB ACCESS CHECKING ok: numUsers=', numUsers)
}

// VMS 컨텐츠 체크
async function loadVMSData() {
  debug(`loadVMSData`)
  await vmsChecker.loadInitialData()
  await vmsChecker.syncCameraStatus()
}

Promise.all([
  connectDatabase(),
]).then((results) => {
  loadVMSData() // connectDatabase() 완전히 끝난후 수행해야 DB instance를 획득할 수 있음
  vmsChecker.startChecker()
  app.listen(Server.port, () => {
    logger.info(`Web server started on port: ${Server.port}`);
  })
}).catch((error) => {
  logger.error('app error:', error)    
})
