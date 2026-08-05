// src/api/mochiops.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const API_KEY = import.meta.env.VITE_MOCHIOPS_API_KEY || ''

export interface SystemMetrics {
  cpu_usage_percent: number
  memory_used_gb: number
  memory_total_gb: number
  memory_percent: number
  disk_percent: number
}

export interface ContainerInfo {
  id: string
  name: string
  status: string
  image: string
}

interface BackendSystemMetrics {
  cpu_percent: number
  memory: { total: number; available: number; used: number; percent: number }
  disk: { total: number; used: number; free: number; percent: number }
}

const GB = 1024 ** 3

export async function getSystemMetrics(): Promise<SystemMetrics> {
  const res = await fetch(`${BASE_URL}/system/metrics`, {
    headers: { 'X-API-Key': API_KEY },
  })
  if (!res.ok) throw new Error('获取系统指标失败')
  const data: BackendSystemMetrics = await res.json()
  return {
    cpu_usage_percent: data.cpu_percent,
    memory_used_gb: Math.round((data.memory.used / GB) * 100) / 100,
    memory_total_gb: Math.round((data.memory.total / GB) * 100) / 100,
    memory_percent: data.memory.percent,
    disk_percent: data.disk.percent,
  }
}

export async function getContainers(): Promise<ContainerInfo[]> {
  const res = await fetch(`${BASE_URL}/containers`, {
    headers: { 'X-API-Key': API_KEY },
  })
  if (!res.ok) throw new Error('获取容器列表失败')
  const data = (await res.json()) as Array<{
    id: string
    name: string
    status: string
    image: string[] | string
  }>
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    image: Array.isArray(c.image) ? c.image.join(', ') : c.image,
  }))
}
