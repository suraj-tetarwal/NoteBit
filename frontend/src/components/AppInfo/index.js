import './index.css'

const AppInfo = () => {
    return (
        <div className="app-info-page-container">
            <div className="app-info-card-container">
                <h1 className="app-info-title">NoteBit</h1>
                <p className="app-info-description">
                    A minimal note-taking app focused on speed, simplicity, and clarity.
                </p>
                <div className="app-info-section">
                    <h2 className="app-info-section-heading">Version</h2>
                    <p className="app-info-text">v1.0.0</p>
                </div>
                <div className="app-info-section">
                    <h2 className="app-info-section-heading">Built With</h2>
                    <ul className="app-info-tech-list">
                        <li>React</li>
                        <li>Node.js</li>
                        <li>Express</li>
                        <li>SQL</li>
                    </ul>
                </div>
                <div className="app-info-section">
                    <h2 className="app-info-section-heading">Creator</h2>
                    <p className="app-info-text">Built by<b>Suraj Tetarwal</b></p>
                </div>
                <div className="app-info-social-links-container">
                    <a
                        href="https://github.com/suraj-tetarwal"
                        target="_blank"
                        rel="noreferrer"
                        className="app-info-social-link"
                    >
                        GitHub
                    </a>
                    <a
                        href="https://www.linkedin.com/in/tetarwal-suraj"
                        target="_blank"
                        rel="noreferrer"
                        className="app-info-social-link"
                    >
                        LinkedIn
                    </a>
                    <a
                        href="https://x.com/lordskte?s=21"
                        target="_blank"
                        rel="noreferrer"
                        className="app-info-social-link"
                    >
                        Twitter
                    </a>
                </div>
            </div>
        </div>
    )
  }

export default AppInfo