
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes {
  cliente = {
    nome: '',
    cpf: '',
    dataNascimento: '',
    sexo: '',
    email: '',
    telefone: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: ''
  };

  mensagem = '';

  salvarCliente() {
    this.mensagem = '';

    if (
      !this.cliente.nome.trim() ||
      !this.cliente.cpf.trim() ||
      !this.cliente.dataNascimento ||
      !this.cliente.sexo ||
      !this.cliente.email.trim() ||
      !this.cliente.telefone.trim() ||
      !this.cliente.cep.trim() ||
      !this.cliente.rua.trim() ||
      !this.cliente.numero.trim() ||
      !this.cliente.bairro.trim() ||
      !this.cliente.cidade.trim() ||
      !this.cliente.uf.trim()
    ) {
      this.mensagem = 'Preencha todos os campos obrigatórios.';
      return;
    }

    this.mensagem =
      'Formulário validado. O cadastro será conectado à API na próxima etapa.';
  }

  limparFormulario() {
    this.cliente = {
      nome: '',
      cpf: '',
      dataNascimento: '',
      sexo: '',
      email: '',
      telefone: '',
      cep: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: ''
    };

    this.mensagem = '';
  }
}
