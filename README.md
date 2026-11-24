# VJA Imóveis - Lançamentos & Negócios Imobiliários de Alto Padrão

Site institucional e landing page oficial da **VJA Negócios Imobiliários Ltda.** (CRECI 55121-J), localizada na Avenida Paulista, 1471 (Conjunto 1110), São Paulo/SP.

## 🌟 Funcionalidades Principais
- **Design Premium Liquid Glass**: Estética de luxo nas cores preto obsidiana (`#06070a`) e dourado líquido (`#ecc86a`), com efeitos de glassmorphism, profundidade e iluminação especular dinâmica.
- **Painel de Gestão da Proprietária (Área da Gestão)**:
  - Protegido por senha.
  - **Edição Completa de Imóveis**: Botão **"Editar"** em cada imóvel na lista de gestão (e atalhos rápidos nos cards para administradores autenticados).
  - **Upload de Fotos em Tempo Real**: Botão destacado **"Fazer Upload de Nova Foto"** com suporte para upload direto da galeria do celular ou do computador, com compressão automática de alta qualidade (1200x900) e pré-visualização instantânea.
  - **Cadastro de Novos Imóveis**: Formulário para novos empreendimentos com foto, região, preço, metragem, dormitórios, diferenciais e texto personalizado do WhatsApp.
  - **Gerenciamento e Exclusão**: Opção de remover imóveis vendidos ou desativados com 1 clique.
  - **Backup & Exportação**: Exportação dos dados atualizados em formato JSON.
- **Classificação Completa por 7 Regiões**:
  1. *Zona Norte* (Santana, Parada Inglesa, etc.)
  2. *Zona Sul* (Santo Amaro, João Dias, Ipiranga, etc.)
  3. *Zona Leste* (Tatuapé, Mooca, etc.)
  4. *Zona Oeste* (Pinheiros, Perdizes, etc.)
  5. *Centro & Paulista* (Bela Vista, Santa Cecília, Angélica, etc.)
  6. *Barueri* (Aldeia de Barueri, Alphaville, etc.)
  7. *Osasco* (Centro, etc.)
- **Portfólio Dinâmico com Busca em Tempo Real**:
  - Filtros instantâneos por região com contador de imóveis por categoria.
  - Campo de busca em tempo real.
- **Integração WhatsApp Direta**:
  - Botão flutuante de atendimento para Stephany Amorim (`(11) 93277-4040`).
  - Cada imóvel possui link direto com mensagem personalizada já citando o empreendimento.
- **Localização com Google Maps**: Av. Paulista, 1471 - Conjunto 1110.

## 📁 Estrutura de Arquivos
- `index.html`: Estrutura semântica, metatags de SEO, catálogo dinâmico, modal de gestão e formulário de edição de imóveis e fotos.
- `style.css`: Design system Liquid Glass responsivo com modal administrativo, dropzone de fotos e visualização de edição.
- `script.js`: Gerenciamento de estado, carregamento do catálogo, autenticação da proprietária, edição com upload e compressão de fotos e filtros.
- `properties.json`: Base de dados dos imóveis iniciais.
- `images/`: Imagens em alta definição dos empreendimentos.
- `cartaofrente.jpeg` e `cartaocostas.jpeg`: Identidade visual oficial e cartão de visita.
