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

// 通过id获取详细信息
export function queryEquipmentById(param) {
  return request({
    url: `/equipment/get/${param}`,
    method: 'get'
  })
}

// 进行修改设备信息
export function editEquipment(data) {
  return request({
    url: '/equipment/edit',
    method: 'post',
    data: data
  })
}

// 修改设备状态
export function editEquipmentStatus(id,status) {
  const data = {
    id,
    status
  }
  return request({
    url: '/equipment/update/status',
    method: 'post',
    data: data
  })
}

// 删除设备信息
export function delEquipment(param) {
  return request({
    url: `/equipment/delete/${param}`,
    method: 'delete'
  })
}


