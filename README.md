# 🍔 Capangai Food Challenge

Uma aplicação divertida para competições de comida entre amigos! Crie salas, compartilhe links e veja quem consegue comer mais com a ajuda de IA para detectar os componentes dos lanches.

## 🚀 Funcionalidades

- **Sistema de Salas**: Crie competições e compartilhe códigos de convite
- **Registro de Participantes**: Cada colega se registra com nome
- **Upload de Fotos**: Foto inicial e final do lanche
- **Detecção por IA**: Identifica automaticamente componentes do lanche
- **Sistema de Pontuação**: Simples (1pt), Duplo (2pts), Triplo (3pts)
- **Ranking em Tempo Real**: Veja quem está ganhando!

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Banco de Dados**: Prisma + SQLite
- **Upload de Imagens**: Cloudinary
- **IA**: API de visão computacional (a implementar)

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd capangai
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
npx prisma generate
npx prisma db push
```

4. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

5. **Execute o projeto**
```bash
npm run dev
```

## 🎯 Como Usar

### Para o Moderador (Você)
1. Acesse a página inicial
2. Clique em "Criar Nova Competição"
3. Digite o nome da competição
4. Compartilhe o código de convite com seus colegas

### Para os Participantes
1. Acesse o link da competição
2. Digite o código de convite
3. Registre seu nome
4. Tire fotos do lanche antes e depois
5. Veja seu ranking!

## 📊 Itens da Competição

- **Pão** - Base do lanche
- **Carne** - Proteína principal
- **Salada** - Vegetais
- **Bacon** - Proteína extra
- **Ovo** - Proteína adicional
- **Queijo** - Laticínio
- **Batata** - Acompanhamento
- **Batata com Bacon** - Acompanhamento premium
- **Limpeza** - Grau de limpeza do prato

## 🤖 IA e Detecção

A aplicação usa inteligência artificial para:
- Detectar automaticamente os componentes do lanche
- Identificar o grau de limpeza (simples/duplo/triplo)
- Preencher automaticamente a tabela de pontuação

## 🎨 Interface

- Design responsivo e moderno
- Gradientes coloridos inspirados em comida
- Ícones intuitivos
- Animações suaves
- Loading states informativos

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Verificar código
npm run db:push      # Sincronizar banco
npm run db:studio    # Abrir Prisma Studio
```

## 📁 Estrutura do Projeto

```
capangai/
├── src/
│   ├── app/                 # App Router (Next.js 14)
│   │   ├── api/            # APIs
│   │   ├── room/[id]/      # Páginas da sala
│   │   └── globals.css     # Estilos globais
│   ├── components/         # Componentes React
│   └── lib/               # Utilitários
├── prisma/                # Schema do banco
└── public/               # Arquivos estáticos
```

## 🚀 Deploy

1. **Vercel** (Recomendado)
   - Conecte seu repositório
   - Configure as variáveis de ambiente
   - Deploy automático

2. **Outras plataformas**
   - Build: `npm run build`
   - Start: `npm run start`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📝 Licença

Este projeto é open source e está sob a licença MIT.

## 🎉 Agradecimentos

- Inspirado nas competições de comida da faculdade
- Desenvolvido com muito carinho e fome! 🍔

---

**Divirta-se competindo! Quem vai comer mais?** 🏆 