import Sidebar from "../Sidebar"

import './index.css'

const Layout = props => {
    const {children} = props
    return (
        <div className="layout-container">
            <Sidebar />
            <div className="layout-main-content-container">
                {children}
            </div>
        </div>
    )
}

export default Layout