# Como trocar a logo

A logo é um arquivo de imagem simples, não código. Para trocar:

1. Pegue o arquivo da sua logo (o mesmo PNG/JPG que você já tem salvo, exportado
   do editor onde criou/recebeu a imagem — não dá pra "salvar" uma imagem colada
   aqui no chat, então precisa ser o arquivo original no seu computador).
2. Renomeie esse arquivo para `logo.png`.
3. Copie para dentro da pasta `public/` deste projeto:
   `C:\Users\User\Desktop\espaco-ligia-ramos\public\logo.png`
4. Pronto. Não precisa reiniciar nada — o Next.js serve arquivos de `public/`
   direto. Só recarregue a página no navegador.

A logo aparece em três lugares (sidebar, tela de login desktop e mobile) e
todos apontam para esse mesmo arquivo (`src/components/layout/logo-mark.tsx`),
então trocar o arquivo atualiza os três de uma vez.

## Dicas de formato

- Prefira um PNG com fundo transparente, se sua logo tiver fundo transparente
  — assim ela não fica com uma caixa branca/quadrada ao redor.
- Se sua logo já é um círculo sólido (como a que você mostrou), um PNG comum
  (sem transparência) funciona igual, porque o próprio componente já corta em
  círculo (`rounded-full`).
- Tamanho recomendado: pelo menos 200×200px, para ficar nítida também na tela
  de login (onde ela aparece maior).
- Se preferir usar um `.svg` em vez de `.png`, salve como `public/logo.svg` e
  troque `src="/logo.png"` para `src="/logo.svg"` em
  `src/components/layout/logo-mark.tsx` (uma linha só).
