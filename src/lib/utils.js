export function formatVersion(version) {
    let versionArray = version.split('.')

    while (versionArray.length < 3) versionArray.push('0')

    return versionArray.join('.')
}