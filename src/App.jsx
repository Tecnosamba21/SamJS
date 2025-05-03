import './App.css'
import './hint.css'
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
    '::selection': {
      color: 'hotpink'
    },
    '.cm-button': {
      'border': '0',
      'margin': '5px',
      'width': 'fit-content',
      'height': 'fit-content',
      'padding': '5px',
      'border-radius': '4px',
      'background-color': '#313131',
      'background-image': 'none',
      'font-family': 'Fira Code'
    },
    '.cm-search': {
      'font-family': 'Fira Code'
    },
    '.cm-textfield': {
      'border-radius': '4px',
      'font-family': 'Fira Code'
    },
    '.cm-tooltip': {
      'border-radius': '4px'
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
    '::selection': {
      'color': 'hotpink'
    },
    '.cm-button': {
      'margin': '5px',
      'width': 'fit-content',
      'height': 'fit-content',
      'padding': '5px',
      'border-radius': '4px',
      'background-color': 'white',
      'border': '1.5px solid black',
      'background-image': 'none',
      'font-family': 'Fira Code'
    },
    '.cm-search': {
      'font-family': 'Fira Code'
    },
    '.cm-textfield': {
      'border-radius': '4px',
      'font-family': 'Fira Code'
    },
    '.cm-tooltip': {
      'border-radius': '4px'
    }
  }

  const githubLight = githubLightInit()
  let isShared = false

  const runner = useRef(null)
  const [code, setCode] = useState(localStorage.getItem('code') || 'console.log("Hello, world!")')
  const [log, setLog] = useState([])
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [editorTheme, setEditorTheme] = useState(theme === 'dark' ? oneDark : githubLight)
  const [stylesTheme, setStylesTheme] = useState(theme === 'dark' ? EditorView.theme(darkTheme) : EditorView.theme(lightTheme))
  const [copyToolTip, setCopyToolTip] = useState('Copy shareable link')
  const [packages, setPackages] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const editor = useRef(null)
  const editorDiv = useRef(null)
  const themeCompartment = useRef(new Compartment).current
  const stylesCompartment = useRef(new Compartment).current
  const isSharedRef = useRef(isShared)


  useEffect(() => {
    runner.current = new JsRunner()
    const messageHandler = e => {
      if (e.data.type === 'clear') {
        setLog([])
      }
      if (e.data.type === 'log') {
        setLog(log => [...log, <br />, <span className='log'>{e.data.content.split('')[0] === '{' ? e.data.content : `'${e.data.content}'`}</span>])
      }
      if (e.data.type === 'error') {
        setLog(log => [...log, <br />, <span className='error'>❌ {e.data.content}</span>])
      }
      if (e.data.type === 'warning') {
        setLog(log => [...log, <br />, <span className='warn'>⚠️ {e.data.content}</span>])
      }
      if (e.data.type === 'info') {
        setLog(log => [...log, <br />, <span className='info'>ℹ️ {e.data.content}</span>])
      }
    }
    runner.current.onmessage = e => messageHandler(e)
    return () => runner.current.terminate()
  }, [])


  useEffect(() => {

    if (editor.current || !editorDiv.current) return

    if (editor.current) {
      editor.current.destroy()
    }

    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        setLog([])
        const currentCode = update.state.doc.toString()
        setCode(currentCode)
        localStorage.setItem('code', currentCode)
        runner.current.postMessage(currentCode)
      }
    })

    editor.current = new EditorView({
      state: EditorState.create({
        doc: code,
        extensions: [basicSetup, javascript(), themeCompartment.of(editorTheme), stylesCompartment.of(stylesTheme), updateListener, autocompletion({ override: [globalCompletions] })],
      }),
      parent: editorDiv.current
    })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('c')

    if (encoded) {
      isSharedRef.current = true
      const decoded = decodeURIComponent(atob(encoded))
      editor.current?.dispatch({
        changes: { from: 0, to: editor.current.state.doc.length, insert: decoded }
      })
    }
  }, [])

  useEffect(() => {
    if (!isSharedRef.current) runner.current.postMessage(code)
  }, [])

  const changeTheme = () => {

    let newTheme
    let newStyles

    if (theme === 'dark') {
      setTheme('light')
      localStorage.setItem('theme', 'light')
      newTheme = githubLight
      newStyles = EditorView.theme(lightTheme)
    }
    else {
      setTheme('dark')
      localStorage.setItem('theme', 'dark')
      newTheme = oneDark
      newStyles = EditorView.theme(darkTheme)
    }

    setEditorTheme(newTheme)

    editor.current.dispatch({
      effects: [themeCompartment.reconfigure(newTheme), stylesCompartment.reconfigure(newStyles)]
    })
  }

  const copyShareableLink = () => {
    const EncryptedUrl = btoa(encodeURIComponent(editor.current.state.doc.toString()))
    const url = `${window.location.origin}?c=${EncryptedUrl}`

    navigator.clipboard.writeText(url)
      .then(() => {
        setCopyToolTip('Copied!')
        setTimeout(() => setCopyToolTip('Copy shareable link'), 1000)
      })
  }

  const searchPackage = async e => {
    if (e.key === 'Enter' && e.target.value) {
      setPackages([])
      fetch(`https://api.npms.io/v2/search?q=${e.target.value}`)
        .then(res => res.json())
        .then(response => {
          Array.from(response.results).forEach(packageData => {
            setPackages(packages => [...packages, <section onClick={() => {
              editor.current.dispatch({
                changes: {
                  from: 0,
                  insert: `const ${packageData.package.name.replace(/[-/@.]/g, '_')} = await require('https://esm.sh/${packageData.package.name}@latest')\n\n`
                }
              })
              setDialogOpen(false)
            }}><span>{packageData.package.name}</span><span>{packageData.package.publisher.username}</span></section>])
          })
        })
    }
  }

  return (
    <>
      <header style={theme === 'dark' ? { backgroundColor: '#313131', borderBottom: '1.5px solid #8e8e8e' } : { backgroundColor: 'white', borderBottom: '1.5px solid black', color: 'black' }}>
        <h1 style={{ color: '#38b6ff' }}>Sam<span style={{ color: 'yellow' }}>JS</span></h1>
        <div className="buttons">
          <button id='packageSearch' className='hint--bottom-left hint--bounce hint--rounded tool-button' aria-label='Search packages' onClick={() => dialogOpen ? setDialogOpen(false) : setDialogOpen(true)}><img src='/package.svg' alt='Copy shareable link' /></button>
          <button id='share' className='hint--bottom-left hint--bounce hint--rounded tool-button' aria-label={copyToolTip} disabled={code === ''} onClick={copyShareableLink}><img src='/share.svg' alt='Copy shareable link' /></button>
          <button id='theme' className='hint--bottom-left hint--bounce hint--rounded' aria-label='Switch theme' onClick={changeTheme}>{theme === 'dark' ? '🌙' : '☀️'}</button>
        </div>
      </header>
      <main >
        <div id='editor' ref={editorDiv} style={theme === 'dark' ? { '--border': '#8e8e8e' } : { '--border': 'black' }} />
        <div id='log' style={theme === 'dark' ? { backgroundColor: '#313131' } : { backgroundColor: 'white' }}>{log}</div>
      </main>
      <dialog open={dialogOpen} style={theme === 'dark' ? { '--background': '#333333', '--color': 'white', '--border': 'white' } : { '--background': 'white', '--color': 'black', '--border': 'black' }}>
        <h1>Search a package 📦</h1>
        <input type="text" onKeyDown={searchPackage} placeholder='Package...' />
        <div className="packages">
          {packages}
        </div>
        <button onClick={() => setDialogOpen(false)} style={theme === 'dark' ? { color: 'white' } : { color: 'black' }}>×</button>
      </dialog>
    </>
  )
}


export default App
