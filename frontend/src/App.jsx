import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Attendance from "./pages/Attendance";
import Approvals from "./pages/Approvals";
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import ListAll from './pages/ListAll'
import AddStudent from './pages/AddStudent'
import Admin from './pages/Admin'
import SignUp from './pages/SignUp'
import StudentDashboard from './pages/StudentDashboard'
import About from './pages/About'


export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="listAll" element={<ListAll />} />
          <Route path="teams" element={<Teams />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="student" element={<StudentDashboard />} />
          <Route path="about" element={<About />} />
        </Route>
        <Route path='/listAll' element={<Navigate to="/dashboard/listAll" replace />} />
        <Route path='/addStudent' element={<AddStudent/>}/>
        <Route path='/adminView' element={<Admin/>}/>
      </Routes>
      
    </>
  );
}
