import './Nav.css';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

const Nav = () => {
    const isAuthenticated = Cookies.get("isLoggedIn") === "true";
    const navigate = useNavigate();

    const handleLogout = () => {
        Cookies.set("isLoggedIn", "false");
        navigate("");
        window.location.reload();
    };

    if (isAuthenticated) {
        return (
            <aside className="menu-area">
                <nav className="menu">
                    <Link to="/financeiro">
                        <i className="fa fa-home"></i> Financeiro
                    </Link>
                    <Link to="/pacientes">
                        <i className="fa fa-user"></i> Pacientes
                    </Link>
                    <Link to="/fornecedor">
                        <i className="fa fa-user"></i> Fornecedor
                    </Link>
                    <Link to="/produtos">
                        <i className="fa fa-briefcase"></i> Produtos
                    </Link>
                    <Link to="/compras">
                        <i className="fa fa-money"></i> Compras
                    </Link>
                    <Link to="/vendas">
                        <i className="fa fa-money"></i> Vendas
                    </Link>
                    <center>
                        <button className="btn btn-danger" onClick={handleLogout}>
                            Logout
                        </button>
                    </center>   
                </nav>
            </aside>
        );
    } else {
        return (
            <aside className="menu-area">
                <nav className="menu">
                </nav>
            </aside>
        );
    }
};

export default Nav;
