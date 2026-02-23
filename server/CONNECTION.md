# Erro querySrv ECONNREFUSED (MongoDB Atlas)

Se aparecer `querySrv ECONNREFUSED _mongodb._tcp....`, sua rede ou DNS não está resolvendo o endereço SRV do Atlas. Use a **connection string no formato standard**.

## Como obter o URI standard no Atlas

1. Acesse **https://cloud.mongodb.com** e entre no seu projeto.
2. Clique em **Database** → no seu cluster (**sololeveling**) → botão **Connect**.
3. Escolha **"Connect using MongoDB Compass"** (ou "Drivers").
4. Se aparecer só o URI `mongodb+srv://...`, anote o **nome do cluster** (ex: `sololeveling`) e o domínio (ex: `4glhjfc.mongodb.net`).
5. O host standard costuma ser: `NOMECLUSTER-shard-00-00.4glhjfc.mongodb.net` (troque pelo seu domínio).
6. Monte o URI assim (troque USER, PASSWORD, HOST e db name):
   ```
   mongodb://USER:PASSWORD@HOST:27017/sologym?ssl=true&authSource=admin
   ```
   Exemplo:
   ```
   mongodb://arthuzinhojesus2013_db_user:SUA_SENHA@sololeveling-shard-00-00.4glhjfc.mongodb.net:27017/sologym?ssl=true&authSource=admin
   ```

## No projeto

No arquivo **`server/.env`**:

- **Opção A:** Defina só `MONGODB_URI` com o URI standard (substitua o que tem):
  ```
  MONGODB_URI=mongodb://usuario:senha@sololeveling-shard-00-00.4glhjfc.mongodb.net:27017/sologym?ssl=true&authSource=admin
  ```

- **Opção B:** Mantenha `MONGODB_URI` e adicione `MONGODB_URI_STANDARD` (o código usa esse primeiro):
  ```
  MONGODB_URI_STANDARD=mongodb://usuario:senha@host:27017/sologym?ssl=true&authSource=admin
  ```

Se a senha tiver caracteres especiais (@, #, etc.), use URL encode (ex: `@` → `%40`).

Depois reinicie o servidor: `npm run dev`.
