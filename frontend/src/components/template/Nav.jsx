import './Nav.css'
import React from 'react'
import { Link } from 'react-router-dom'

export default props=>
    <aside className="menu-area">
        <nav className="menu">
            <Link to="/Dashboard">
                <i className="fa fa-home"></i> Dashboard    
            </Link>
            <Link to="/pacientes">
                <i className="fa fa-user"></i> Pacientes    
            </Link>   
        </nav>
    </aside>