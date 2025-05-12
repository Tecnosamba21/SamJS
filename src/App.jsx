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
import Auth from './components/Auth'
import Save from './components/Save'

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
      'background-color': '#09090b',
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
      'background-color': '#09090b',
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
      <header style={theme === 'dark' ? { backgroundColor: '#09090b', borderBottom: '1.5px solid #8e8e8e' } : { backgroundColor: 'white', borderBottom: '1.5px solid black', color: 'black' }}>
        <h1 style={{ color: '#38b6ff' }}>Sam<span style={{ color: 'yellow' }}>JS</span></h1>
        <div className="buttons">
          <Save theme={theme} code={code} editor={editor} />
          <button id='packageSearch' className='hint--bottom-left hint--bounce hint--rounded tool-button button' aria-label='Search packages' onClick={() => dialogOpen ? setDialogOpen(false) : setDialogOpen(true)} style={theme === 'dark' ? { color: 'white' } : { color: 'black' }}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="CURRENTCOLOR"><path d="M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-80 92L160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11Zm200-528 77-44-237-137-78 45 238 136Zm-160 93 78-45-237-137-78 45 237 137Z" /></svg></button>
          <button id='share' className='hint--bottom-left hint--bounce hint--rounded tool-button button' aria-label={copyToolTip} disabled={code === ''} onClick={copyShareableLink} style={theme === 'dark' ? { color: 'white' } : { color: 'black' }}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="CURRENTCOLOR"><path d="M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24 0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17 0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm480-280q17 0 28.5-11.5T720-760q0-17-11.5-28.5T680-800q-17 0-28.5 11.5T640-760q0 17 11.5 28.5T680-720Zm0 520ZM200-480Zm480-280Z" /></svg></button>
          <button id='theme' className='hint--bottom-left hint--bounce hint--rounded button' aria-label='Switch theme' onClick={changeTheme}>{theme === 'dark' ? '🌙' : '☀️'}</button>
          <Auth />
        </div>
      </header>
      <main >
        <div id='editor' ref={editorDiv} style={theme === 'dark' ? { '--border': '#8e8e8e' } : { '--border': 'black' }} />
        <div id='log' style={theme === 'dark' ? { backgroundColor: '#09090b' } : { backgroundColor: 'white' }}>{log}</div>
      </main>
      <dialog open={dialogOpen} style={theme === 'dark' ? { '--background': '#09090b', '--color': 'white', '--border': '#151517' } : { '--background': 'white', '--color': 'black', '--border': 'black' }} className='ui-dialog'>
        <h1>Search a package 📦</h1>
        <input type="text" onKeyDown={searchPackage} placeholder='Package...' style={theme === 'dark' ? { '--background': '#09090b', '--border': '#a1a1a5' } : { '--background': 'white', '--border': '#b8b8bf' }} />
        <div className="packages">
          {packages}
        </div>
        <button onClick={() => setDialogOpen(false)} style={theme === 'dark' ? { color: 'white' } : { color: 'black' }} className='close'>×</button>
      </dialog>
    </>
  )
}


export default App
