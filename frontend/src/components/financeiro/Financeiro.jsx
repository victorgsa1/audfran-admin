import React, { Component } from "react";
import axios from "axios";
import Main from "../template/Main";
import "../financeiro/Financeiro.css";
import moment from 'moment';

const headerProps = {
  icon: 'money',
  title: 'Financeiro',
};

const baseUrl = 'http://localhost:7069';

export default class Financeiro extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startDate: '', // Data de início do filtro
      endDate: '',   // Data de término do filtro
      resumo: {
        totalCompras: 0,
        totalVendas: 0,
        lucro: 0,
      },
      compras: [],
      vendas: [],
    };
  }

  componentDidMount() {
    // Automatically load data when the component mounts
    this.loadData();
  }

  async loadData() {
    const { startDate, endDate } = this.state;

    // Check if both start and end dates are selected
    if (startDate && endDate) {
      // Construa as URLs corretas para as solicitações com um intervalo de datas
      const comprasUrl = `${baseUrl}/compras`;
      const vendasUrl = `${baseUrl}/vendas`;
  
      try {
        const [comprasResponse, vendasResponse] = await Promise.all([
          axios.get(comprasUrl),
          axios.get(vendasUrl),
        ]);
  
        const compras = comprasResponse.data.filter((data) => {
          const dataCompra = moment(data.data, 'YYYY-MM-DD');
          return dataCompra.isSameOrAfter(startDate) && dataCompra.isSameOrBefore(endDate);
        });
  
        const vendas = vendasResponse.data.filter((data) => {
          const dataVenda = moment(data.data, 'YYYY-MM-DD');
          return dataVenda.isSameOrAfter(startDate) && dataVenda.isSameOrBefore(endDate);
        });
  
        this.setState({ compras, vendas }, () => {
          this.calcularResumo();
        });
      } catch (error) {
        console.error('Erro ao buscar compras ou vendas:', error);
      }
    }
  }

  calcularResumo() {
    const { compras, vendas } = this.state;
    const totalCompras = compras.reduce((total, compra) => total + compra.total, 0);
    const totalVendas = vendas.reduce((total, venda) => total + venda.total, 0);
    const lucro = totalVendas - totalCompras;

    const resumo = {
      totalCompras,
      totalVendas,
      lucro,
    };


    this.setState({ resumo });
  }

  handleStartDateChange = (event) => {
    const newStartDate = event.target.value;
    this.setState({ startDate: newStartDate }, () => {
      // After setting the new start date, automatically load data if both dates are selected
      this.loadData();
    });
  }

  handleEndDateChange = (event) => {
    const newEndDate = event.target.value;
    this.setState({ endDate: newEndDate }, () => {
      // After setting the new end date, automatically load data if both dates are selected
      this.loadData();
    });
  }

  render() {
    const { startDate, endDate, resumo } = this.state;

    return (
      <Main {...headerProps}>
        <div>
          <div className="separador-financ">
            <div className="title"><strong><br />FINANCEIRO</strong></div>
          </div>
          <div className="container-financ">
            <h2>Selecione as datas de início e fim</h2>
            <div className="date-filters">
              <input
                type="date"
                value={startDate}
                onChange={this.handleStartDateChange}
              />
              <input
                type="date"
                value={endDate}
                onChange={this.handleEndDateChange}
              />
            </div>
            <div className="resumo">
              <p>Total de Compras: R$ {resumo.totalCompras}</p>
              <p>Total de Vendas: R$ {resumo.totalVendas}</p>
              <p>Lucro: R$ {resumo.lucro}</p>
            </div>
          </div>
        </div>
      </Main>
    );
  }
}
