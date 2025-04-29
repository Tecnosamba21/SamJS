import './App.css'
import { useEffect, useRef, useState } from 'react'
import JsRunner from '/src/jsRunner.js?worker'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { githubLightInit } from '@uiw/codemirror-theme-github'
import { Compartment, EditorState } from '@codemirror/state'
import { globalCompletions } from './autocomplations'
import { autocompletion } from '@codemirror/autocomplete'

function App() {

  const darkTheme = {
    '&': {
      height: '100%',
      width: '100%'
    },
    '.cm-gutters': {
      'display': 'none'
    },
    '.cm-content': {
      'background-color': '#313131',
      'font-family': 'Fira Code',
      'padding': '9px'
    },
    '.cm-content::selection': {
      'background-color': 'purple'
    }
  }

  const lightTheme = {
    '&': {
      height: '100%',
      width: '100%'
    },
    '.cm-gutters': {
      'display': 'none'
    },
    '.cm-content': {
      'background-color': 'white',
      'font-family': 'Fira Code',
      'padding': '9px'
    },
    '.cm-content::selection': {
      'background-color': 'purple'
    }
  }

  const runner = useRef(null)
  const [code, setCode] = useState(localStorage.getItem('code') || 'console.log("Edit this code")')
  const [log, setLog] = useState([])
  const [theme, setTheme] = useState('dark')
  const [editorTheme, setEditorTheme] = useState(oneDark)
  const [stylesTheme, setStylesTheme] = useState(EditorView.theme(darkTheme))
  const editor = useRef(null)
  const editorDiv = useRef(null)
  const themeCompartment = useRef(new Compartment).current
  const stylesCompartment = useRef(new Compartment).current

  const githubLight = githubLightInit()

  useEffect(() => {
    runner.current = new JsRunner()
    const messageHandler = e => {
      if (e.data.type === 'log') {
        setLog(log => [...log, <br />, <span className='log'>'{e.data.content}'</span>])
      }
      if (e.data.type === 'error') {
        setLog(log => [...log, <br />, <span className='error'>❌ {e.data.content}</span>])
      }
      if (e.data.type === 'warning') {
        setLog(log => [...log, <br />, <span className='warn'>⚠️ {e.data.content}</span>])
      }
      if (e.data.type === 'alert') {
        alert(e.data.content)
      }
    }
    runner.current.onmessage = e => messageHandler(e)
    return () => runner.current.terminate()
  }, [])

  useEffect(() => {
    runner.current.postMessage(code)
  }, [])

  useEffect(() => {

    if (editor.current || !editorDiv.current) return

    if (editor.current) {
      editor.current.destroy()
    }

    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        const currentCode = update.state.doc.toString()
        setCode(currentCode)
        setLog([])
        localStorage.setItem('code', currentCode)
        runner.current.postMessage(currentCode)
      }
    })

    editor.current = new EditorView({
      state: EditorState.create({
        doc: code,
        extensions: [basicSetup, javascript(), themeCompartment.of(editorTheme), stylesCompartment.of(stylesTheme), updateListener, autocompletion({override: [globalCompletions]})],
      }),
      parent: editorDiv.current
    })
  }, [])

  const changeTheme = () => {

    let newTheme
    let newStyles

    if (theme === 'dark') {
      setTheme('light')
      newTheme = githubLight
      newStyles = EditorView.theme(lightTheme)
    }
    else {
      setTheme('dark')
      newTheme = oneDark
      newStyles = EditorView.theme(darkTheme)
    }

    setEditorTheme(newTheme)

    editor.current.dispatch({
      effects: [themeCompartment.reconfigure(newTheme), stylesCompartment.reconfigure(newStyles)]
    })
  }

  return (
    <>
      <header style={theme === 'dark' ? { backgroundColor: '#313131', borderBottom: '1.5px solid #8e8e8e' } : { backgroundColor: 'white', borderBottom: '1.5px solid black', color: 'black' }}>
        <h1 style={{color: '#38b6ff'}}>Sam<span style={{ color: 'yellow' }}>JS</span></h1>
        <button id='theme' onClick={changeTheme}>{theme === 'dark' ? '🌙' : '☀️'}</button>
      </header>
      <main >
        <div id='editor' ref={editorDiv} style={theme === 'dark' ? { '--border': '#8e8e8e' } : { '--border': 'black' }} />
        <div id='log' style={theme === 'dark' ? { backgroundColor: '#313131' } : { backgroundColor: 'white' }}>{log}</div>
      </main>
    </>
  )
}

export default App
