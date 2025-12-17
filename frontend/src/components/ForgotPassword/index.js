import {Component} from 'react'
import {toast} from 'react-toastify'

import './index.css'

class ForgotPassword extends Component {
    state = {
        email: "",
    }

    onChangeEmail = (event) => {
        this.setState({email: event.target.value})
    }

    onSubmitForm = async (event) => {
        event.preventDefault()

        const {email} = this.state
        
        const url = "http://localhost:5000/forgot-password"
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email}),
        }
        const response = await fetch(url, options)
        const data = await response.json()
        if (response.ok) {
            const {message, passwordResetLink} = data
            console.log(passwordResetLink)
            toast.success(message)
            this.setState({email: ""})
        }
    }

    render() {
        const {email} = this.state
        return (
            <div className="forgot-password-page-container">
                <form className="forgot-password-form-container" onSubmit={this.onSubmitForm}>
                    <h1 className="forgot-password-form-container-heading">Forgot Password</h1>
                    <div className="forgot-password-form-field-container">
                        <label className="forgot-password-form-field-container-label">Email</label>
                        <input 
                            type="email" 
                            placeholder="email" 
                            required 
                            value={email}
                            className="forgot-password-form-field-container-input-box" 
                            onChange={this.onChangeEmail}
                        />
                    </div>
                    <button type="submit" className="forgot-password-form-button">Send Reset Link</button>
                </form>
            </div>
        )
    }
}

export default ForgotPassword