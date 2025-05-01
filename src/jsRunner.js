onmessage = e => {
    try {
        eval(`
            console.log = data => {
                if (data != null) {
                    if (typeof data === 'object') {
                        postMessage({content: JSON.stringify(data, null, ' '), type: 'log'})
                    } else {
                        postMessage({content: data.toString(), type: 'log'})
                    }
                }
            }
            console.error = data => {
                if (data == null) return
                if (typeof data === 'object') {
                    postMessage({content: JSON.stringify(data, null, ' '), type: 'error'})
                } else {
                    postMessage({content: data.toString(), type: 'error'})
                }
            }
            console.warning = data => {
                if (data == null) return
                if (typeof data === 'object') {
                        postMessage({content: JSON.stringify(data, null, ' '), type: 'warning'})
                } else {
                    postMessage({content: data.toString(), type: 'warning'})
                }
            }
            console.warn = data => console.warning(data)
            console.info = data => {
                if (data == null) return
                if (typeof data === 'object') {
                        postMessage({content: JSON.stringify(data, null, ' '), type: 'info'})
                } else {
                    postMessage({content: data.toString(), type: 'info'})
                }
            }
            const require = async packageUrl => {
                try {
                    const packageModule = await import(packageUrl)
                    if (packageModule['default'] == null) return packageModule
                    return packageModule.default
                } catch(err) { postMessage({content: err.toString(), type: 'error'}) }
            }
            const __$__userCode = async () => {
                ${e.data}
            }
            __$__userCode()
        `)
    } catch (err) {
        postMessage({ content: err.toString(), type: 'error' })
    }
}