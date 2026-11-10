
import { ChangeDetectorRef, Component } from '@angular/core';
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

  constructor(
    private clientesService: ClientesService,
    private cdr: ChangeDetectorRef
  ) {}

  // Dados preenchidos pelo usuário no formulário
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

  // Método responsável por cadastrar o cliente
  salvarCliente() {
    this.mensagem = '';

    // Verifica se todos os campos obrigatórios foram preenchidos
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

    // Remove pontos, traços e outros caracteres do CPF
    const cpfLimpo = this.cliente.cpf.replace(/\D/g, '');

    // Verifica se o CPF possui exatamente 11 dígitos
    if (cpfLimpo.length !== 11) {
      this.mensagem = 'CPF inválido. Informe os 11 dígitos.';
      return;
    }

    // Remove caracteres que não sejam números do telefone
    const telefoneLimpo = this.cliente.telefone.replace(/\D/g, '');

    if (!telefoneLimpo || !Number.isSafeInteger(Number(telefoneLimpo))) {
      this.mensagem = 'Telefone inválido.';
      return;
    }

    const complemento = [
      this.cliente.rua.trim(),
      this.cliente.bairro.trim(),
      this.cliente.cidade.trim(),
      this.cliente.uf.trim()
    ].join(', ');

    if (complemento.length > 45) {
      this.mensagem = 'Rua, bairro, cidade e UF juntos devem caber em 45 caracteres.';
      return;
    }

    // Organiza os dados que serão enviados para a API
    const dadosCliente = {
      idPessoa: 0,
      nome: this.cliente.nome.trim(),
      cpf: Number(cpfLimpo),
      dataNascimento: this.cliente.dataNascimento,
      sexo: this.cliente.sexo,
      email: this.cliente.email.trim(),
      telefone: Number(telefoneLimpo),
      ativoPessoa: 'S',
      enderecos: [
        {
          idEndereco: 0,
          cep: this.cliente.cep.replace(/\D/g, ''),
          numero: this.cliente.numero.trim(),
          complemento
        }
      ]
    };

    // Informa que o cadastro está sendo enviado
    this.salvando = true;

    // Envia os dados para a API C#
    this.clientesService.cadastrarCliente(dadosCliente).subscribe({
      next: resposta => {
        const idCliente = Number(resposta?.idPessoa ?? resposta?.idpessoas);
        if (Number.isSafeInteger(idCliente) && idCliente > 0) {
          sessionStorage.setItem('idCliente', String(idCliente));
          this.mensagem = 'Cliente cadastrado com sucesso!';
        } else {
          sessionStorage.removeItem('idCliente');
          this.mensagem = 'Cadastro salvo, mas a API não retornou o ID do cliente.';
        }

        this.limparCampos();

        this.salvando = false;
        this.cdr.markForCheck();
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
        this.cdr.markForCheck();
      }
    });
  }

  // Limpa os campos do formulário
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

  // Limpa o formulário e a mensagem exibida
  limparFormulario() {
    this.limparCampos();
    this.mensagem = '';
  }
}
