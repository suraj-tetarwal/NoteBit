import {Component} from 'react'
import React from 'react'
import Cookies from 'js-cookie'
import {toast} from 'react-toastify'

import { FaBold, FaItalic, FaUnderline, FaSave } from "react-icons/fa"
import { BsPin, BsPinFill } from "react-icons/bs"

import './index.css'

const saveNoteStatusConstants = {
    initial: 'INITIAL',
    success: 'SUCCESS',
    failure: 'FAILURE',
    inProgress: 'IN_PROGRESS',
}

class CreateNote extends Component {
    state = {
        title: "",
        isPinned: false,
        isBold: false,
        isItalic: false,
        isUnderline: false,
        charactersCount: 0,
        wordsCount: 0,
        selectedBackgroundColor: "white",
        saveStatus: saveNoteStatusConstants.initial,
    }

    contentElementRef = React.createRef()

    updateCount = () => {
        const text = this.contentElementRef.current.innerText || ""
        const charactersCount = text.length
        const wordsCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
        this.setState({charactersCount, wordsCount})
    }

    handleTitleInput = event => {
        this.setState({title: event.target.value})
    }

    handlePin = () => {
        this.setState(prevState => ({isPinned: !prevState.isPinned}))
    }

    onToggleBold = () => {
        this.setState(
            prevState => ({isBold: !prevState.isBold}), 
            () => document.execCommand("bold")
        )
    }

    onToggleItalic = () => {
        this.setState(
            prevState => ({isItalic: !prevState.isItalic}),
            () => document.execCommand("italic")
        )
    }

    onToggleUnderline = () => {
        this.setState(
            prevState => ({isUnderline: !prevState.isUnderline}),
            () => document.execCommand("underline")
        )
    }

    handleSave = async () => {
      const toastId = toast.loading("Saving...");

      const { match } = this.props;
      const { params } = match;
      const { id } = params;

      this.setState({ saveStatus: saveNoteStatusConstants.inProgress });

      const jwtToken = Cookies.get("jwtToken");
      const { title, isPinned, selectedBackgroundColor } = this.state;

      const content = this.contentElementRef.current.innerHTML;

      const newNoteData = {
        title,
        content,
        isPinned,
        backgroundColor: selectedBackgroundColor,
      };

      const url = id
        ? `https://notebit-6.onrender.com/notes/${id}`
        : "https://notebit-6.onrender.com/notes";
      const options = {
        method: id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(newNoteData),
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
        this.setState({ saveStatus: saveNoteStatusConstants.success });
      } else {
        const { error } = data;
        this.setState({ saveStatus: saveNoteStatusConstants.failure });
        toast.update(toastId, {
          render: error,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    };

    renderSaveNoteStatus = () => {
      const { saveStatus } = this.state;
      switch (saveStatus) {
        case saveNoteStatusConstants.success:
          return "Saved";
        case saveNoteStatusConstants.failure:
          return "Error Occured";
        case saveNoteStatusConstants.inProgress:
          return "Saving...";
        default:
          return "Not Saved";
      }
    };

    fetchNoteData = async (id) => {
      const jwtToken = Cookies.get("jwtToken");

      const url = `https://notebit-6.onrender.com/notes/${id}`;
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      };

      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        const { note } = data;
        const { title, content, is_pinned, background_color } = note;
        this.contentElementRef.current.innerHTML = content;
        this.setState({
          title,
          isPinned: is_pinned,
          selectedBackgroundColor: background_color,
          saveStatus: saveNoteStatusConstants.success,
        });
        this.updateCount();
      } else {
        const { error } = data;
        toast.error(error);
      }
    };

    componentDidMount() {
        const {match} = this.props
        const {params} = match
        const {id} = params

        if (id) {
            this.fetchNoteData(id)
        }
    }

    render() {
        const {title, isPinned, isBold, isItalic, isUnderline, charactersCount, wordsCount, selectedBackgroundColor} = this.state
        return (
            <div className="create-note-container">
                <div className={`note-input-container note-input-bg-${selectedBackgroundColor}`}>
                    <input className="note-title-input" placeholder="Add a title..." value={title} onChange={this.handleTitleInput} />
                    <div
                        ref={this.contentElementRef}
                        className="note-content-input"
                        data-placeholder="Write your note here..." 
                        contentEditable
                        suppressContentEditableWarning
                        onInput={this.updateCount}
                    />
                    <div className="note-footer">
                        <div className="note-stats">
                            <div className="word-count">Words: {wordsCount}</div>
                            <div className="character-count">Character: {charactersCount}</div>
                            <div className="save-status">{this.renderSaveNoteStatus()}</div>
                        </div>
                        <div className="color-palette">
                            <button className={`color-dot color1 ${selectedBackgroundColor === "white" ? "active-color-dot" : ""}`} onClick={() => this.setState({selectedBackgroundColor: "white"})}></button>
                            <button className={`color-dot color2 ${selectedBackgroundColor === "yellow" ? "active-color-dot" : ""}`} onClick={() => this.setState({selectedBackgroundColor: "yellow"})}></button>
                            <button className={`color-dot color3 ${selectedBackgroundColor === "green" ? "active-color-dot" : ""}`} onClick={() => this.setState({selectedBackgroundColor: "green"})}></button>
                            <button className={`color-dot color4 ${selectedBackgroundColor === "blue" ? "active-color-dot" : ""}`} onClick={() => this.setState({selectedBackgroundColor: "blue"})}></button>
                            <button className={`color-dot color5 ${selectedBackgroundColor === "red" ? "active-color-dot" : ""}`} onClick={() => this.setState({selectedBackgroundColor: "red"})}></button>
                        </div>
                    </div>
                </div>
                <div className={`tools-container tools-container-bg-${selectedBackgroundColor}`}>
                    <button className={`tool-button-bg-${selectedBackgroundColor} ${isBold ? "active-tool-button" : "tool-button"}`} onClick={this.onToggleBold}>
                        <FaBold className="tool-button-icon" />
                    </button>
                    <button className={`tool-button-bg-${selectedBackgroundColor} ${isItalic ? "active-tool-button" : "tool-button"}`} onClick={this.onToggleItalic}>
                        <FaItalic className="tool-button-icon" />
                    </button>
                    <button className={`tool-button-bg-${selectedBackgroundColor} ${isUnderline ? "active-tool-button" : "tool-button"}`} onClick={this.onToggleUnderline}>
                        <FaUnderline className="tool-button-icon" />
                    </button>
                    <button className={`tool-button tool-button-bg-${selectedBackgroundColor}`} onClick={this.handlePin}>
                        {
                            isPinned ? <BsPinFill className="tool-button-icon" /> : <BsPin className="tool-button-icon" />
                        }
                    </button>
                    <button className={`tool-button tool-button-bg-${selectedBackgroundColor}`} onClick={this.handleSave}>
                        <FaSave className="tool-button-icon" />
                    </button>
                </div>
            </div>
        )
    }
}

export default CreateNote