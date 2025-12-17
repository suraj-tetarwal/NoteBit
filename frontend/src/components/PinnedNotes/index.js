import {Component} from 'react'
import Cookies from 'js-cookie'

import { FaSearch } from "react-icons/fa"

import NoteCard from '../NoteCard'

import './index.css'

class PinnedNotes extends Component {
    state = {
        pinnedNotesArray: [],
        searchInput: "",
    }

    onChangeSearchInput = event => {
        this.setState({searchInput: event.target.value})
    }

    fetchNotes = async () => {
        const jwtToken = Cookies.get("jwtToken")

        const url = "http://localhost:5000/notes/pinned"
        const options = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        }
        const response = await fetch(url, options)
        const data = await response.json()
        if (response.ok) {
            const {pinnedNotesArray} = data
            const formattedNotesArray = pinnedNotesArray.map(eachNote => ({
                id: eachNote.id,
                userId: eachNote.user_id,
                title: eachNote.title,
                content: eachNote.content,
                isPinned: eachNote.is_pinned,
                backgroundColor: eachNote.background_color,
                createdAt: eachNote.created_at,
                updatedAt: eachNote.updated_at,
            }))
            this.setState({pinnedNotesArray: formattedNotesArray})
        } else {
            const {error} = data
            alert(error)
        }
    }

    handlePin = async (id, isPinned) => {
        this.setState(prevState => ({
            pinnedNotesArray: prevState.pinnedNotesArray.map(eachNote => {
                if (eachNote.id === id) {
                    return {...eachNote, isPinned: !isPinned}
                }
                return eachNote
            })
        }))
        
        const jwtToken = Cookies.get("jwtToken")

        const url = `http://localhost:5000/notes/${id}`
        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({isPinned: !isPinned})
        }
        const response = await fetch(url, options)
        const data = await response.json()
        if (response.ok) {
            const {message} = data
            console.log(message)
        }
    }

    handleDeleteNote = async (id) => {
        const {pinnedNotesArray} = this.state
        const newNotesArray = pinnedNotesArray.filter(eachNote => eachNote.id !== id)

        this.setState({pinnedNotesArray: newNotesArray})

        const jwtToken = Cookies.get("jwtToken")

        const url = `http://localhost:5000/notes/${id}`
        const options = {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        }
        const response = await fetch(url, options)
        const data = await response.json()
        if (response.ok) {
            const {message} = data
            alert(message)
        } else {
            const {error} = data
            alert(error)
        }
    }

    componentDidMount() {
        this.fetchNotes()
    }

    render() {
        const {pinnedNotesArray, searchInput} = this.state
        const filteredArray = pinnedNotesArray.filter(eachNote => eachNote.title.toLowerCase().includes(searchInput.toLowerCase()))
        return (
            <div className="pinned-notes-container">
                <div className="pinned-notes-search-container">
                    <FaSearch className="search-icon" />
                    <input type="search" placeholder="Search for note title..." className="search-box" onChange={this.onChangeSearchInput} />
                </div>
                {
                    filteredArray.length === 0 ? (
                        <div className="empty-pinned-list-view-container">
                            <h1 className="empty-pinned-list-view-text">Nothing to show</h1>
                        </div>
                    ) : (
                        <ul className="pinned-notes-list-container">
                            {
                                filteredArray.map(eachNote => (
                                    <NoteCard 
                                        key={eachNote.id} 
                                        noteData={eachNote} 
                                        handlePin={this.handlePin}
                                        handleDeleteNote={this.handleDeleteNote} 
                                    />
                                ))
                            }
                        </ul>
                    )
                }
            </div>
        )
    }
}

export default PinnedNotes