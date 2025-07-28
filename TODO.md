# 🍔 Capangai Food Challenge - TODO List

## 📋 Estrutura do Projeto
- [x] Criar TODO.md
- [x] Configurar Next.js 14 com TypeScript
- [x] Configurar Tailwind CSS
- [x] Configurar Prisma + SQLite
- [ ] Configurar Cloudinary para upload de imagens

## 🗄️ Banco de Dados
- [x] Criar schema Prisma
- [x] Configurar modelos: Room, Participant, Item, Photo, Score
- [ ] Criar migrations
- [ ] Configurar seed data

## 🏠 Páginas Principais
- [x] Página inicial (/) - Criar/Entrar em sala
- [x] Página da sala (/room/[id]) - Dashboard da competição
- [x] Página de registro (/room/[id]/join) - Participante se registra
- [x] Página de pontuação (/room/[id]/participant/[id]/score) - Sistema de pontuação

## 🧩 Componentes
- [x] CreateRoomForm - Formulário para criar sala
- [x] JoinRoomForm - Formulário para entrar na sala
- [x] RoomCard - Card da sala com informações
- [x] ParticipantTable - Tabela de participantes
- [x] ParticipantRegistration - Registro de participantes
- [x] PhotoModal - Modal para visualizar fotos
- [x] ScoreTable - Tabela de pontuação
- [ ] ItemSelector - Seletor de itens (simples/duplo/triplo)
- [ ] RankingBoard - Ranking dos participantes

## 🔌 APIs
- [x] POST /api/rooms - Criar sala
- [x] GET /api/rooms/[id] - Buscar sala
- [x] GET /api/rooms/validate/[inviteCode] - Validar código de convite
- [x] POST /api/rooms/[id]/participants - Adicionar participante
- [x] POST /api/rooms/[id]/participants/[id]/photos - Upload de fotos
- [x] POST /api/rooms/[id]/scores - Salvar pontuação
- [ ] GET /api/rooms/[id]/ranking - Buscar ranking

## 🤖 IA e Detecção
- [ ] Integrar API de visão computacional
- [ ] Detectar componentes do lanche (pão, carne, salada, etc.)
- [ ] Detectar grau de limpeza (simples/duplo/triplo)
- [ ] Processar fotos automaticamente

## 🎨 UI/UX
- [x] Design responsivo
- [x] Animações e transições
- [x] Loading states
- [x] Error handling
- [x] Toast notifications
- [x] Thumbnails de fotos
- [x] Modal para visualização de fotos
- [x] DebugInfo component para troubleshooting
- [x] Upload real de fotos (base64)
- [x] Remover fotos (botão X e "Remover")
- [x] Pontuação automática baseada na foto inicial
- [x] Pontuação de limpeza baseada na foto final
- [x] Flexão de gênero na pontuação (Simples/Dupla/Tripla)
- [x] Mesa dos participantes com avatares (estilo planning poker, ao redor da mesa)
- [x] Interface limpa (removidos cards de estatísticas desnecessários)
- [x] Header simplificado (apenas código de convite)
- [x] "Mesa dos Capangas" com código de convite ao lado do título
- [x] Scroll automático ao clicar no avatar (navegação suave)
- [x] Botão "Revelar Pontuações" no centro da mesa (só ativo quando todos enviaram as duas fotos)
- [x] Troféu ao lado do avatar do vencedor
- [x] Nome do moderador no formulário de criação da sala
- [x] Exibição do nome do moderador no header da sala
- [x] Moderador automaticamente adicionado como participante
- [x] Modal de upload de fotos ao clicar no avatar
- [x] Interface simplificada nos cards dos participantes
- [x] Atualização automática do modal após upload de fotos
- [x] Logs detalhados para debug do problema de atualização
- [x] Recarregamento automático da modal após upload/remoção de fotos

## 🧪 Testes
- [ ] Testes unitários para componentes
- [ ] Testes de integração para APIs
- [ ] Testes E2E para fluxo completo

## 🚀 Deploy
- [ ] Configurar Vercel
- [ ] Configurar variáveis de ambiente
- [ ] Configurar banco de dados em produção

## 📝 Documentação
- [ ] README.md com instruções
- [ ] Documentação da API
- [ ] Guia de contribuição

## 🔧 Configurações
- [ ] ESLint
- [ ] Prettier
- [ ] Husky para git hooks
- [ ] TypeScript strict mode

---

## 🎯 Prioridades
1. **Alta**: Estrutura básica + Páginas principais
2. **Média**: Sistema de upload + IA
3. **Baixa**: Polimento UI + Testes

## 📊 Progresso
- [x] 0% - Estrutura inicial
- [x] 25% - Páginas básicas
- [x] 50% - Sistema de salas
- [x] 75% - Upload e registro
- [ ] 100% - Completo 