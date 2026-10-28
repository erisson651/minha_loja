
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './funcionarios.html',
  styleUrl: './funcionarios.css'
})
export class Funcionarios {
  funcionario = {
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: '',
    dataAdmissao: ''
  };

  mensagem = '';

  salvarFuncionario(): void {
    this.mensagem = '';

    if (
      !this.funcionario.nome.trim() ||
      !this.funcionario.cpf.trim() ||
      !this.funcionario.email.trim() ||
      !this.funcionario.telefone.trim() ||
      !this.funcionario.cargo.trim() ||
      !this.funcionario.dataAdmissao
    ) {
      this.mensagem = 'Preencha todos os campos obrigatórios.';
      return;
    }

    this.mensagem =
      'Formulário validado. O cadastro será conectado à API posteriormente.';
  }

  limparFormulario(): void {
    this.funcionario = {
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      cargo: '',
      dataAdmissao: ''
    };

    this.mensagem = '';
  }
}
