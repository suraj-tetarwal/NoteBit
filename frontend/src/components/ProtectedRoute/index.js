import {Route, Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'

const ProtectedRoute = props => {
    const jwtToken = Cookies.get("jwtToken")
    if (!jwtToken) {
        return <Redirect to="/sign-in" />
    }
    return <Route {...props} />
}

export default ProtectedRoute