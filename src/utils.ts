import os from 'node:os'

export function getCpuUsage() {
  const cpus = os.cpus()

  let totalTime = 0
  let totalIdle = 0

  for (const cpu of cpus) {
    for (const time of Object.values(cpu.times)) {
      totalTime += time
    }

    totalIdle += cpu.times.idle
  }

  return 100 - Math.round((totalIdle / totalTime) * 100)
}

export function getRamInformation() {
  const totalRam = os.totalmem()

  return {
    ramUsage: 100 - Math.round((os.freemem() / totalRam) * 100),
    totalRam,
  }
}
