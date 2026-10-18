const { createRequire } = require('node:module')
const { copyFile, chmod } = require('node:fs/promises')
const { dirname, join } = require('node:path')

// electron-builder 26.15.3's legacy launcher references these scripts, but its
// downloaded template omits them. Copy the exact versioned upstream scripts.
module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'linux') return
  const builderRequire = createRequire(require.resolve('electron-builder/package.json'))
  const templates = join(
    dirname(builderRequire.resolve('app-builder-lib/package.json')),
    'templates/snap',
  )
  for (const name of ['desktop-init.sh', 'desktop-common.sh', 'desktop-gnome-specific.sh']) {
    const destination = join(context.appOutDir, name)
    await copyFile(join(templates, name), destination)
    await chmod(destination, 0o755)
  }
}
