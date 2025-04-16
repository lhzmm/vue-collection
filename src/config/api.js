
// 接口前缀
/* eslint-disable-next-line import/no-mutable-exports */
let baseURL = 'https://web.dcyun.com:48469/emergency'

if (process.env.NODE_ENV === 'development') {
  // baseURL = 'http://192.168.8.11:40002'
}

export {
  baseURL,
}
