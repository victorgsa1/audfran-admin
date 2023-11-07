import React, { Component } from "react";
import ReactDOM from 'react-dom';
import axios from "axios";
import Main from "../template/Main";
import InputMask from "react-input-mask";
import moment from "moment";
import validator from "validator";
import "../user/UserCrud.css";

const { confirm } = window;

const headerProps = {
    icon: 'money',
    title: 'Vendas',
}

const baseUrl = 'http://localhost:7069/vendas'
const produtosUrl = 'http://localhost:7069/produtos'
const pacientesUrl = 'http://localhost:7069/pacientes'
const dataAtual = moment(new Date()).format('YYYY-MM-DD');
const initialState = {
    vendas: {
        pacientes: '',
        produto: '',
        preco: '',
        quantidade: '',
        total: '',
        data: dataAtual
    },
    list: [],
    listProd: [],
    listPac: [],
    filterPacientes: '',
}

export default class Vendas extends Component {

    state = {
        ...initialState,
    }

    componentDidMount() {
        axios.get(pacientesUrl)
            .then(response => {
                this.setState({ pacientes: response.data });
            })
            .catch(error => {
                console.error('Erro ao buscar pacientes:', error);
            });

        axios.get(produtosUrl)
            .then(response => {
                this.setState({ produtos: response.data });
            })
            .catch(error => {
                console.error('Erro ao buscar produtos:', error);
            });

        axios(baseUrl).then(resp => {
            this.setState({ list: resp.data });
        });

        axios(produtosUrl).then(resp => {
            this.setState({ listProd: resp.data });
        });

        axios(pacientesUrl).then(resp => {
            this.setState({ listPac: resp.data });
        });
    }

    clear() {
        this.setState({ vendas: initialState.vendas })
    }

    resetFilter() {
        window.location.reload();
    }

    save() {
        const vendas = this.state.vendas;
        const method = vendas.id ? 'put' : 'post';
        const url = vendas.id ? `${baseUrl}/${vendas.id}` : baseUrl;

        if (!this.validateFields(vendas)) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        vendas.total = vendas.preco * vendas.quantidade

        axios[method](url, vendas)
            .then(resp => {
                // Obtém a quantidade vendida a partir do estado
                const quantidadeVendida = parseInt(vendas.quantidade, 10);
                // Obtém o produto vendido a partir do estado
                const produtoVendido = this.state.listProd.find(product => product.name === vendas.produto);

                if (produtoVendido) {
                    // Atualiza a quantidade no banco de dados
                    const updatedQuantidade = parseInt(produtoVendido.quantidade, 10) - quantidadeVendida;
                    axios.put(`${produtosUrl}/${produtoVendido.id}`, { ...produtoVendido, quantidade: updatedQuantidade });
                }

                const list = this.getUpdatedList(resp.data);
                this.setState({ vendas: initialState.vendas, list });
            });
    }

    validateFields(vendas) {
        const requiredFields = ['pacientes', 'produto', 'quantidade', 'preco'];
        for (const field of requiredFields) {
            if (!vendas[field]) {
                return false;
            }
        }
        return true;
    }

    getUpdatedList(vendas, add = true) {
        const list = this.state.list.filter(u => u.id !== vendas.id)
        if (add) list.unshift(vendas)
        return list
    }

    updateField(event) {
        const { name, value } = event.target;
        const vendas = { ...this.state.vendas }
        vendas[event.target.name] = event.target.value
        this.setState({ vendas })

        vendas[name] = value;
        if (name === 'produto') {
            const produtoSelecionado = value;
            const produtoEncontrado = this.state.listProd.find(
                produto => produto.name === produtoSelecionado
            );

            if (produtoEncontrado) {
                vendas.preco = produtoEncontrado.preco;
            } else {
                vendas.preco = '';
            }
        }

        const formattedValue = value.replace(/[^0-9]/g, "");

        this.setState({ vendas: { ...this.state.vendas, [name]: value } });
    }

    updatePriceField(event) {
        const { name, value } = event.target;
        const numericValue = value.replace(/[^\d]/g, '');
        this.setState({ vendas: { ...this.state.vendas, [name]: numericValue } });
    }

