import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cpu, HardDrive, Server, Activity } from 'lucide-react'
import { getSystemMetrics, getContainers, SystemMetrics, ContainerInfo } from '@/api/mochiops'

export function Dashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [containers, setContainers] = useState<ContainerInfo[]>([])

  const fetchData = async () => {
    try {
      const [m, c] = await Promise.all([getSystemMetrics(), getContainers()])
      setMetrics(m)
      setContainers(c)
    } catch (err) {
      console.error('加载监控失败:', err)
    }
  }

  useEffect(() => {
    fetchData()
    // 每 3 秒自动定时刷新指标
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>MochiOps 实时监控面板</h2>
        <p className='text-muted-foreground'>服务器系统硬件与 Docker 容器运行状态</p>
      </div>

      {/* 1. CPU / 内存 / 磁盘 / 容器数 核心指标卡片 */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* CPU 卡片 */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>CPU 使用率</CardTitle>
            <Cpu className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics ? `${metrics.cpu_usage_percent}%` : '加载中...'}</div>
            <p className='text-xs text-muted-foreground'>实时处理器负载</p>
          </CardContent>
        </Card>

        {/* 内存卡片 */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>内存占用</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {metrics ? `${metrics.memory_used_gb} / ${metrics.memory_total_gb} GB` : '加载中...'}
            </div>
            <p className='text-xs text-muted-foreground'>占用率: {metrics?.memory_percent}%</p>
          </CardContent>
        </Card>

        {/* 磁盘卡片 */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>磁盘使用率</CardTitle>
            <HardDrive className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics ? `${metrics.disk_percent}%` : '加载中...'}</div>
            <p className='text-xs text-muted-foreground'>主分区空间</p>
          </CardContent>
        </Card>

        {/* Docker 容器数量 */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>运行容器数</CardTitle>
            <Server className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{containers.length} 个</div>
            <p className='text-xs text-muted-foreground'>Docker 容器</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Docker 容器运行状态列表 */}
      <Card className='p-4'>
        <CardHeader>
          <CardTitle>容器状态看板</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {containers.map((c) => (
              <div key={c.id} className='flex items-center justify-between border-b pb-2 text-sm'>
                <div>
                  <div className='font-semibold'>{c.name}</div>
                  <div className='text-xs text-muted-foreground'>{c.image}</div>
                </div>
                <span className='px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-xs font-mono'>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 底部加上这句，同时兼容 import Dashboard 和 import { Dashboard }
export default Dashboard