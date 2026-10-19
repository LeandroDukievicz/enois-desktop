import { copyFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export default async function includeLicenseNotices({ appOutDir, electronPlatformName }) {
  if (electronPlatformName !== 'linux') return
  // The legacy Snap target omits these files from the root of the Electron binary.
  // Keep their notices in a directory that is included in the distributable.
  const destination = join(appOutDir, 'licenses')
  await mkdir(destination, { recursive: true })
  await copyFile(join(appOutDir, 'LICENSE.electron.txt'), join(destination, 'Electron-LICENSE.txt'))
  await copyFile(
    join(appOutDir, 'LICENSES.chromium.html'),
    join(destination, 'Chromium-LICENSES.html'),
  )
}
