import React, { Component } from "react";
import ReactDOM from 'react-dom';
import axios from "axios";
import Main from "../template/Main";
import InputMask from "react-input-mask";
import validator from "validator";
import "../user/UserCrud.css";

const { confirm } = window;

const headerProps = {
    icon: 'briefcase',
    title: 'Produtos',
}

const baseUrl = 'http://localhost:7069/produtos'
const dataAtual = new Date(Date.now()).toLocaleString().split(',')[0];
const initialState = {
    produtos: {
        name: '',
        quantidade: '0',
        preco: '',
    },
    list: []
}

export default class Produtos extends Component {

    state = {
        ...initialState,
    }

    componentDidMount() {
        axios(baseUrl).then(resp => {
            this.setState({ list: resp.data });
        });
    }

    resetFilter() {
        window.location.reload();
    }

    clear() {
        this.setState({ produtos: initialState.produtos })
    }

    save() {
        const produtos = this.state.produtos
        const method = produtos.id ? 'put' : 'post'
        const url = produtos.id ? `${baseUrl}/${produtos.id}` : baseUrl

        if (validator.isNumeric(produtos.name)) {
            alert("O nome não pode conter números.");
            return;
        }

        if (!this.validateFields(produtos)) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        axios[method](url, produtos)
            .then(resp => {
                const list = this.getUpdatedList(resp.data)
                this.setState({ produtos: initialState.produtos, list })
            })
    }

    validateFields(produtos) {
        const requiredFields = ['name', 'preco'];
        for (const field of requiredFields) {
            if (!produtos[field]) {
                return false;
            }
        }
        return true;
    }

    getUpdatedList(produtos, add = true) {
        const list = this.state.list.filter(u => u.id !== produtos.id)
        if (add) list.unshift(produtos)
        return list
    }

    updateField(event) {
        const produtos = { ...this.state.produtos }
        produtos[event.target.name] = event.target.value
        this.setState({ produtos })

        const { name, value } = event.target;
        const formattedValue = value.replace(/[^0-9]/g, ""); // Remove caracteres não numéricos

        this.setState({ produtos: { ...this.state.produtos, [name]: value } });
    }

    updateFilter(event) {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    renderForm() {
        return (
            <div className="form">
                <div className="row">
                    <div className="col-6 col-m-2">
                        <div className="form-group">
                            <label htmlFor="">Nome</label>
                            <input
                                className="form-control"
                                name="name"
                                value={this.state.produtos.name}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o nome" />
                        </div>
                    </div>
                    <div className="col-6 col-m-2">
                        <div className="form-group">
                            <label>Preço</label>
                            <input
                                className="form-control"
                                name="preco"
                                value={this.state.produtos.preco}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o preço do produto" />
                        </div>
                    </div>
                    <div className="col-2">
                        <div className="form-group">
                            <label>Quantidade</label>
                            <input
                                className="form-control"
                                type="number"
                                name="quantidade"
                                value={this.state.produtos.quantidade}
                                onChange={e => this.updateField(e)}
                            />
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
        const onlyNames = [...new Set(this.state.list.map(paciente => paciente.name))];
        return onlyNames;
    }

    renderFilters() {
        const onlyNames = this.getOnlyNames();
        return (
            <div className="row">
                <div className="col-6 col-m-2">
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
                <div className="col-6 col-m-2">
                    <div className="form-group">
                        <label>Preço</label>
                        <input

                            className="form-control"
                            name="filterPreco"
                            value={this.state.filterPreco}
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

    load(produtos) {
        this.setState({ produtos })
    }

    remove(produtos) {
        const shouldDelete = confirm("Tem certeza de que deseja excluir este produto?");

        if (shouldDelete) {
            axios.delete(`${baseUrl}/${produtos.id}`).then(resp => {
                const list = this.getUpdatedList(produtos, false)
                this.setState({ list })
            })
        }
    }

    renderTable() {
        return (
            <table className="table mt-4">
                <thead>
                    <tr>
                        <th className="cell-name">Produto</th>
                        <th className="cell">Preço</th>
                        <th className="cell">Quantidade</th>
                        <th className="cell-products">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderRows()}
                </tbody>
            </table>

        )
    }

    renderRows() {
        const { filterName, filterPreco } = this.state;
        const filteredList = this.state.list.filter(produtos => {
            return (
                (filterName === '' || produtos.name.includes(filterName)) ||
                (filterPreco === '' || produtos.preco.includes(filterPreco))
            );
        });

        const finalList = (
            !filterName &&
            !filterPreco
        ) ? this.state.list : filteredList;



        return finalList.map(produtos => {
            return (
                <tr key={produtos.id}>
                    <td className="cell">{produtos.name}</td>
                    <td className="cell">R$ {produtos.preco}</td>
                    <td className="cell">{produtos.quantidade}</td>
                    <td className="cell">
                        <button className="btn btn-warning"
                            onClick={() => this.load(produtos)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        <button className="btn btn-danger ml-2"
                            onClick={() => this.remove(produtos)}>
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
                <div>
                    <div className="separador">
                        <p>CADASTRO DE PRODUTOS</p>
                    </div>

                    <div className="container">
                        <div className="formulario">
                            {this.renderForm()}
                        </div>
                    </div>

                    <div className="separador">
                        <p>PRODUTOS</p>
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