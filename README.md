# Finansys

Finansys é uma aplicação web composta por:
- Backend em Node.js (Express 5, Sequelize/MSSQL) servido na porta 3000
- Frontend em React (Vite + Tailwind)
- Proxy reverso Nginx com HTTPS válido via Let’s Encrypt para finansys.site

## Visão Geral
- Backend: [server.ts](file:///c:/Users/kallil.lopes/Documents/Finansys/backend/src/server.ts) serve os estáticos de [frontend/dist](file:///c:/Users/kallil.lopes/Documents/Finansys/frontend/dist) e expõe rotas `/auth`.
- Conexão com banco: [database.ts](file:///c:/Users/kallil.lopes/Documents/Finansys/backend/src/config/database.ts) usa Sequelize com MSSQL (tedious).
- Autenticação: [authController.ts](file:///c:/Users/kallil.lopes/Documents/Finansys/backend/src/controllers/authController.ts) (login, registro, verificação).
- E-mail opcional: [emailService.ts](file:///c:/Users/kallil.lopes/Documents/Finansys/backend/src/services/emailService.ts) usa Resend (não falha sem chave).
- Frontend chama a API com URL relativa (evita “mixed content”): [api.js](file:///c:/Users/kallil.lopes/Documents/Finansys/frontend/src/services/api.js).

## Estrutura
```
Finansys/
  backend/         # API Express + Sequelize
  frontend/        # React + Vite + Tailwind
  setup-lets-encrypt.sh  # Emissão HTTPS válida (Nginx + Certbot)
  deploy-fix.sh          # Copia build do frontend para o diretório correto
  check-status.sh        # Verifica Nginx e certificado
  verify-cert.sh         # Checagens de SSL rápidas
```

## Desenvolvimento Local
Backend:
```
cd backend
npm install
npm run dev        # dev com ts-node/nodemon
# ou
npm run build && npm start
```
Frontend:
```
cd frontend
npm install
npm run dev        # abre http://localhost:5173
# build de produção
npm run build
```

## Deploy de Frontend (Servidor)
O backend serve arquivos de `/home/kallil_lopes/frontend/dist`. Use:
```
# Copiar build recente
scp -i ~/Finansys.pem -o StrictHostKeyChecking=no -r frontend/dist/* \
    kallil_lopes@172.184.250.242:/home/kallil_lopes/frontend/dist/

# Reiniciar app
ssh -i ~/Finansys.pem -o StrictHostKeyChecking=no \
    kallil_lopes@172.184.250.242 "pm2 restart finansys && pm2 save"
```
Alternativa automatizada: execute no servidor `sudo bash /home/kallil_lopes/deploy-fix.sh`.

## HTTPS Válido (Nginx + Let’s Encrypt)
Script pronto: [setup-lets-encrypt.sh](file:///c:/Users/kallil.lopes/Documents/Finansys/setup-lets-encrypt.sh)

Pré-requisitos:
- finansys.site e www.finansys.site apontam para o IP do servidor (A record)
- Porta 80 aberta (validação do Certbot) e 443 aberta (HTTPS)

Instalação e emissão:
```
sudo bash /home/kallil_lopes/setup-lets-encrypt.sh
```
Verificações:
```
sudo bash /home/kallil_lopes/check-status.sh finansys.site
curl -Ik https://finansys.site
```
O index do servidor deve referenciar o JS recente (ex.: `assets/index-*.js`). Se o navegador mostrar arquivo antigo, faça hard refresh (Ctrl+F5).

## Variáveis de Ambiente (backend/.env)
```
DB_HOST=dksystem.database.windows.net
DB_USER=<usuario>
DB_PASS=<senha>
DB_NAME=Finansys
PORT=3000
RESEND_API_KEY=<opcional>
JWT_SECRET=<segredo JWT>
```

## Comandos Úteis (Servidor)
```
# PM2
pm2 start /home/kallil_lopes/backend/dist/server.js --name finansys
pm2 restart finansys
pm2 save
pm2 list

# Nginx
sudo nginx -t && sudo systemctl reload nginx

# Certificado (resumo)
sudo openssl x509 -in /etc/letsencrypt/live/finansys.site/cert.pem \
  -noout -subject -issuer -dates
```

## Troubleshooting
- 502 Bad Gateway: backend não está rodando ou falhou ao iniciar. Verifique `pm2 list` e logs (`pm2 logs finansys`). Reinicie com `pm2 restart finansys`.
- Banco indisponível: o backend inicia em “Offline Mode” para evitar queda total. Configure regra de firewall no Azure SQL permitindo o IP do servidor; confirme credenciais em [database.ts](file:///c:/Users/kallil.lopes/Documents/Finansys/backend/src/config/database.ts) e reinicie.
- “v.map is not a function”: ocorre se o JS antigo estiver em cache/servido. Garanta que o build está em `/home/kallil_lopes/frontend/dist` e o index do servidor referencia o arquivo novo. Faça hard refresh.
- Mixed Content: o frontend usa URL relativa (ver [api.js](file:///c:/Users/kallil.lopes/Documents/Finansys/frontend/src/services/api.js)), evitando chamar `http://localhost` em produção.

## Segurança
- `.env` está ignorado no Git ([.gitignore](file:///c:/Users/kallil.lopes/Documents/Finansys/.gitignore)). Não versionar segredos.
- O serviço de e-mail não quebra sem `RESEND_API_KEY` (usa log/silent fail).

## Endpoints Principais
- `POST /auth/register` – cria usuário e dispara verificação
- `POST /auth/login` – autentica e retorna `token` + `user`
- `POST /auth/verify-email` – confirma token de verificação

## Contato
Qualquer ajuste adicional de deploy, banco ou automações, abra um issue no repositório ou solicite diretamente. 
