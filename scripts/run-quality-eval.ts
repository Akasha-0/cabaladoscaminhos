/**
 * Run Quality Evals - Executa todos os evals e gera relatório
// NOTE: Run with: ./node_modules/.bin/tsx scripts/run-quality-eval.ts

// Use tsx: ./node_modules/.bin/tsx scripts/run-quality-eval.ts

async function main() {
  console.log('\n🔮 Executando Avaliação de Qualidade - Cabala dos Caminhos\n')
  
  const report = await runAllEvals({
    output: 'console',
    verbose: false,
  })

  if (report) {
    console.log('\n✨ Avaliação concluída com sucesso!')
    console.log(`📊 Score Overall: ${report.overallScore.toFixed(1)}% (Grade: ${report.grade})`)
    console.log('\n📄 Relatório JSON salvo em: ./quality-report-latest.json')
    
    if (report.overallScore < 70) {
      console.log('\n⚠️  Score overall abaixo do threshold (70%).')
      process.exit(1)
    }
  } else {
    console.error('\n❌ Falha ao gerar relatório')
    process.exit(1)
  }
}

main().catch(console.error)