/**
 * HealthPlanetで取ってきたデータをGoogleSpreadSheetに書き込むFirebase Function
 */

import * as functions from 'firebase-functions'
import * as dayjs from 'dayjs'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

import 'dayjs/locale/ja'
dayjs.locale('ja')

import { InnerScanData, InnerScanDataInformation, HealthData } from './type'

function transformInnerScanData(
  innerScanDataList: InnerScanData[]
): HealthData[] {
  const transformedData: { [key: string]: HealthData } = {}

  for (let innerScanData of innerScanDataList) {
    const { date, keydata, tag } = innerScanData
    const datetime = dayjs(date).subtract(3, 'hour').format('YYYY-MM-DD') // 寝るまでが一日なので...
    const tagName = tag == '6021' ? 'weight' : 'bfp'

    transformedData[datetime] = Object.assign(transformedData[datetime] || {}, {
      date: datetime,
      [tagName]: keydata,
    })
  }

  return Object.values(transformedData).sort((a, b) =>
    dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1
  )
}

async function fetchInnerScanData(): Promise<InnerScanDataInformation> {
  const HEALTH_PLANET_ACCESS_TOKEN = process.env[
    'HEALTH_PLANET_ACCESS_TOKEN'
  ] as string

  const options: AxiosRequestConfig = {
    url: 'https://www.healthplanet.jp/status/innerscan.json',
    method: 'GET',
    params: {
      access_token: HEALTH_PLANET_ACCESS_TOKEN,
      tag: [6021, 6022],
      date: 0,
    },
  }

  const { data }: AxiosResponse<InnerScanDataInformation> = await axios(options)
  return data
}

exports.recordHealthData = functions
  .region('asia-northeast1')
  .pubsub.schedule('0 0,12 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const innerScanDataList = await fetchInnerScanData()
    const healthDataList = transformInnerScanData(innerScanDataList.data)

    const GAS_URL = process.env['GAS_URL'] as string
    axios.post(GAS_URL, {
      health_data: healthDataList,
    })
  })
