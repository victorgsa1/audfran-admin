import React from "react";
import "../popup/PatientViewModal.css"

function PatientViewModal({ pacientes, onClose }) {
  if (!pacientes) {
    return null;
  }

  return (
    //NAO ESQUECE DE DAR CONSOLE LOG NO "PACIENTES" AQUI PARA VER SE É ESSE O PROBLEMA DE O BOTAO DE VISUALIZAR NAO FUNCIONAR
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <h2>Detalhes do Paciente</h2>
        <p>Nome: {pacientes.name}</p>
        <p>CPF: {pacientes.cpf}</p>
        <p>Telefone: {pacientes.telefone}</p>
        <p>Data de Nascimento: {pacientes.nascimento}</p>
        <p>Endereço: {pacientes.endereco}</p>
        <p>Data de Cadastro: {pacientes.cadastro}</p>
        <p>Tipo de Aparelho: {pacientes.lado}</p>
      </div>
    </div>
  );
}

export default PatientViewModal;