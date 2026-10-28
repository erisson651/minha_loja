

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClientesService } from '../../services/clientes';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes {
  constructor(private clientesService: ClientesService) {}

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

  salvando = false;

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

    const dadosCliente = {
      idPessoa: 0,
      nome: this.cliente.nome.trim(),
      cpf: Number(this.cliente.cpf.replace(/\D/g, '')),
      dataNascimento: this.cliente.dataNascimento,
      sexo: this.cliente.sexo,
      email: this.cliente.email.trim(),
      telefone: Number(this.cliente.telefone.replace(/\D/g, '')),
      ativoPessoa: 'S',
      enderecos: [
        {
          idEndereco: 0,
          cep: this.cliente.cep.replace(/\D/g, ''),
          numero: this.cliente.numero.trim(),
          complemento: [
            this.cliente.rua.trim(),
            this.cliente.bairro.trim(),
            this.cliente.cidade.trim(),
            this.cliente.uf.trim()
          ].join(', ')
        }
      ]
    };

    if (
      !Number.isSafeInteger(dadosCliente.cpf) ||
      !Number.isSafeInteger(dadosCliente.telefone)
    ) {
      this.mensagem = 'Confira o CPF e o telefone informados.';
      return;
    }

    this.salvando = true;

    this.clientesService.cadastrarCliente(dadosCliente).subscribe({
      next: () => {
        this.mensagem = 'Cliente cadastrado com sucesso!';
        this.limparCampos();
        this.salvando = false;
      },
      error: (erro: any) => {
        if (erro.status === 409) {
          this.mensagem = 'Este CPF já está cadastrado.';
        } else if (erro.status === 400) {
          this.mensagem =
            'Os dados enviados foram rejeitados. Confira os campos.';
        } else {
          this.mensagem =
            'Não foi possível cadastrar. Verifique se a API C# está em execução.';
        }

        console.error('Erro ao cadastrar cliente:', erro);
        this.salvando = false;
      }
    });
  }

  private limparCampos() {
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
  }

  limparFormulario() {
    this.limparCampos();
    this.mensagem = '';
  }
}
