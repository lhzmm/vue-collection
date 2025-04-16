import type { 
  IPromiseAxiosConfig, 
  IPromiseAxiosErrorValue, 
  AllowedRequestMethod,
  IPromiseAxiosThenValue 
} from '@lhzmm/tools/dist/@types/ajax/abstract'
import { Ajax, PENDING } from '@lhzmm/tools'
import type { AxiosResponse } from 'axios'
import { baseURL } from '@/config/api'

const defaultOptions = {
  baseURL,
  // withCredentials: true,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
  timeout: 60000, // 默认60s请求超时
  //   validateStatus: function (status) {
  //     return status >= 200 && status < 300; // default
  //   },
}

// 当token过期时,当前是否已发送login请求
let reLogin = false
const instance = new Ajax(defaultOptions)

interface IOtherResponse<T> {
  data: T;
  config: IPromiseAxiosConfig;
  response: AxiosResponse<T>;
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line import/prefer-default-export
export function createAjax<T>(url: string, method?: AllowedRequestMethod) {
  // eslint-disable-next-line arrow-body-style
  return (data: any, extraConfig?: IPromiseAxiosConfig): Promise<T | Blob> => {
    let token = 'test-token'
    if (token) {
      extraConfig = extraConfig || {}
      extraConfig.headers = extraConfig.headers || {}
      extraConfig.headers.token = extraConfig.headers.token || token
    }
    return instance.createAjax<T>(url, method)(data, extraConfig)
      .catch((e: IPromiseAxiosErrorValue | IPromiseAxiosThenValue<string> | IOtherResponse<Blob>) => {
        if ('error' in e) {
          if (e.error.response) {
            const { status, config } = e.error.response
            if (status === 401) {
              if (reLogin) return PENDING

              reLogin = true
              // ElMessageBox.alert('登录失败，请重新登录', '提醒', {
              //   confirmButtonText: '确定',
              //   showClose: false,
              //   type: 'warning',
              //   center: true,
              //   callback: () => {
              //     window.sessionStorage.clear()
              //     window.location.href = 'https://sgpt.zjwater.com/zjslsgpt/report/#/index'
              //   },
              // })
              instance.pendingSourceMap.forEach((sources) => { sources.forEach((sourceItem) => sourceItem.source.cancel()) })
              setTimeout(() => { reLogin = false }, 0)
              return PENDING
            }

            if (status < 200 || status >= 300) {
              if (!e.config.customErrorHandler && (!e.error.response?.data?.message?.includes('timeout') || !e.error.response.data.errmsg.includes('timeout'))) {
                // ElMessage.error(e.error.response.data.errmsg || e.error.response.data.message)
              }
              return Promise.reject(e)
            }
          }
          if (!e.config.customErrorHandler && !e.error.message?.includes('timeout')) {
            // ElMessage.error(e.error.message)
          }
          return Promise.reject(e)
        }

        if (e.data instanceof Blob) {
          // @ts-ignore
          // eslint-disable-next-line no-underscore-dangle
          e.data.__headers = e.response.headers
          return Promise.resolve(e.data)
        }

        if (!e.config.customErrorHandler && !e.data.message?.includes('timeout')) {
          // ElMessage.error(e.data.errmsg || e.data.message)
        }
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({ config: e.config, error: { response: { data: e.data } } })
      })
  }
}
