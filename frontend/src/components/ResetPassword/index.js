import {Component} from 'react'
import {toast} from 'react-toastify'

import './index.css'

class ResetPassword extends Component {
    state = {
        newPassword: "",
        confirmPassword: ""
    }

    onChangeNewPassword = event => {
        this.setState({newPassword: event.target.value})
    }

    onChangeConfirmPassword = event => {
        this.setState({confirmPassword: event.target.value})
    }

    onSubmitForm = async event => {
        event.preventDefault()

        const {newPassword, confirmPassword} = this.state

        if (newPassword.length < 8) {
            alert("Password must be at least 8 characters long")
            return
        }

        if (newPassword !== confirmPassword) {
            alert("Password do not match")
            return
        }

        const {match} = this.props
        const {params} = match
        const {token} = params

        const url = `http://localhost:5000/reset-password/${token}`
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({password: newPassword}),
        }

        const response = await fetch(url, options)
        const data = await response.json()
        if (response.ok) {
            const {message} = data
            toast.success(message)
            const {history} = this.props
            history.replace("/sign-in")
        } else {
            const {error} = data
            toast.error(error)
        }
    }

    render() {
        const {newPassword, confirmPassword} = this.state
        return (
            <div className="reset-password-page-container">
                <form className="reset-password-form-container" onSubmit={this.onSubmitForm}>
                    <h1 className="reset-password-form-container-heading">Reset Password</h1>
                    <div className="reset-password-form-field-container">
                        <label className="reset-password-form-field-container-label">New Password</label>
                        <input 
                            type="password" 
                            placeholder="new password" 
                            value={newPassword} 
                            onChange={this.onChangeNewPassword}
                            required 
                            className="reset-password-form-field-container-input-box" 
                        />
                    </div>
                    <div className="reset-password-form-field-container">
                        <label className="reset-password-form-field-container-label">Confirm Password</label>
                        <input 
                            type="password" 
                            placeholder="confirm password" 
                            value={confirmPassword} 
                            onChange={this.onChangeConfirmPassword}
                            required 
                            className="reset-password-form-field-container-input-box" 
                        />
                    </div>
                    <button type="submit" className="reset-password-form-button">Reset Password</button>
                </form>
            </div>
        )
    }
}

export default ResetPassword