import {Component} from 'react'
import {Link, withRouter} from 'react-router-dom'
import Cookies from 'js-cookie'

import { MdNote, MdNoteAdd, MdInfo } from "react-icons/md"
import { IoMenu } from "react-icons/io5"
import { FaUser } from "react-icons/fa6"
import { TbPinnedFilled } from "react-icons/tb"
import { CiLogout } from "react-icons/ci"

import './index.css'

class Sidebar extends Component {
    state = {
        isMenuOpen: false,
    }

    toggleMenu = () => {
        this.setState(prevState => ({isMenuOpen: !prevState.isMenuOpen}))
    }

    handleLogout = () => {
        const {history} = this.props
        Cookies.remove("jwtToken")
        history.replace("/sign-in")
    }
    
    render() {
        const {isMenuOpen} = this.state
        const {location} = this.props
        const {pathname} = location
        return (
            <div className="sidebar-container">
                <div className="mobile-topbar-container">
                    <button className="mobile-topbar-button" onClick={this.toggleMenu}>
                        <IoMenu className="mobile-icon" />
                    </button>
                    <h1 className="mobile-logo-text">NoteBit</h1>
                    <button className="mobile-topbar-button" onClick={this.handleLogout}>
                        <CiLogout className="logout-mobile-icon" />
                    </button>
                </div>

                <div className={`mobile-menu-drawer ${isMenuOpen ? "open" : ""}`}>
                    <ul className="mobile-menu-container">
                        <Link to="/profile" className="mobile-menu-item-link">
                            <li className={pathname === "/profile" ? "desktop-menu-item active-desktop-menu-item" : "desktop-menu-item"}>
                                <FaUser className="mobile-menu-item-icon" />
                                <p className="mobile-menu-item-text">Profile</p>
                            </li>
                        </Link>
                        <Link to="/" className="mobile-menu-item-link">
                            <li className={pathname === "/" ? "desktop-menu-item active-desktop-menu-item" : "desktop-menu-item"}>
                                <MdNote className="mobile-menu-item-icon" />
                                <p className="mobile-menu-item-text">Notes</p>
                            </li>
                        </Link>
                        <Link to="/pinned" className="mobile-menu-item-link">
                            <li className={pathname === "/pinned" ? "desktop-menu-item active-desktop-menu-item" : "desktop-menu-item"}>
                                <TbPinnedFilled className="mobile-menu-item-icon" />
                                <p className="mobile-menu-item-text">Pinned</p>
                            </li>
                        </Link>
                        <Link to="/create-note" className="mobile-menu-item-link">
                            <li className={pathname === "/create-note" ? "desktop-menu-item active-desktop-menu-item" : "desktop-menu-item"}>
                                <MdNoteAdd className="mobile-menu-item-icon" />
                                <p className="mobile-menu-item-text">Create</p>
                            </li>
                        </Link>
                        <Link to="/app-info" className="mobile-menu-item-link">
                            <li className={pathname === "/app-info" ? "desktop-menu-item active-desktop-menu-item" : "desktop-menu-item"}>
                                <MdInfo className="mobile-menu-item-icon" />
                                <p className="mobile-menu-item-text">Info</p>
                            </li>
                        </Link>
                    </ul>
                    <button className="mobile-menu-drawer-close-button" onClick={this.toggleMenu}>Close</button>
                </div>

                {
                    isMenuOpen && (
                        <div className="overlay-container" onClick={this.toggleMenu}></div>
                    )
                }

                <div className="desktop-sidebar-container">
                    <h1 className="desktop-logo-text">NoteBit</h1>
                    <ul className="desktop-menu-container">
                        <Link to="/profile" className="desktop-menu-item-link">
                            <li className={pathname === "/profile" ? "desktop-menu-item active-desktop-menu-item" : "desktop-menu-item"}>
                                <FaUser className="desktop-menu-item-icon" />
                                <p className="desktop-menu-text">Profile</p>
                            </li>
                        </Link>
                        <Link to="/" className="desktop-menu-item-link">
                            <li className={pathname === "/" ? "desktop-menu-item active-desktop-menu-item" : "desktop-menu-item"}>
                                <MdNote className="desktop-menu-item-icon" />
                                <p className="desktop-menu-text">Notes</p>
                            </li>
                        </Link>
                        <Link to="/pinned" className="desktop-menu-item-link">
                            <li className={pathname === "/pinned" ? "desktop-menu-item active-desktop-menu-item" : "desktop-menu-item"}>
                                <TbPinnedFilled className="desktop-menu-item-icon" />
                                <p className="desktop-menu-text">Pinned</p>
                            </li>
                        </Link>
                        <Link to="/create-note" className="desktop-menu-item-link">
                            <li className={pathname === "/create-note" ? "desktop-menu-item active-desktop-menu-item" : "desktop-menu-item"}>
                                <MdNoteAdd className="desktop-menu-item-icon" />
                                <p className="desktop-menu-text">Create</p>
                            </li>
                        </Link>
                        <Link to="/app-info" className="desktop-menu-item-link">
                            <li className={pathname === "/app-info" ? "desktop-menu-item active-desktop-menu-item" : "desktop-menu-item"}>
                                <MdInfo className="desktop-menu-item-icon" />
                                <p className="desktop-menu-text">Info</p>
                            </li>
                        </Link>
                    </ul>
                    <button className="desktop-logout-button" onClick={this.handleLogout}>Logout</button>
                </div>
            </div>
        )    
    }
}


export default withRouter(Sidebar)
