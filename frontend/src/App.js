import { BrowserRouter, Switch, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Profile from "./components/Profile";
import Dashboard from "./components/Dashboard";
import CreateNote from "./components/CreateNote";
import PinnedNotes from "./components/PinnedNotes";
import AppInfo from "./components/AppInfo";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          theme="light"
          newesetOnTop={true}
          preventDuplicate={true}
        />
        <Switch>
          <Route exact path="/sign-in" component={SignIn} />
          <Route exact path="/sign-up" component={SignUp} />
          <Route exact path="/forgot-password" component={ForgotPassword} />
          <Route
            exact
            path="/reset-password/:token"
            component={ResetPassword}
          />
          <Layout>
            <ProtectedRoute exact path="/" component={Dashboard} />
            <ProtectedRoute exact path="/profile" component={Profile} />
            <ProtectedRoute exact path="/create-note" component={CreateNote} />
            <ProtectedRoute
              exact
              path="/edit-note/:id"
              component={CreateNote}
            />
            <ProtectedRoute exact path="/pinned" component={PinnedNotes} />
            <ProtectedRoute exact path="/app-info" component={AppInfo} />
          </Layout>
        </Switch>
      </BrowserRouter>
    </>
  );
};

export default App;
