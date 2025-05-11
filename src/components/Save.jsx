import './styles/Save.css'
import { useUser, useSession } from "@clerk/clerk-react"
import { useEffect, useState } from "react"
import { createClient } from '@supabase/supabase-js'

function Save(props) {

    const { session } = useSession()

    function createClerkSupabaseClient() {
        return createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY,
            {
                async accessToken() {
                    return session?.getToken() ?? null
                },
            },
        )
    }

    const supabase = createClerkSupabaseClient()

    const { user } = useUser()
    const userId = user?.id
    const userEmail = user?.emailAddresses[0].id

    const [dialogOpen, setDialogOpen] = useState(false)
    const [snippets, setSnippets] = useState([])
    const { theme, code, editor } = props

    const getSnippets = async () => {
        try {
            const { data } = await supabase.from('code').select('id, code').eq('user_email', userEmail)

            setSnippets(data.map((item, index) => (<section key={index} className='snippet'><span onClick={() => {
                editor.current.dispatch({
                    changes: {
                        from: 0,
                        to: editor.current.state.doc.length,
                        insert: item.code.toString()
                    }
                })
                setDialogOpen(false)
            }}>{item.code.split('\n')[0]}</span><div className='buttons snippet-buttons'><button className='tool-button button' aria-label='Remove snippet' onClick={
                async () => {
                    editor.current.dispatch({
                        changes: {
                            from: editor.current.state.doc.length,
                            insert: item.code.toString()
                        }
                    })
                }
            }><img src="/add.svg" alt="Add the content of the snippet to the editor" /></button><button className='tool-button button' aria-label='Remove snippet' onClick={
                async () => {
                    const { error } = await supabase.from('code').delete().eq('id', item.id)
                    if (error) {
                        alert(error.message)
                    }
                    getSnippets()
                }
            }><img src="/delete.svg" alt="Delete the snippet" /></button></div></section>)))
        } catch (err) {
            alert('ERR: ' + err)
        }
    }

    useEffect(() => {
        if (userEmail) getSnippets()
    }, [userEmail])

    const saveSnippet = async () => {
        if (snippets.length <= 4) {
            const { error, data } = await supabase.from('code').insert([
                {
                    user_id: userId,
                    user_email: userEmail,
                    code: code
                }
            ])

            getSnippets()
        }
    }

    return (
        <>
            <button id='packageSearch' className='hint--bottom-left hint--bounce hint--rounded tool-button button' aria-label='Code snippets' disabled={!userId} onClick={() => setDialogOpen(dialogOpen ? false : true)}>
                <img src='/code.svg' alt='Copy shareable link' />
            </button>
            <dialog open={dialogOpen} style={theme === 'dark' ? { '--background': '#333333', '--color': 'white', '--border': 'white' } : { '--background': 'white', '--color': 'black', '--border': 'black' }} className='ui-dialog'>
                <h1>Code snippets</h1>
                <button className="dialog-button hint--bottom-left hint--bounce hint--rounded" onClick={saveSnippet} disabled={snippets.length > 4 || code.trim() < 1} aria-label={snippets.length > 4 ? 'Max. 4 snippets, delete one' : ''}>Save current code</button>
                <div className="snippets">
                    {snippets}
                </div>
                <button onClick={() => setDialogOpen(false)} style={theme === 'dark' ? { color: 'white' } : { color: 'black' }} className="close">×</button>
            </dialog>
        </>
    )
}

export default Save