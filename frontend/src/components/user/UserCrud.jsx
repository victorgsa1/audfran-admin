import React, { Component } from "react";
import axios from "axios";
import Main from "../template/Main";
import InputMask from "react-input-mask";
import validator from "validator";
import "../user/UserCrud.css";

const headerProps = {
    icon: 'users',
    title: 'Pacientes',
    subtitle: 'Cadastro de Pacientes: Incluir, Listar, Alterar e Excluir'
}

const baseUrl = 'http://localhost:7069/pacientes'
const dataAtual = new Date(Date.now()).toLocaleString().split(',')[0];
const initialState = {
    user: {
        name: '',
        email: '',
        cpf: '',
        telefone: '',
        nascimento: '',
        endereco: '',
        lado: '',
        cadastro: dataAtual
    },
    list: []
}

export default class UserCrud extends Component {

    state = { ...initialState }

    componentWillMount() {
        axios(baseUrl).then(resp => {
            this.setState({ list: resp.data })
        })
    }

    clear() {
        this.setState({ user: initialState.user })
    }

    save() {
        const user = this.state.user
        const method = user.id ? 'put' : 'post'
        const url = user.id ? `${baseUrl}/${user.id}` : baseUrl

        if (validator.isNumeric(user.name)) {
            alert("O nome não pode conter números.");
            return;
        }

        if (user.nascimento && user.nascimento.length > 10) {
            alert("A ano de nascimento deve ter no máximo 4 caracteres.");
            return;
        }



        axios[method](url, user)
            .then(resp => {
                const list = this.getUpdatedList(resp.data)
                this.setState({ user: initialState.user, list })
            })
    }

    getUpdatedList(user, add = true) {
        const list = this.state.list.filter(u => u.id !== user.id)
        if (add) list.unshift(user)
        return list
    }

    updateField(event) {
        const user = { ...this.state.user }
        user[event.target.name] = event.target.value
        this.setState({ user })

        const { name, value } = event.target;
        const formattedValue = value.replace(/[^0-9]/g, ""); // Remove caracteres não numéricos

        // Aplicar a máscara para o campo de telefone
        if (name === "telefone") {
            this.setState({ user: { ...this.state.user, [name]: formattedValue } });
        }
        // Aplicar a máscara para o campo de CPF
        else if (name === "cpf") {
            this.setState({ user: { ...this.state.user, [name]: formattedValue } });
        }
        // Para outros campos, atualize diretamente
        else {
            this.setState({ user: { ...this.state.user, [name]: value } });
        }
    }

