import React, { Fragment } from "react";
import {Route, Switch} from 'react-router-dom';
import Leave from "./views/Leave";
import Home from "./views/Home";

function App() {
  return (
    <Fragment>
      <Switch>
        <Route exact path='/leave' component={Leave} />
        <Route exact path='/' component={Home} />
      </Switch>
    </Fragment>
  );
}

export default App;
