import React from 'react';
import './App.scss';
import SubmissionSubmit from './components/SubmissionSubmit'
import { SubmissionInfo } from './components/SubmissionInfo'
import axios from "axios"
import Home from './Home'
import Tutorial from "./Tutorial"
import Impressum from "./Impressum"
import Footer from "./Footer";
import '../node_modules/normalize.css/normalize.css'
import '../node_modules/@blueprintjs/core/lib/css/blueprint.css'
import '../node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css'
import { Navbar, NavbarGroup, NavbarHeading, NavbarDivider, Spinner, SpinnerSize, Classes, Toaster, Position } from '@blueprintjs/core';
import { BrowserRouter as Router, Route, Switch, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion"; 
import Status from './components/Status';
import SubmissionConfirm from './components/SubmissionConfirm';

// axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.baseURL = "https://reversedock.biologie.uni-freiburg.de/api"

const variants = {hidden: {opacity: 0, },
                  open: {opacity: 1,  transition: {duration: 0.2 }},
                  exit: {opacity: 0, transition: {duration: 0.2 }}}

const toaster = Toaster.create({position: Position.TOP}, document.body)

function App() {
  const [loading, setLoading] = React.useState<boolean>(false);

  return (
    <div className="App">
      <Router>
        <Navbar fixedToTop={true}>
          <NavbarGroup>
            <NavbarHeading>ReverseDock</NavbarHeading>
            <NavbarDivider/>
            <NavLink exact to="/" className={[Classes.BUTTON, Classes.MINIMAL].join(" ")} activeClassName={Classes.ACTIVE}>Home</NavLink>
            <NavLink exact to="/tutorial" className={[Classes.BUTTON, Classes.MINIMAL].join(" ")} activeClassName={Classes.ACTIVE}>Tutorial</NavLink>
            <NavLink exact to="/info?id=da60f0a1-bbb5-45f7-9f44-feaf37952a4e" className={[Classes.BUTTON, Classes.MINIMAL].join(" ") } >Example</NavLink>
            <NavLink exact to="/impressum" className={[Classes.BUTTON, Classes.MINIMAL].join(" ") } activeClassName={Classes.ACTIVE}>Impressum</NavLink>
          </NavbarGroup>
          <NavbarGroup align="right">
          <div><Status/></div>
          <NavbarDivider></NavbarDivider>
          <NavLink exact to="/submit" className={[Classes.BUTTON, Classes.intentClass("success")].join(" ")} activeClassName={Classes.ACTIVE}>Submit</NavLink>
          </NavbarGroup>
        </Navbar>
        {loading
        ?
            <div className="loadingSpinnerWrapper">
                <Spinner size={SpinnerSize.LARGE} className="loadingSpinner" intent="primary"></Spinner>
            </div>
        :
            null
        }
        <Route
          render={({location}) => (
            <AnimatePresence exitBeforeEnter initial={false}>
              <Switch location={location} key={location.pathname}>
                <Route exact path="/">
                  <motion.div
                    initial="hidden"
                    animate="open"
                    exit="exit"
                    variants={variants}
                    style={{width: "100%"}}>
                    <Home />
                  </motion.div>
                </Route>
                <Route exact path="/tutorial">
                  <motion.div
                    initial="hidden"
                    animate="open"
                    exit="exit"
                    variants={variants}
                    style={{width: "100%"}}>
                    <Tutorial />
                  </motion.div>
                </Route>
                <Route exact path="/info">
                  <motion.div
                        initial="hidden"
                        animate="open"
                        exit="exit"
                        variants={variants}
                        style={{width: "100%"}}>
                    <SubmissionInfo toaster={toaster} setLoading={setLoading}/>
                    </motion.div>
                </Route>
                <Route exact path="/submit">
                  <motion.div
                    initial="hidden"
                    animate="open"
                    exit="exit"
                    variants={variants}
                    style={{width: "100%"}}>
                    <SubmissionSubmit toaster={toaster} setLoading={setLoading}/>
                  </motion.div>
                </Route>
                <Route exact path="/confirm">
                  <motion.div
                      initial="hidden"
                      animate="open"
                      exit="exit"
                      variants={variants}
                      style={{width: "100%"}}>
                    <SubmissionConfirm toaster={toaster}/>
                    </motion.div>
                </Route>
                <Route exact path="/impressum">
                  <motion.div
                      initial="hidden"
                      animate="open"
                      exit="exit"
                      variants={variants}
                      style={{width: "100%"}}>
                    <Impressum/>
                    </motion.div>
                </Route>
                <Route>
                  <div> Page not found! </div>
                </Route>
              </Switch>
            </AnimatePresence>
          )}>
        </Route>

      </Router>
      <Footer />
    </div>
  );
}

export default App;
