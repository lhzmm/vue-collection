/* eslint-disable import/prefer-default-export */
export interface FileDescription{
  /**
   * 文件标识
   */
  id:string|number
  /**
   * 上传后的文件地址
   */
  url:string
  /**
   * 文件名称
   */
  name:string
  /**
   * 文件是否在上传中
   */
  loading:boolean
}

export function defineFileList(list: FileDescription[]):FileDescription[] {
  if (list.some((item) => item.id == null)) {
    console.error('defineFileList中每一项必须指定id')
  }
  return list
}
