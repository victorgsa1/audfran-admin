import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../components/home/Home";
import Login from "../components/login/Login";
import UserCrud from "../components/user/UserCrud";

export default props =>
    <Routes>
        <Route exact path='/' element={<Login />} />
        <Route path='/pacientes' element={<UserCrud />} />
        <Route path='/dashboard' element={<Home />} />
    </Routes>