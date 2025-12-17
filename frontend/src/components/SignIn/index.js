import { Component } from "react";
import Cookies from 'js-cookie'
import {Link, Redirect} from 'react-router-dom'
import {toast} from 'react-toastify'

import "./index.css";

class SignIn extends Component {
  state = {
    email: '',
    password: '',
    showError: false,
    errorMessage: '',
  }

  onChangeEmail = event => {
    this.setState({email: event.target.value})
  }

  onChangePassword = event => {
    this.setState({password: event.target.value})
  }

  onSubmitForm = async event => {
    event.preventDefault()

    const toastId = toast.loading("Signing you in...")

    const {email, password} = this.state

    if (!email || !password) {
      this.setState({
        showError: true,
        errorMessage: "All fields are required"
      })
    }

    const userDetails = {
      email,
      password
    }
    
    const url = "http://localhost:5000/sign-in/"
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
      const {jwt_token} = data
      Cookies.set("jwtToken", jwt_token, {expires: 30})
      
      toast.update(toastId, {
        render: "Welcome back! Taking you to home...",
        type: "success",
        isLoading: false,
        autoClose: 3000
      })

      const {history} = this.props
      history.replace("/")
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

  renderEmailField = () => {
    const {email} = this.state 
    return (
      <div className="sign-in-field-container">
        <label className="sign-in-field-label" htmlFor="email">Email</label>
        <input 
          id="email" 
          type="text"
          placeholder="email" 
          value={email} 
          className="sign-in-input-box" 
          onChange={this.onChangeEmail} 
        />
      </div>
    )
  }

  renderPasswordField = () => {
    const {password} = this.state
    return (
      <div className="sign-in-field-container">
        <label className="sign-in-field-label" htmlFor="password">Password</label>
        <input 
          id="password"
          type="password"
          placeholder="password"
          value={password}
          className="sign-in-input-box"
          onChange={this.onChangePassword} 
        />
      </div>
    )
  }

  render() {
    const {showError, errorMessage} = this.state
    const jwtToken = Cookies.get("jwtToken")
    if (jwtToken) {
      return <Redirect to="/" />
    }
    return (
      <div className="sign-in-page-container">
        <form className="sign-in-form-container" onSubmit={this.onSubmitForm}>
          <h1 className="sign-in-form-heading">Welcome back</h1>
          {this.renderEmailField()}
          {this.renderPasswordField()}
          {showError ? <p className="sign-in-error-message">{`*${errorMessage}`}</p> : null}
          <Link to="/forgot-password" className="forgot-password-link" >Forgot password?</Link>
          <button type="submit" className="sign-in-button">Sign in</button>
          <p className="do-not-have-account-text">Don't have an account? <Link to="/sign-up" className="sign-up-link">Sign up</Link></p>
        </form>
      </div>
    );
  }
}

export default SignIn;
