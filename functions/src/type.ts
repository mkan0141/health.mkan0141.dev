export type InnerScanData = {
  date: string
  keydata: string
  model: string
  tag: string
}

export type InnerScanDataInformation = {
  data: InnerScanData[]
  birthday: string
  height: string
  sex: string
}

export type HealthData = {
  date: string
  weight?: number
  bfp?: number
}
