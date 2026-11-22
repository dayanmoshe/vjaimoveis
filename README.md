# VJA Imóveis - Lançamentos & Negócios Imobiliários de Alto Padrão

Site institucional e landing page oficial da **VJA Negócios Imobiliários Ltda.** (CRECI 55121-J), localizada na Avenida Paulista, 1471 (Conjunto 1110), São Paulo/SP.

## 🌟 Funcionalidades Principais
- **Design Premium Liquid Glass**: Estética de luxo nas cores preto obsidiana (`#06070a`) e dourado líquido (`#ecc86a`), com efeitos de glassmorphism, profundidade e iluminação especular dinâmica.
- **Classificação Completa por 7 Regiões**:
  1. *Zona Norte* (Santana, Parada Inglesa, etc.)
  2. *Zona Sul* (Santo Amaro, João Dias, Ipiranga, etc.)
  3. *Zona Leste* (Tatuapé, Mooca, etc.)
  4. *Zona Oeste* (Pinheiros, Perdizes, etc.)
  5. *Centro & Paulista* (Bela Vista, Santa Cecília, Angélica, etc.)
  6. *Barueri* (Aldeia de Barueri, Alphaville, etc.)
  7. *Osasco* (Centro, etc.)
- **Painel de Gestão da Proprietária (Área da Gestão)**:
  - Protegido por senha (padrão: `vja55121`).
  - Formulário para cadastrar novos imóveis com foto (upload direto do computador/celular ou URL), região, preço, metragem, dormitórios, diferenciais e texto personalizado do WhatsApp.
  - Gerenciamento de imóveis ativos com opção de remoção/exclusão com 1 clique.
  - Backup e exportação do catálogo completo em JSON.
- **Portfólio Dinâmico com Busca em Tempo Real**:
  - Filtros instantâneos por região com contador de imóveis por categoria.
  - Campo de busca em tempo real.
- **Integração WhatsApp Direta**:
  - Botão flutuante de atendimento para Stephany Amorim (`(11) 93277-4040`).
  - Cada imóvel possui link direto com mensagem personalizada já citando o empreendimento.
- **Localização com Google Maps**: Av. Paulista, 1471 - Conjunto 1110.

## 📁 Estrutura de Arquivos
- `index.html`: Estrutura semântica, metatags de SEO, catálogo dinâmico e modal de gestão.
- `style.css`: Design system Liquid Glass responsivo com modal administrativo e dropzone de fotos.
- `script.js`: Gerenciamento de estado, carregamento do catálogo, autenticação da proprietária, upload de fotos e filtros.
- `properties.json`: Base de dados dos imóveis iniciais.
- `images/`: Imagens em alta definição dos empreendimentos.
- `cartaofrente.jpeg` e `cartaocostas.jpeg`: Identidade visual oficial e cartão de visita.
