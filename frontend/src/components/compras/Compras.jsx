import React, { Component } from "react";
import ReactDOM from 'react-dom';
import axios from "axios";
import Main from "../template/Main";
import InputMask from "react-input-mask";
import validator from "validator";
import moment from "moment";
import "../user/UserCrud.css";

const { confirm } = window;

const headerProps = {
    icon: 'money',
    title: 'Compras',
}

const baseUrl = 'http://localhost:7069/compras'
const produtosUrl = 'http://localhost:7069/produtos'
const fornecedorUrl = 'http://localhost:7069/fornecedor'
const dataAtual = moment(new Date()).format('YYYY-MM-DD');
const initialState = {
    compras: {
        fornecedor: '',
        produto: '',
        preco: '',
        quantidade: '',
        total: '',
        data: dataAtual
    },
    list: [],
    listProd: [],
    listForn: [],
    filterFornecedor: '',
}

export default class Compras extends Component {

    state = {
        ...initialState,
    }

    componentDidMount() {
        axios.get(fornecedorUrl)
            .then(response => {
                this.setState({ fornecedores: response.data });
            })
            .catch(error => {
                console.error('Erro ao buscar fornecedores:', error);
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

        axios(fornecedorUrl).then(resp => {
            this.setState({ listForn: resp.data });
        });
    }

    clear() {
        this.setState({ compras: initialState.compras })
    }

    resetFilter() {
        window.location.reload();
    }

    save() {
        const compras = this.state.compras
        const method = compras.id ? 'put' : 'post'
        const url = compras.id ? `${baseUrl}/${compras.id}` : baseUrl

        if (!this.validateFields(compras)) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        compras.total = compras.preco * compras.quantidade

        axios[method](url, compras)
            .then(resp => {
                const quantidadeComprada = parseInt(compras.quantidade, 10);
                const produtoComprado = this.state.listProd.find(product => product.name === compras.produto);

                if (produtoComprado) {
                    const updatedQuantidade = parseInt(produtoComprado.quantidade, 10) + quantidadeComprada;
                    axios.put(`${produtosUrl}/${produtoComprado.id}`, { ...produtoComprado, quantidade: updatedQuantidade });
                }

                const list = this.getUpdatedList(resp.data);
                this.setState({ compras: initialState.compras, list });
            });
    }

    validateFields(compras) {
        const requiredFields = ['fornecedor', 'produto', 'quantidade', 'preco'];
        for (const field of requiredFields) {
            if (!compras[field]) {
                return false;
            }
        }
        return true;
    }

    getUpdatedList(compras, add = true) {
        const list = this.state.list.filter(u => u.id !== compras.id)
        if (add) list.unshift(compras)
        return list
    }

    updateField(event) {
        const { name, value } = event.target;
        const compras = { ...this.state.compras }
        compras[event.target.name] = event.target.value
        this.setState({ compras })

        compras[name] = value;
        if (name === 'produto') {
            const produtoSelecionado = value;
            const produtoEncontrado = this.state.listProd.find(
                produto => produto.name === produtoSelecionado
            );

            if (produtoEncontrado) {
                compras.preco = produtoEncontrado.preco;
            } else {
                compras.preco = '';
            }
        }

        const formattedValue = value.replace(/[^0-9]/g, "");

        this.setState({ compras: { ...this.state.compras, [name]: value } });
    }

    updatePriceField(event) {
        const { name, value } = event.target;
        const numericValue = value.replace(/[^\d]/g, '');
        this.setState({ compras: { ...this.state.compras, [name]: numericValue } });
    }

    updateFilter(event) {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    getOnlyProdutos() {
        const onlyProdutos = [...new Set(this.state.listProd.map(produtos => produtos.name))];
        return onlyProdutos;
    }

    getOnlyFornecedor() {
        const onlyFornecedor = [...new Set(this.state.listForn.map(fornecedor => fornecedor.name))];
        return onlyFornecedor;
    }

    getOnlyFornecedorFilter() {
        const onlyFornecedor = [...new Set(this.state.list.map(compras => compras.fornecedor))];
        return onlyFornecedor;
    }

    updateProductField(event) {
        const selectedProduct = event.target.value;
        const productData = this.state.listProd.find(product => product.name === selectedProduct);

        if (productData) {
            this.setState({
                compras: {
                    ...this.state.compras,
                    produto: selectedProduct,
                    preco: productData.preco,
                },
            });
        } else {
            this.setState({
                compras: {
                    ...this.state.compras,
                    produto: selectedProduct,
                    preco: '', // Limpa o preço se o produto selecionado não tiver um preço correspondente
                },
            });
        }
    }

    renderForm() {
        const onlyProdutos = this.getOnlyProdutos();
        const onlyFornecedores = this.getOnlyFornecedor();
        return (
            <div className="form">
                <div className="row">
                    <div className="col-6 col-m-2">
                        <div className="form-group">
                            <label htmlFor="">Fornecedor</label>
                            <select
                                className="form-control"
                                name="fornecedor"
                                value={this.state.compras.fornecedor}
                                onChange={e => this.updateField(e)}
                            >
                                <option value="">Selecione um fornecedor</option>
                                {onlyFornecedores.map((name, index) => (
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
                                value={this.state.compras.produto}
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
                                value={this.state.compras.preco}
                                placeholder=""
                                readOnly
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
                                value={this.state.compras.quantidade}
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
        const OnlyFornecedorFilter = this.getOnlyFornecedorFilter();
        return (
            <div className="row">
                <div className="col-12 col-m-2">
                    <div className="form-group">
                        <label>Fornecedor</label>
                        <select
                            className="form-control"
                            name="filterFornecedor"
                            value={this.state.filterFornecedor}
                            onChange={e => this.updateFilter(e)}
                        >
                            <option value="">Todos</option>
                            {OnlyFornecedorFilter.map((name, index) => (
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

    load(compras) {
        this.setState({ compras })
    }

    remove(compras) {
        const quantidadeComprada = parseInt(compras.quantidade, 10);
        const shouldDelete = confirm("Tem certeza de que deseja excluir esta compra?");

        if (shouldDelete) {
            axios.delete(`${baseUrl}/${compras.id}`).then(resp => {
                const produtoComprado = this.state.listProd.find(product => product.name === compras.produto);

                if (produtoComprado) {
                    const updatedQuantidade = parseInt(produtoComprado.quantidade, 10) - quantidadeComprada;

                    axios.put(`${produtosUrl}/${produtoComprado.id}`, { ...produtoComprado, quantidade: updatedQuantidade });
                }

                const list = this.getUpdatedList(compras, false);
                this.setState({ list });
            });
        }
    }

    renderTable() {
        return (
            <table className="table mt-4">
                <thead>
                    <tr>
                        <th className="cell-name">Fornecedor</th>
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
        const { filterFornecedor } = this.state;
        const filteredList = this.state.list.filter(compras => {
            return (
                (filterFornecedor === '' || compras.fornecedor.includes(filterFornecedor))
            );
        });

        const finalList = (
            !filterFornecedor
        ) ? this.state.list : filteredList;

        console.log(filterFornecedor)


        return finalList.map(compras => {
            const precoFinal = compras.preco * compras.quantidade;
            return (
                <tr key={compras.id}>
                    <td className="cell">{compras.fornecedor}</td>
                    <td className="cell">{compras.produto}</td>
                    <td className="cell">{compras.quantidade}</td>
                    <td className="cell">R$ {precoFinal}</td>
                    <td className="cell">
                        <button className="btn btn-warning"
                            onClick={() => this.load(compras)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        <button className="btn btn-danger ml-2"
                            onClick={() => this.remove(compras)}>
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
                        <p>CADASTRO DE COMPRAS</p>
                    </div>

                    <div className="container">
                        <div className="formulario">
                            {this.renderForm()}
                        </div>
                    </div>

                    <div className="separador">
                        <p>COMPRAS</p>
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