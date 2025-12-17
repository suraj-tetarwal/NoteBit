import {Link} from 'react-router-dom'

import { MdDelete } from "react-icons/md"
import { BsPin, BsPinFill } from "react-icons/bs"

import './index.css'

const NoteCard = props => {
    const {noteData, handlePin, handleDeleteNote} = props
    const {id, title, content, isPinned, updatedAt, createdAt, backgroundColor} = noteData
    const formatTime = (updatedAt) => {
        const date = new Date(updatedAt)
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-us', options)
    }

    const onDelete = () => {
        handleDeleteNote(id)
    }

    const onPin = () => {
        handlePin(id, isPinned)
    }

    return (
        <li className={`note-item-container note-item-container-bg-${backgroundColor}`}>
            <Link to={`/edit-note/${id}`} className="note-item-link">
                <h1 className="note-item-title">{title}</h1>
                <div className="note-item-content" dangerouslySetInnerHTML={{ __html: content }}></div>
            </Link>
            <div className="note-footer-container">
                <div className="note-action-button-container">
                    <button type="button" className="action-button" onClick={onPin}>
                        {isPinned ? <BsPinFill className="pin-button-icon" /> : <BsPin className="pin-button-icon" />}
                    </button>
                    <button type="button" className="action-button" onClick={onDelete}>
                        <MdDelete className="delete-button-icon" />
                    </button>
                    {
                        updatedAt > createdAt ? <p className="edited-text">Edited</p> : null
                    }
                </div>
                <p className="note-created-time-text">{formatTime(updatedAt)}</p>
            </div>
        </li>
    )
}

export default NoteCard