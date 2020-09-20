import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from './App';
import Register from './components/Register';
import Login from './components/Login';
import ForgetPassword from './components/ForgetPassword';
import ResetPassword from './components/ResetPassword';
import Activate from './components/Activate';
import 'react-toastify/dist/ReactToastify.css';


ReactDOM.render(
  <Router>
    <Switch>
      <Route path='/' exact render={props => <App {...props}/>}/>
      <Route path='/register' exact render={props => <Register {...props}/>}/>
      <Route path='/login' exact render={props => <Login {...props}/>}/>
      <Route path='/users/forgotpassword' exact render={props => <ForgetPassword {...props}/>}/>
      <Route path='/users/activate/:token' exact render={props => <Activate {...props}/>}/>
      <Route path='/users/password/reset/:token' exact render={props => <ResetPassword {...props}/>}/>
    </Switch>
  </Router>,
  document.getElementById('root')
);