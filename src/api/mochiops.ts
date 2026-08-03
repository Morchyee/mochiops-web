// src/api/mochiops.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://159.195.158.129:8000/api';
const API_KEY = '3caaede8a8f420982a74e9ebb92306143b2c07cc8c8abda27be35878be90aa66';

export interface SystemMetrics {
  cpu_usage_percent: number;
  memory_used_gb: number;
  memory_total_gb: number;
  memory_percent: number;
  disk_percent: number;
}

export interface ContainerInfo {
  id: string;
  name: string;
  status: string;
  image: string;
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
  const res = await fetch(`${BASE_URL}/system/metrics`, {
    headers: { 'X-API-Key': API_KEY },
  });
  if (!res.ok) throw new Error('获取系统指标失败');
  return res.json();
}

export async function getContainers(): Promise<ContainerInfo[]> {
  const res = await fetch(`${BASE_URL}/containers`, {
    headers: { 'X-API-Key': API_KEY },
  });
  if (!res.ok) throw new Error('获取容器列表失败');
  return res.json();
}