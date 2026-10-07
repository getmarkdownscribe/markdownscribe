// Sprint 11 / MKD-133: versão do CLI no User-Agent, pela mesma razão e com a
// mesma guarda do SDK — `version.test.ts` compara com o `package.json` e
// quebra o build se divergirem.
//
// Sem esta identificação o CLI seria indistinguível do SDK em `op_metrics`, e
// perderíamos a separação entre "alguém chamou do terminal" e "alguém chamou
// de dentro de um programa" — que é justamente a distinção que a taxa de
// adoção por agente precisa enxergar.
export const CLI_VERSION = "0.1.0";
