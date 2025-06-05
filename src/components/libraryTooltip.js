import { hoverTooltip } from "@codemirror/view";
import { formatVersion } from "../lib/utils";

function detectCDN(url) {
    if (url.includes('esm.sh')) {
        const [, name, version] = url.match(/esm\.sh\/([^@]+)@?([^/?]*)/) || []
        return { provider: 'esm.sh', name, version }
    }

    if (url.includes('cdn.skypack.dev')) {
        const [, name] = url.match(/cdn\.skypack\.dev\/([^@]+)/) || []
        const [, version] = url.match(/@([^@/]+)/) || []
        return { provider: 'skypack', name, version }
    }

    if (url.includes('unpkg.com')) {
        const [, name, version] = url.match(/unpkg\.com\/([^@]+)@?([^/]+)/) || []
        return { provider: 'unpkg', name, version }
    }

    if (url.includes('jsdelivr.net')) {
        const [, name, version] = url.match(/npm\/([^@]+)@?([^/]+)/) || []
        return { provider: 'jsdelivr', name, version }
    }

    return { provider: 'custom', name: null, version: null }
}

export const libraryTooltip = hoverTooltip((view, pos) => {
    const word = view.state.wordAt(pos)

    if (!word) return null

    const line = view.state.doc.lineAt(pos)
    const text = line.text

    const regex = /require\(['"]([^'"]+)['"]\)/g

    if (!text.includes('require')) return null

    const match = regex.exec(text)
    if (!match[1]) return null

    const { name, version } = detectCDN(match[1])

    return {
        pos: word.from,
        end: word.to,
        above: true,
        create() {
            const toolTip = document.createElement('div')
            toolTip.className = 'cm-tooltip cm-tooltip-hover'
            toolTip.innerHTML = `
            <div class="require-tooltip">
                <h2 class="title"><strong>${name ? name : ''}</strong>@${formatVersion(version)}</h2>
                🔗 <a href=${match[1]} target="_blank">${match[1]}</a><br>
                ${name ? 'Loading description...' : ''}
            </div>
            `

            if (name) {
                fetch(`https://registry.npmjs.org/${name}`)
                    .then(res => res.json())
                    .then(response => {
                        toolTip.innerHTML = `
                        <div class="require-tooltip">
                            <h2 class="title"><strong>${name ? name : ''}</strong>@${formatVersion(version)}</h2>
                            🔗 <a href=${match[1]} target="_blank">${match[1]}</a><br>
                            🧑‍💻 <span>${response['versions'][formatVersion(version)]['_npmUser']['name']}</span><br>
                            <br>
                            <p>${response.description}</p>
                        </div>
                        `
                    })
                    .catch(() => {
                        toolTip.innerHTML = `
                        <div class="require-tooltip">
                            <h2 class="title"><strong>${name ? name : ''}</strong>@${formatVersion(version)}</h2>
                            🔗 <a href=${match[1]} target="_blank">${match[1]}</a><br>
                            <span>⚠️ Error when loading the description</span>
                        </div>
                        `
                    })
                }

            return { dom: toolTip }
        }
    }
})