    updateFilter(event) {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    getOnlyProdutos() {
        const onlyProdutos = [...new Set(this.state.listProd.map(produtos => produtos.name))];
        return onlyProdutos;
    }

    getOnlyPacientes() {
        const onlyPacientes = [...new Set(this.state.listPac.map(pacientes => pacientes.name))];
        return onlyPacientes;
    }

    getOnlyPacientesFilter() {
        const onlyPacientes = [...new Set(this.state.list.map(vendas => vendas.pacientes))];
        return onlyPacientes;
    }

    updateProductField(event) {
        const selectedProduct = event.target.value;
        const productData = this.state.listProd.find(product => product.name === selectedProduct);

        if (productData) {
            this.setState({
                vendas: {
                    ...this.state.vendas,
                    produto: selectedProduct,
                    preco: productData.preco,
                },
            });
        } else {
            this.setState({
                vendas: {
                    ...this.state.vendas,
                    produto: selectedProduct,
                    preco: '', // Limpa o preço se o produto selecionado não tiver um preço correspondente
                },
            });
        }
    }

    renderForm() {
        const onlyProdutos = this.getOnlyProdutos();
        const onlyPacientes = this.getOnlyPacientes();
        return (
            <div className="form">
                <div className="row">
                    <div className="col-6 col-m-2">
                        <div className="form-group">
                            <label htmlFor="">Pacientes</label>
                            <select
                                className="form-control"
                                name="pacientes"
                                value={this.state.vendas.pacientes}
                                onChange={e => this.updateField(e)}
                            >
                                <option value="">Selecione um paciente</option>
                                {onlyPacientes.map((name, index) => (
                                    <option key={index} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="col-6 col-m-2">
                        <div className="form-group">
                            <label htmlFor="">Produtos</label>
                            <select
                                className="form-control"
                                name="produto"
                                value={this.state.vendas.produto}
                                onChange={e => this.updateProductField(e)}
                            >
                                <option value="">Selecione um produto</option>
                                {onlyProdutos.map((name, index) => (
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
                                name="preco"
                                value={this.state.vendas.preco}
                                placeholder="Digite aqui o preço da venda"
                                onChange={e => this.updateField(e)}
                            />
                        </div>
                    </div>
                    <div className="col-2">
                        <div className="form-group">
                            <label>Quantidade</label>
                            <input
                                className="form-control"
                                type="number"
                                name="quantidade"
                                value={this.state.vendas.quantidade}
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

    renderFilters() {
        const OnlyPacientesFilter = this.getOnlyPacientesFilter();
        return (
            <div className="row">
                <div className="col-12 col-m-2">
                    <div className="form-group">
                        <label>Pacientes</label>
                        <select
                            className="form-control"
                            name="filterPacientes"
                            value={this.state.filterPacientes}
                            onChange={e => this.updateFilter(e)}
                        >
                            <option value="">Todos</option>
                            {OnlyPacientesFilter.map((name, index) => (
                                <option key={index} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <button className="btn btn-danger ml-3" onClick={this.resetFilter}>
                    Limpar Filtro
                </button>
            </div>
        );
    }

    load(vendas) {
        this.setState({ vendas })
    }

    remove(vendas) {
        const quantidadeVendida = parseInt(vendas.quantidade, 10);
        const shouldDelete = confirm("Tem certeza de que deseja excluir esta venda?");


        if (shouldDelete) {
            axios.delete(`${baseUrl}/${vendas.id}`).then(resp => {
                const produtoVendido = this.state.listProd.find(product => product.name === vendas.produto);

                if (produtoVendido) {
                    const updatedQuantidade = parseInt(produtoVendido.quantidade, 10) + quantidadeVendida;

                    axios.put(`${produtosUrl}/${produtoVendido.id}`, { ...produtoVendido, quantidade: updatedQuantidade });
                }

                const list = this.getUpdatedList(vendas, false);
                this.setState({ list });
            });
        }
    }

    renderTable() {
        return (
            <table className="table mt-4">
                <thead>
                    <tr>
                        <th className="cell-name">Pacientes</th>
                        <th className="cell">Produto</th>
                        <th className="cell">Quantidade</th>
                        <th className="cell">Preço</th>
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
        const { filterPacientes } = this.state;
        const filteredList = this.state.list.filter(vendas => {
            return (
                (filterPacientes === '' || vendas.pacientes.includes(filterPacientes))
            );
        });

        const finalList = (
            !filterPacientes
        ) ? this.state.list : filteredList;

        console.log(filterPacientes)


        return finalList.map(vendas => {
            const precoFinal = vendas.preco * vendas.quantidade;
            return (
                <tr key={vendas.id}>
                    <td className="cell">{vendas.pacientes}</td>
                    <td className="cell">{vendas.produto}</td>
                    <td className="cell">{vendas.quantidade}</td>
                    <td className="cell">R$ {precoFinal}</td>
                    <td className="cell">
                        <button className="btn btn-warning"
                            onClick={() => this.load(vendas)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        <button className="btn btn-danger ml-2"
                            onClick={() => this.remove(vendas)}>
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
                        <p>CADASTRO DE VENDAS</p>
                    </div>

                    <div className="container">
                        <div className="formulario">
                            {this.renderForm()}
                        </div>
                    </div>

                    <div className="separador">
                        <p>VENDAS</p>
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