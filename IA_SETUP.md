# Configuração da OpenAI Vision API

## 1. Obter a Chave da API

1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Faça login ou crie uma conta
3. Vá para "API Keys" no menu lateral
4. Clique em "Create new secret key"
5. Copie a chave gerada

## 2. Configurar a Chave

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione a seguinte linha:
```
OPENAI_API_KEY=sua_chave_aqui
```

## 3. Testar a Integração

1. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Faça upload de uma foto de lanche
3. A IA deve analisar automaticamente e detectar os itens

## 4. Como Funciona

- **Foto Inicial**: A IA detecta itens como pão, carne, salada, queijo, batata, etc.
- **Foto Final**: A IA avalia a limpeza do prato
- **Pontuação**: Cada item detectado recebe pontos baseado na quantidade:
  - SIMPLE: 1 ponto (quantidade normal)
  - DUPLO: 2 pontos (quantidade maior)
  - TRIPLO: 3 pontos (quantidade muito maior)

## 5. Custos

- GPT-4 Vision tem custo por imagem analisada
- Recomendamos monitorar o uso no dashboard da OpenAI
- Para produção, considere implementar cache das análises

## 6. Fallback

Se a IA falhar, o sistema usa dados simulados para manter a funcionalidade. 