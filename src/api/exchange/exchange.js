import request from '@/utils/request'

// 获取交换机列表
export function exchangeList(data) {
  return request({
    url: '/exchange/list',
    method: 'post',
    data: data
  })
}

// 修改交换机信息（或改变状态）
export function exchangeEdit(data) {
  return request({
    url: '/exchange/edit',
    method: 'post',
    data: data
  })
}

// 添加交换机信息
export function exchangeAdd(data) {
  return request({
    url: '/exchange/add',
    method: 'post',
    data: data
  })
}

// 通过id查询交换机信息
export function getExchangeById(param) {
  return request({
    url: `/exchange/get/${param}`,
    method: 'get'
  })
}

// 修改状态信息
export function editExchangeStatus(id, status) {
  const data = {
    id,
    status
  }
  return request({
    url: 'exchange/edit/status',
    method: 'post',
    data: data
  })
}

// 删除交换机信息
export function delExchange(param) {
  return request({
    url: `exchange/delete/${param}`,
    method: 'delete'
  })
}
