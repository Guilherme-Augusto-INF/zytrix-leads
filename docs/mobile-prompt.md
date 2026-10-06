# Prompt — versão mobile

Transformar o Zytrix Leads existente em uma PWA para celular, com custo adicional R$0. Reutilizar código e preservar busca, evidências, scores, pipeline e contato manual. Não criar APK nem publicar em lojas nesta etapa.

Adicionar manifest, ícones PNG normais/maskable/Apple, orientação de instalação Android/iOS, navegação inferior, menu acessível, cards iniciais mobile, safe areas e campos legíveis. Não bloquear zoom. Adaptar detalhes, agenda, tabelas e mapa.

Manter APIs, leads, mensagens, autenticação, RSC e mapas fora do cache offline. Cache apenas de aviso público estático e ícones. Falhas offline devem pedir reconexão, sem fila de mutações, envio automático ou promessa de notificações com app fechado. Login continua obrigatório.

Verificar comportamento do service worker, manifest, ícones, autenticação e build; executar regressões necessárias e /devil. Enviar mudanças ao GitHub por branch/PR e publicar no site atual preservando acesso privado. Não excluir a aplicação nem o banco até validar uma futura migração. Declarar separadamente validação automatizada e instalação real no aparelho.
