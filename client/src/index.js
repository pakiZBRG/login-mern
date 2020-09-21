import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from './App';
import Register from './components/Register';
import Login from './components/Login';
import ForgetPassword from './components/ForgetPassword';
import Activate from './components/Activate';
import ResetPassword from './components/ResetPassword';
import Private from './components/Private';
import Admin from './components/Admin';
import 'react-toastify/dist/ReactToastify.css';


ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path='/' component={App}/>
      <Route exact path='/register' component={Register}/>
      <Route exact path='/login' component={Login}/>
      <Route exact path='/users/forgotpassword' component={ForgetPassword}/>
      <Route exact path='/users/activate/:token' component={Activate}/>
      <Route exact path='/users/password/reset/:token' component={ResetPassword}/>
      <Route exact path="/private" component={Private} />
      <Route exact path="/admin" component={Admin} />
    </Switch>
  </Router>,
  document.getElementById('root')
);