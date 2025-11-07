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
import { BrowserRouter as Router, Route, Routes, NavLink, useLocation } from 'react-router-dom';
import { motion } from "framer-motion"; 
import Status from './components/Status';
import SubmissionConfirm from './components/SubmissionConfirm';

axios.defaults.baseURL = 'http://localhost:8000';
// axios.defaults.baseURL = "https://reversedock.biologie.uni-freiburg.de/api"

const variants = {hidden: {opacity: 0, },
                  open: {opacity: 1,  transition: {duration: 0.2 }},
                  exit: {opacity: 0, transition: {duration: 0.2 }}}

const toaster = Toaster.create({position: Position.TOP}, document.body)

function AnimatedRoutes({ loading, setLoading }: { loading: boolean, setLoading: (loading: boolean) => void }) {
  const location = useLocation();

  return (
    <Routes location={location}>
        <Route path="/" element={
          <motion.div
            initial="hidden"
            animate="open"
            exit="exit"
            variants={variants}
            style={{width: "100%"}}>
            <Home />
          </motion.div>
        } />
        <Route path="/tutorial" element={
          <motion.div
            initial="hidden"
            animate="open"
            exit="exit"
            variants={variants}
            style={{width: "100%"}}>
            <Tutorial />
          </motion.div>
        } />
        <Route path="/info" element={
          <motion.div
            initial="hidden"
            animate="open"
            exit="exit"
            variants={variants}
            style={{width: "100%"}}>
            <SubmissionInfo toaster={toaster} setLoading={setLoading}/>
          </motion.div>
        } />
        <Route path="/submit" element={
          <motion.div
            initial="hidden"
            animate="open"
            exit="exit"
            variants={variants}
            style={{width: "100%"}}>
            <SubmissionSubmit toaster={toaster} setLoading={setLoading}/>
          </motion.div>
        } />
        <Route path="/confirm" element={
          <motion.div
            initial="hidden"
            animate="open"
            exit="exit"
            variants={variants}
            style={{width: "100%"}}>
            <SubmissionConfirm toaster={toaster}/>
          </motion.div>
        } />
        <Route path="/impressum" element={
          <motion.div
            initial="hidden"
            animate="open"
            exit="exit"
            variants={variants}
            style={{width: "100%"}}>
            <Impressum/>
          </motion.div>
        } />
        <Route path="*" element={<div> Page not found! </div>} />
      </Routes>
  );
}

function App() {
  const [loading, setLoading] = React.useState<boolean>(false);

  return (
    <div className="App">
      <Router>
        <Navbar fixedToTop={true}>
          <NavbarGroup>
            <NavbarHeading>ReverseDock</NavbarHeading>
            <NavbarDivider/>
            <NavLink to="/" className={({ isActive }) => [Classes.BUTTON, Classes.MINIMAL, isActive ? Classes.ACTIVE : ""].join(" ")}>Home</NavLink>
            <NavLink to="/tutorial" className={({ isActive }) => [Classes.BUTTON, Classes.MINIMAL, isActive ? Classes.ACTIVE : ""].join(" ")}>Tutorial</NavLink>
            <NavLink to="/info?id=da60f0a1-bbb5-45f7-9f44-feaf37952a4e" className={[Classes.BUTTON, Classes.MINIMAL].join(" ")}>Example</NavLink>
            <NavLink to="/impressum" className={({ isActive }) => [Classes.BUTTON, Classes.MINIMAL, isActive ? Classes.ACTIVE : ""].join(" ")}>Impressum</NavLink>
          </NavbarGroup>
          <NavbarGroup align="right">
          <div><Status/></div>
          <NavbarDivider></NavbarDivider>
          <NavLink to="/submit" className={({ isActive }) => [Classes.BUTTON, Classes.intentClass("success"), isActive ? Classes.ACTIVE : ""].join(" ")}>Submit</NavLink>
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
        <AnimatedRoutes loading={loading} setLoading={setLoading} />
      </Router>
      <Footer />
    </div>
  );
}

export default App;
