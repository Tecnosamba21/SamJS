import './styles/Auth.css'
import { SignedOut, SignedIn, SignInButton, UserButton } from "@clerk/clerk-react"

function Auth() {
    return (
        <span>
            <SignedOut>
                <SignInButton />
            </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </span>
    )
}

export default Auth