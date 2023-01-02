import request from '@/utils/request'


// 获取交换机下拉列表
export function queryExchangeSelect() {
  return request({
    url: '/binding/exchange',
    method: 'get'
  })
}

// 进行添加设备
export function addEquipment(data) {
  return request({
    url: '/equipment/add',
    method: 'post',
    data: data
  })
}

// 获取设备列表
export function queryEquipmentLis(data) {
  return request({
    url: '/equipment/list',
    method: 'post',
    data: data
  })
}

