![logo com texto](/web/src/assets/logo.svg)

Este projeto tem como finalidade ajudar as pessoas que tem resíduos a encontrar locais que podem recebe-los.

Desenvolvido durante a Next Level Week da [Rocketseat](https://rocketseat.com.br/).

# Extras

## Desenvolvimento
- Usando a extensão Dev Container do VS Code este projeto já tem
os scripts necessários para construir o container de desenvolvimento 
expondo as portas do expo, do backend e do frontent. 

    **Nota**: O qrcode do 
expo vai ser gerado com o IP da rede interna do container ao invés do
IP da máquina física. Eu não achei solução mais simples pra esse problema
do que montar a URL que começa com ```exp://``` na mão, mandar para o celular e
chamar da área de transferencia, o que funciona perfeitamente.

## App mobile
- O botão de voltar no react native está em um componente separado. Me deu um 
TOC, ou paranoia dessa duplicidade de código ai eu deixei isso em um componente
a parte. A pasta que eu deixei foi meio que por intuição, depois eu vi que é
assim mesmo :v.

- Enquanto um ponto carrega na página especial de cada ponto eu coloquei que o
nome do lugar é carregando..., coisa que a maioria das pessoas nem vai perceber.
Eu tinha que colocar alguma coisa pra inicializar o estado, né :v.

- O gps começa no meio do oceano por padrão (posição 0 0), se o usuário não quiser dar permissão
de gps não tem problema. Não gosto de app que fica forçando barra com permissão para coisas 
não essenciais.

- Ao invés do mapa teleportar para a posição do usuário
ele vai dar essa opção do mesmo jeito que é no maps do google, em um botão.

- O app tem um entendimento básico se a url que ele recebeu da API precisa da base da API ou a 
URL já ta pronta para usar direto. Ganhei um tempo na ultima aula com isso.

## Website React
- Utilitários de debug do axios que só é necessário descomentar. São basicamente dois interceptadores,
um para request e outro para response. Como é a mesma lib de request para mobile pode ser que só copiando e 
colando o código no serviço da api funciona.

- Erros, avisos e afins serão reportados como um toast, uma notificaçãozinha no canto da tela que 
some em 5s, e não no console. Bem prática e simples de usar aquela [lib](https://github.com/fkhadra/react-toastify)...

- Hook useOptionHandler no componente CreatePoint. Eu poderia deixar em um arquivo separado mas como tem só essa 
hook e ela é usada só nesse componente eu acho que não vale a pena. Provavelmente eu ainda vou fazer isso.

## Backend
- Suporta dotenv (peguei o costume de usar em todo servicinho que eu faço kkkk)
- A pasta de dados por padrão é a pasta data na raiz do projeto, mas pode ser alterada usando a variável de ambiente DATA_FOLDER
- HTTP_PORT = porta onde o servidor vai escutar
- Configurações condicionais para o knex, por enquanto só configurei para o sqlite3. Se eu usar postgres no futuro ele
não vai reclamar que uma configuração do sqlite não foi setada. 
- O multer só vai aceitar receber png ou jpeg, isso é por que o react native não suporta SVG out of the box. O match é pelo
mime-type.
- Os nomes das imagens são gerados usando o sha1 delas mais a extensão.
- As endpoints de api são funções assíncronas mas é um saco quando da um erro nelas e a request não retorna nunca.
  Tem um [router drop-in](https://www.npmjs.com/package/express-promise-router) que resolve esse problema. Nas rotas 
  que tem uma ```function(request, response)``` quando tu define o roteador ao invés de usar o express.Router usa o dessa 
  lib que o erro cai pro middleware de erro tratar.
- Eu escrevi o meu próprio middleware de tratar erro. A api inteira eu padronizei os retornos pra interface abaixo e não
quero que o celebrate ou qualquer outra coisa muda essa estrutura então eu fiz uma função que constroi um objeto de erro
e da throw nele, ai esse meu middleware trata e retorna no seguinte formato:

```typescript
interface ApiResponse<T> {
  error?: string
  data?: T
}
```

  A função que dá o erro é a 
```typescript
function throwApiError(status: number, message: string) {
    throw {
        status,
        message
    }
}
```

  Não dá unhandled promise rejection por causa daquele roteador drop-in, a request cai para o error handler e ele responde no
formato. Se o tipo do erro não for especificado é 500, a menos que o erro seja expedido pelo joi/celebrate. Nisso é checado
se é e esse erro vira 400 (bad request).


## Comum entre todos
- Typescript, typescript everywhere

- O css não fui eu que fiz, ele foi fornecido pelo Diego da Rocketseat nas aulas.

- Nenhuma classe foi criada, nem mesmo a controller.
