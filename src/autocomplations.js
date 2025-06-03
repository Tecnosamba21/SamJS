import { keywords } from './autocomplations/keywords'
import { functions } from './autocomplations/functions'
import { classes } from './autocomplations/classes'
import { variables } from './autocomplations/variables'

const completions = [
    ...variables,
    ...keywords,
    ...functions,
    ...classes
]

function extractVariables(code) {
    const varRegex = /\b(?:let|const|var)\s+([a-zA-Z_$][\w$]*)/g
    const funcParamRegex = /function\s+[a-zA-Z_$][\w$]*\s*\(([^)]*)\)/g
    const arrowFuncParamRegex = /\(([^)]*)\)\s*=>/g

    const extractedVariables = new Set()
    let match

    while ((match = varRegex.exec(code)) !== null) {
        extractedVariables.add(match[1])
    }

    while ((match = funcParamRegex.exec(code)) !== null) {
        const params = match[1].split(',').map(p => p.trim()).filter(Boolean)
        for (const param of params) {
            extractedVariables.add(param)
        }
    }

    while ((match = arrowFuncParamRegex.exec(code)) !== null) {
        const params = match[1].split(',').map(p => p.trim()).filter(Boolean)
        for (const param of params) {
            extractedVariables.add(param)
        }
    }

    return Array.from(extractedVariables)
}

function extractFunctions(code) {
    const regex = /\b(?:function)\s+([a-zA-Z_$][\w$]*)/g
    const extractedFunctions = new Set()
    let match

    while ((match = regex.exec(code)) !== null) {
        extractedFunctions.add(match[1])
    }

    return Array.from(extractedFunctions)
}

export function globalCompletions(context) {
    if (!context) return null

    const currentWord = context.matchBefore(/\w*/)

    if (currentWord.from === currentWord.to && !context.explicit) return null

    const codeVariables = extractVariables(context.state.doc.toString())
    const codeFunctions = extractFunctions(context.state.doc.toString())

    const codeComplations = completions.concat(codeVariables?.map(variable => ({
        label: variable,
        type: 'variable'
    }))).concat(codeFunctions?.map(func => ({
        label: func,
        type: 'function'
    })))

    return {
        from: currentWord.from,
        options: codeComplations
    }
}