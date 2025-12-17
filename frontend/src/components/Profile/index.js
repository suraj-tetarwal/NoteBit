import {Component} from 'react'
import Cookies from 'js-cookie'

import './index.css'

class Profile extends Component {
    state = {
        userDetails: {},
    }

    htmlToText = (html) => {
        const divElement = document.createElement('div')
        divElement.innerHTML = html
        return divElement.textContent  
    }

    handleExport = async () => {
        const jwtToken = Cookies.get("jwtToken")

        const url = "http://localhost:5000/notes"
        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        }

        const response = await fetch(url, options) 
        const data = await response.json()

        const {notesArray} = data

        let fileContent = ""

        notesArray.forEach((note, index) => {
            fileContent += `Note ${index+1}\n`
            fileContent += `Title: ${note.title}\n`
            fileContent += `Created: ${note.created_at}\n`
            fileContent += `${this.htmlToText(note.content)}`
            fileContent += `\n\n------------------------------------------------\n\n`
        })

        console.log(fileContent)

        const blob = new Blob([fileContent], {type: "text/plain"})
        const downlaodUrl = URL.createObjectURL(blob)

        const linkElement = document.createElement("a")
        linkElement.href = downlaodUrl
        linkElement.download = "myNotes.txt"
        linkElement.click()

        URL.revokeObjectURL(downlaodUrl)
    }

    fetchUserAccountDetails = async () => {
        const jwtToken = Cookies.get("jwtToken")

        const url = "http://localhost:5000/account/summary/"
        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        }

        const response = await fetch(url, options)
        const data = await response.json()

        if (response.ok) {
            const {userDetails} = data
            const formattedUserDetails = {
                username: userDetails.username,
                email: userDetails.email,
                createdAt: userDetails.created_at,
                totalNotes: userDetails.total_notes,
                pinnedNotes: userDetails.pinned_notes
            }
            this.setState({
                userDetails: formattedUserDetails
            })
        } else {
            const {error} = data
            alert(error)
        }
    }

    componentDidMount() {
        this.fetchUserAccountDetails()
    }

    render() {
        const {userDetails} = this.state
        const {username, email, createdAt, totalNotes, pinnedNotes} = userDetails

        const initial = username ? username.trim().charAt(0).toUpperCase() : "?"

        return (
            <div className="account-container">
                <div className="profile-container">
                    <div className="profile-avatar-container">
                        <div className="avatar-container">
                            {initial}
                        </div>
                    </div>
                    <div className="user-detail-field-container">
                        <p className="field-label">Username</p>
                        <div className="field-value">{username}</div>
                    </div>
                    <div className="user-detail-field-container">
                        <p className="field-label">Email</p>
                        <div className="field-value">{email}</div>
                    </div>
                    <div className="user-detail-field-container">
                        <p className="field-label">Joined</p>
                        <div className="field-value">{createdAt}</div>
                    </div>
                    <div className="notes-detail-container">
                        <div>
                            <p className="notes-detail">Total Notes: {totalNotes}</p>
                            <p className="notes-detail">Pinned Notes: {pinnedNotes}</p>
                        </div>
                        <button type="button" className="export-notes-button" onClick={this.handleExport}>Export</button>
                    </div>
                </div>
            </div>        
        )
    }
}

export default Profile