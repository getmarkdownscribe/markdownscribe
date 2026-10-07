// Sprint 11 / MKD-133: a versão que vai no User-Agent.
//
// Por que constante no código, e não leitura do package.json em tempo de
// execução: ler o arquivo exige `createRequire` ou import attributes, e as
// duas coisas quebram em bundler — este pacote é publicado e vai ser
// empacotado por gente que não controlamos. Uma constante funciona em
// qualquer alvo.
//
// O risco óbvio de constante escrita à mão é apodrecer: publicamos 0.2.0 e o
// User-Agent continua dizendo 0.1.0, e a métrica de adoção por versão passa
// a mentir sem nunca falhar. Por isso existe `version.test.ts`, que compara
// esta constante com o `package.json` e QUEBRA o build quando divergirem.
// A constante é manual; a sincronia não é.
export const SDK_VERSION = "0.1.0";
