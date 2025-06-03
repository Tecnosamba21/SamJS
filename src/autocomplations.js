import { completeFromList } from '@codemirror/autocomplete'
import { keywords } from './autocomplations/keywords'
import { functions } from './autocomplations/functions'
import { classes } from './autocomplations/classes'
import { variables } from './autocomplations/variables'

export const globalCompletions = completeFromList([
    ...variables,
    ...keywords,
    ...functions,
    ...classes
])