import React, { Component } from "react";
import ReactDOM from 'react-dom';
import axios from "axios";
import Main from "../template/Main";
import InputMask from "react-input-mask";
import validator from "validator";
import "../user/UserCrud.css";

const { confirm } = window;

const headerProps = {
    icon: 'user',
    title: 'Fornecedores',
}

const baseUrl = 'http://localhost:7069/fornecedor'
const dataAtual = new Date(Date.now()).toLocaleString().split(',')[0];
const initialState = {
    fornecedor: {
        name: '',
        telefone: '',
        produto: '',
        endereco: '',
    },
    list: []
}

export default class Fornecedor extends Component {

    state = {
        ...initialState,
    }

    componentDidMount() {
        axios(baseUrl).then(resp => {
            this.setState({ list: resp.data })
        })
    }

    resetFilter() {
        window.location.reload();
    }

    clear() {
        this.setState({ fornecedor: initialState.fornecedor })
    }

    save() {
        const fornecedor = this.state.fornecedor
        const method = fornecedor.id ? 'put' : 'post'
        const url = fornecedor.id ? `${baseUrl}/${fornecedor.id}` : baseUrl

        if (validator.isNumeric(fornecedor.name)) {
            alert("O nome não pode conter números.");
            return;
        }

        if (fornecedor.telefone.length < 11) {
            alert("Por favor, termine de preencher o número de telefone")
        }

        if (!this.validateFields(fornecedor)) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        axios[method](url, fornecedor)
            .then(resp => {
                const list = this.getUpdatedList(resp.data)
                this.setState({ fornecedor: initialState.fornecedor, list })
            })
    }

    validateFields(fornecedor) {
        const requiredFields = ['name', 'telefone', 'endereco'];
        for (const field of requiredFields) {
            if (!fornecedor[field]) {
                return false;
            }
        }
        return true;
    }

    getUpdatedList(fornecedor, add = true) {
        const list = this.state.list.filter(u => u.id !== fornecedor.id)
        if (add) list.unshift(fornecedor)
        return list
    }

    updateField(event) {
        const fornecedor = { ...this.state.fornecedor }
        fornecedor[event.target.name] = event.target.value
        this.setState({ fornecedor })

        const { name, value } = event.target;
        const formattedValue = value.replace(/[^0-9]/g, ""); // Remove caracteres não numéricos

        if (name === "telefone") {
            this.setState({ fornecedor: { ...this.state.fornecedor, [name]: formattedValue } });
        }

        else {
            this.setState({ fornecedor: { ...this.state.fornecedor, [name]: value } });
        }
    }

    updateFilter(event) {
        const { name, value } = event.target;
        console.log({name},{value})
        this.setState({ [name]: value });
    }

    renderForm() {
        return (
            <div className="form">
                <div className="row">
                    <div className="col-12 col-m-6">
                        <div className="form-group">
                            <label htmlFor="">Nome</label>
                            <input className="form-control"
                                name="name"
                                value={this.state.fornecedor.name}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o nome" />
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Telefone</label>
                            <InputMask mask="(99)99999-9999" className="form-control"
                                name="telefone"
                                value={this.state.fornecedor.telefone}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o Telefone" />
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Endereço</label>
                            <input className="form-control"
                                name="endereco"
                                value={this.state.fornecedor.endereco}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o endereço" />
                        </div>
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

    getOnlyNames() {
        const onlyNames = [...new Set(this.state.list.map(fornecedor => fornecedor.name))];
        return onlyNames;
    }

    renderFilters() {
        const onlyNames = this.getOnlyNames();
        return (
            <div className="row">
                <div className="col-12 col-md-6">
                    <div className="form-group">
                        <label>Nome</label>
                        <select
                            className="form-control"
                            name="filterName"
                            value={this.state.filterName}
                            onChange={e => this.updateFilter(e)}
                        >
                            <option value="">Todos</option>
                            {onlyNames.map((name, index) => (
                                <option key={index} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="form-group">
                        <label>Endereço</label>
                        <input
                            className="form-control"
                            name="filterEndereco"
                            value={this.state.filterEndereco}
                            onChange={e => this.updateFilter(e)}
                        />
                    </div>
                </div>
                <button className="btn btn-danger ml-3"
                    onClick={this.resetFilter}>
                    Limpar Filtro
                </button>
            </div>
        );
    }

    load(fornecedor) {
        this.setState({ fornecedor })
    }

    remove(fornecedor) {
        const shouldDelete = confirm("Tem certeza de que deseja excluir este fornecedor?");
        if (shouldDelete) {
            axios.delete(`${baseUrl}/${fornecedor.id}`).then(resp => {
                const list = this.getUpdatedList(fornecedor, false)
                this.setState({ list })
            })
        }
    }

    renderTable() {
        return (
            <table className="table mt-4">
                <thead>
                    <tr>
                        <th className="cell">Nome</th>
                        <th className="cell">Telefone</th>
                        <th className="cell">Endereço</th>
                        <th className="cell-actions">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderRows()}
                </tbody>
            </table>

        )
    }

    renderRows() {
        const { filterName, filterEndereco } = this.state;
        const filteredList = this.state.list.filter(fornecedor => {
            return (
                (filterName === '' || fornecedor.name.includes(filterName)) ||
                (filterEndereco === '' || fornecedor.endereco.includes(filterEndereco))
            );
        });

        const finalList = (
            !filterName &&
            !filterEndereco
        ) ? this.state.list : filteredList;



        return finalList.map(fornecedor => {
            const telefone = this.formatTelefone(fornecedor.telefone)
            return (
                <tr key={fornecedor.id}>
                    <td className="cell">{fornecedor.name}</td>
                    <td className="cell">{telefone}</td>
                    <td className="cell">{fornecedor.endereco}</td>
                    <td className="cell">
                        <button className="btn btn-warning"
                            onClick={() => this.load(fornecedor)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        <button className="btn btn-danger ml-2"
                            onClick={() => this.remove(fornecedor)}>
                            <i className="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            )
        })
    }

    formatCPF(cpf) {
        return cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    formatTelefone(telefone) {
        return telefone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    render() {
        const { isViewModalVisible, viewPatient } = this.state;

        return (
            <Main {...headerProps}>
                <div>
                    <div className="separador">
                        <p>CADASTRO DE FORNECEDORES</p>
                    </div>

                    <div className="container">
                        <div className="formulario">
                            {this.renderForm()}
                        </div>
                    </div>

                    <div className="separador">
                        <p>FORNECEDORES</p>
                    </div>

                    <div className="container">
                        <div className="filtros">
                            {this.renderFilters()}
                        </div>
                    </div>
                </div>
                {this.renderTable()}
            </Main>
        )
    }
}