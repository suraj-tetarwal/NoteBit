import {Component} from 'react'
import Cookies from 'js-cookie'
import {toast} from 'react-toastify'

import { FaSearch } from "react-icons/fa"

import NoteCard from '../NoteCard'

import './index.css'

class Dashboard extends Component {
  state = {
    notesArray: [],
    searchInput: "",
  };

  onChangeSearchInput = (event) => {
    this.setState({ searchInput: event.target.value });
  };

  fetchNotes = async () => {
    const jwtToken = Cookies.get("jwtToken");

    const url = "https://notebit-6.onrender.com/notes";
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    };
    const response = await fetch(url, options);
    const data = await response.json();
    if (response.ok) {
      const { notesArray } = data;
      const formattedNotesArray = notesArray.map((eachNote) => ({
        id: eachNote.id,
        userId: eachNote.user_id,
        title: eachNote.title,
        content: eachNote.content,
        isPinned: eachNote.is_pinned,
        backgroundColor: eachNote.background_color,
        createdAt: eachNote.created_at,
        updatedAt: eachNote.updated_at,
      }));
      this.setState({ notesArray: formattedNotesArray });
    } else {
      const { error } = data;
      toast.error(error);
    }
  };

  handlePin = async (id, isPinned) => {
    this.setState((prevState) => ({
      notesArray: prevState.notesArray.map((eachNote) => {
        if (eachNote.id === id) {
          return { ...eachNote, isPinned: !isPinned };
        }
        return eachNote;
      }),
    }));

    const jwtToken = Cookies.get("jwtToken");

    const url = `https://notebit-6.onrender.com/notes/${id}`;
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ isPinned: !isPinned }),
    };
    const response = await fetch(url, options);
    const data = await response.json();
    if (response.ok) {
      const { message } = data;
      toast.success(message);
    }
  };

  handleDeleteNote = async (id) => {
    const toastId = toast.loading("Deleting note...");

    const { notesArray } = this.state;
    const newNotesArray = notesArray.filter((eachNote) => eachNote.id !== id);

    this.setState({ notesArray: newNotesArray });

    const jwtToken = Cookies.get("jwtToken");

    const url = `https://notebit-6.onrender.com/notes/${id}`;
    const options = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    };
    const response = await fetch(url, options);
    const data = await response.json();
    if (response.ok) {
      const { message } = data;
      toast.update(toastId, {
        render: message,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } else {
      const { error } = data;
      toast.update(toastId, {
        render: error,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  componentDidMount() {
    this.fetchNotes();
  }

  render() {
    const { notesArray, searchInput } = this.state;
    const filteredArray = notesArray.filter((eachNote) =>
      eachNote.title.toLowerCase().includes(searchInput.toLowerCase())
    );
    return (
      <div className="dashboard-container">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="search"
            placeholder="Search for note title..."
            className="search-box"
            onChange={this.onChangeSearchInput}
          />
        </div>
        {filteredArray.length === 0 ? (
          <div className="empty-list-view-container">
            <h1 className="empty-list-view-text">Nothing to show</h1>
          </div>
        ) : (
          <ul className="notes-list-container">
            {filteredArray.map((eachNote) => (
              <NoteCard
                key={eachNote.id}
                noteData={eachNote}
                handlePin={this.handlePin}
                handleDeleteNote={this.handleDeleteNote}
              />
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export default Dashboard