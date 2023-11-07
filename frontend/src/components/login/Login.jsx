import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Importe a biblioteca js-cookie
import "../login/Login.css";
import { useAuth, AuthLogin } from "../login/Auth";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");

    // Função para verificar se o usuário está logado
    const checkLoginStatus = () => {
        const isLoggedIn = Cookies.get("isLoggedIn") === "true";
        if (isLoggedIn) {
            navigate("/financeiro");
            window.location.reload();
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const handleLogin = () => {
        const storedUsername = "admin";
        const storedPassword = "1370";

        if (user === storedUsername && password === storedPassword) {
            alert("Login efetuado com sucesso!");
            login();

            Cookies.set("isLoggedIn", "true");

            navigate("/financeiro");
        } else {
            alert("Credenciais inválidas. Tente novamente.");
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form>
                <div className="form-group">
                    <label>Usuario:</label>
                    <input
                        type="user"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Senha:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="button" onClick={handleLogin}>
                    Entrar
                </button>
            </form>
        </div>
    );
};

export default Login;