    updateFilter(event) {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    renderForm() {
        return (
            <div className="form">
                <div className="row">
                    <div className="col-12 col-m-6">
                        <div className="form-group">
                            <label htmlFor="">Nome</label>
                            <input type="text" className="form-control"
                                name="name"
                                value={this.state.user.name}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o nome" />
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>CPF</label>
                            <InputMask mask="999.999.999-99" type="text" className="form-control"
                                name="cpf"
                                value={this.state.user.cpf}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o CPF" />
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Telefone</label>
                            <InputMask mask="(99)99999-9999" type="text" className="form-control"
                                name="telefone"
                                value={this.state.user.telefone}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o Telefone" />
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Data de Nascimento</label>
                            <input type="date" className="form-control"
                                name="nascimento"
                                value={this.state.user.nascimento}
                                onChange={e => this.updateField(e)} />
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Endereço</label>
                            <input type="text" className="form-control"
                                name="endereco"
                                value={this.state.user.endereco}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o e-mail" />
                        </div>
                    </div>
                    <div className="col-6 col-md-4">
                        <center>
                            <label for="lado">Unilateral</label> <br />
                            <input type="radio"
                                name="lado"
                                value="Unilateral"
                                onChange={e => this.updateField(e)} />
                        </center>
                    </div>
                    <div>
                        <center>
                            <label for="lado">Bilateral</label>
                            <br />
                            <input type="radio"
                                name="lado"
                                value="Bilateral"
                                onChange={e => this.updateField(e)} />
                        </center>
                    </div>
                </div>
                <hr />
                <div className="row">
                    <div className="col-12 d-flex justify-content-end">
                        <button className="btn btn-primary"
                            onClick={e => this.save(e)}>
                            Salvar
                        </button>

                        <button className="btn btn-secondary ml-2"
                            onClick={e => this.clear(e)}>
                            Limpar/Cancelar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    renderFilters() {
        return (
            <div className="row">
                <div className="col-12 col-md-3">
                    <div className="form-group">
                        <label>Nome</label>
                        <input
                            type="text"
                            className="form-control"
                            name="filterName"
                            value={this.state.filterName}
                            onChange={e => this.updateFilter(e)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-3">
                    <div className="form-group">
                        <label>CPF</label>
                        <input
                            type="text"
                            className="form-control"
                            name="filterCpf"
                            value={this.state.filterCpf}
                            onChange={e => this.updateFilter(e)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-3">
                    <div className="form-group">
                        <label>Ano de Nascimento</label>
                        <input
                            type="text"
                            className="form-control"
                            name="filterNascimento"
                            value={this.state.filterNascimento}
                            onChange={e => this.updateFilter(e)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-3">
                    <div className="form-group">
                        <label>Endereço</label>
                        <input
                            type="text"
                            className="form-control"
                            name="filterEndereco"
                            value={this.state.filterEndereco}
                            onChange={e => this.updateFilter(e)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-3">
                    <div className="form-group">
                        <label>Data de Cadastro</label>
                        <input
                            type="text"
                            className="form-control"
                            name="filterCadastro"
                            value={this.state.filterCadastro}
                            onChange={e => this.updateFilter(e)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-3">
                    <div className="form-group">
                        <label>Aparelho</label>
                        <select
                            className="form-control"
                            name="filterAparelho"
                            value={this.state.filterAparelho}
                            onChange={e => this.updateFilter(e)}
                        >
                            <option value="">Todos</option>
                            <option value="Unilateral">Unilateral</option>
                            <option value="Bilateral">Bilateral</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }

    load(user) {
        this.setState({ user })
    }

    remove(user) {
        axios.delete(`${baseUrl}/${user.id}`).then(resp => {
            const list = this.getUpdatedList(user, false)
            this.setState({ list })
        })
    }

    renderTable() {
        return (
            <table className="table mt-4">
                <thead>
                    <tr>
                        <th className="cell">ID</th>
                        <th className="cell">Nome</th>
                        <th className="cell">CPF</th>
                        <th className="cell">Telefone</th>
                        <th className="cell">Dt. Nasc.</th>
                        <th className="cell">Endereço</th>
                        <th className="cell">Dt. Cadastro</th>
                        <th className="cell">Uni ou Bi</th>
                        <th className="cell">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderRows()}
                </tbody>
            </table>

        )
    }

    renderRows() {
        const { filterName, filterCpf, filterNascimento, filterEndereco, filterCadastro, filterAparelho } = this.state;

        const filteredList = this.state.list.filter(user => {
            return (
                (filterName === '' || user.name.includes(filterName)) &&
                (filterCpf === '' || user.cpf.includes(filterCpf)) &&
                (filterNascimento === '' || user.nascimento.includes(filterNascimento)) &&
                (filterEndereco === '' || user.endereco.includes(filterEndereco)) &&
                (filterCadastro === '' || user.cadastro.includes(filterCadastro)) &&
                (filterAparelho === '' || user.lado === filterAparelho)
            );
        });

        // Se nenhum filtro estiver preenchido, exiba todos os registros
        const finalList = filterName === '' && filterCpf === '' && filterNascimento === '' &&
            filterEndereco === '' && filterCadastro === '' && filterAparelho === ''
            ? this.state.list
            : filteredList;


        return finalList.map(user => {
            return (
                <tr key={user.id}>
                    <td className="cell">{user.id}</td>
                    <td className="cell">{user.name}</td>
                    <td className="cell">{user.cpf}</td>
                    <td className="cell">{user.telefone}</td>
                    <td className="cell">{user.nascimento}</td>
                    <td className="cell">{user.endereco}</td>
                    <td className="cell">{user.cadastro}</td>
                    <td className="cell">{user.lado}</td>
                    <td className="cell">
                        <button className="btn btn-warning"
                            onClick={() => this.load(user)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        <button className="btn btn-danger ml-2"
                            onClick={() => this.remove(user)}>
                            <i className="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            )
        })
    }

    render() {
        return (
            <Main {...headerProps}>
                <div className="separador">
                    <p>CADASTRO DE PACIENTES</p>
                </div>

                <div className="container">
                    <div className="formulario">
                        {this.renderForm()}
                    </div>
                </div>

                <div className="separador">
                    <p>PACIENTES</p>
                </div>

                <div className="container">
                    <div className="filtros">
                        {this.renderFilters()}
                    </div>
                </div>
                {this.renderTable()}
            </Main>
        )
    }
}