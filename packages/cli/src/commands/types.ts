export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  /**
   * Saldo restante depois da ultima chamada cobrada do comando
   * (Sprint 11 / MKD-132). Quem imprime o aviso e o bin.ts, uma vez so —
   * o comando apenas informa o numero. Ausente quando nada foi cobrado.
   */
  // `| undefined` explicito por causa de exactOptionalPropertyTypes no
  // tsconfig: a opcao distingue "propriedade ausente" de "propriedade
  // presente valendo undefined", e os comandos produzem o segundo caso.
  creditsRemaining?: number | undefined;
}
