import {Component} from 'react'
import {Link, Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'
import {toast} from 'react-toastify'

import './index.css'

class SignUp extends Component {
    state = {
        username: '',
        email: '',
        password: '',
        showError: false,
        errorMessage: '',
    }

    onChangeUsername = event => {
        this.setState({username: event.target.value})
    }

    onChangeEmail = event => {
        this.setState({email: event.target.value})
    }

    onChangePassword = event => {
        this.setState({password: event.target.value})
    }

    onSubmitForm = async event => {
        event.preventDefault()

        const toastId = toast.loading("Creating your account...")

        const {username, email, password} = this.state

        if (!username || !email || !password) {
            this.setState({
                showError: true,
                errorMessage: 'All fields are required'
            })
        }

        const userDetails = {
            username,
            email,
            password
        }

        const url = "http://localhost:5000/sign-up/"
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userDetails)
        }

        const response = await fetch(url, options)
        const data = await response.json()
        if (response.ok) {
            const {message} = data
            toast.update(toastId, {
                render: message,
                type: "success",
                isLoading: false,
                autoClose: 3000
            })
            const {history} = this.props
            history.replace("/sign-in")
        } else {
            const {error} = data
            toast.update(toastId, {
                render: error,
                type: "error",
                isLoading: false,
                autoClose: 3000
            })
            this.setState({
                showError: true,
                errorMessage: error,
            })
        }
    }

    renderUsernameField = () => {
        const {username} = this.state
        const jwtToken = Cookies.get("jwtToken")
        if (jwtToken) {
            return <Redirect to="/" />
        }
        return (
            <div className='sign-up-field-container'>
                <label className='sign-up-field-label' htmlFor='username'>Username</label>
                <input
                    id="username" 
                    type="text" 
                    placeholder='username' 
                    value={username}
                    className='sign-up-input-box'
                    onChange={this.onChangeUsername}
                />
            </div>
        )
    }

    renderEmailField = () => {
        const {email} = this.state
        return (
            <div className='sign-up-field-container'>
                <label className='sign-up-field-label' htmlFor='email'>Email</label>
                <input 
                    id="email"
                    type="text" 
                    placeholder='email'
                    value={email} 
                    className='sign-up-input-box' 
                    onChange={this.onChangeEmail}
                />
            </div>
        )
    }

    renderPasswordField = () => {
        const {password} = this.state
        return (
            <div className='sign-up-field-container'>
                <label className='sign-up-field-label' htmlFor='password'>Password</label>
                <input 
                    id="password"
                    type="password" 
                    placeholder='password'
                    value={password} 
                    className='sign-up-input-box' 
                    onChange={this.onChangePassword}
                />
            </div>
        )
    }

    render() {
        const {showError, errorMessage} = this.state 
        return (
            <div className="sign-up-page-container">
                <form className="sign-up-form-container" onSubmit={this.onSubmitForm}>
                    <h1 className="sign-up-form-heading">Get Started</h1>
                    {this.renderUsernameField()}
                    {this.renderEmailField()}
                    {this.renderPasswordField()}
                    {showError ? <p className="sign-up-error-message">{`*${errorMessage}`}</p> : null}
                    <button type="submit" className="sign-up-button">Sign up</button>
                    <p className="already-have-account-text">Already have an account? <Link to="/sign-in" className="sign-in-link">Sign in</Link></p>
                </form>
            </div>
        )
    }
}

export default SignUp