'use client';

import { useState, useEffect, useCallback } from 'react';

// fallow-ignore-next-line unused-type
export interface Afirmacao {
  id: string;
  texto: string;
  autor?: string;
}

const AFIRMACOES: Afirmacao[] = [
  { id: '1', texto: 'Eu sou digno de amor e respeito.', autor: 'Caminho Interior' },
  { id: '2', texto: 'Cada dia traz novas oportunidades de crescimento.', autor: 'Caminho Interior' },
  { id: '3', texto: 'A luz da minha alma ilumina o meu caminho.', autor: 'Caminho Interior' },
  { id: '4', texto: 'Eu libero o que não me serve e abraço o que beneficia.', autor: 'Caminho Interior' },
  { id: '5', texto: 'Minha intuição me guia com sabedoria.', autor: 'Caminho Interior' },
  { id: '6', texto: 'Eu sou parte integrante do universo e mereço paz.', autor: 'Caminho Interior' },
  { id: '7', texto: 'Agradeço pelas lições que cada experiência me oferece.', autor: 'Caminho Interior' },
  { id: '8', texto: 'Eu confio no ritmo natural da vida.', autor: 'Caminho Interior' },
  { id: '9', texto: 'Meu coração está aberto para receber e oferecer amor.', autor: 'Caminho Interior' },
  { id: '10', texto: 'Eu escolho pensamentos que nutrem meu bem-estar.', autor: 'Caminho Interior' },
  { id: '11', texto: 'A serenidade habita em mim em todos os momentos.', autor: 'Caminho Interior' },
  { id: '12', texto: 'Eu honro meu corpo como templo da minha essência.', autor: 'Caminho Interior' },
  { id: '13', texto: 'Minhas ações refletem minha verdadeira natureza.', autor: 'Caminho Interior' },
  { id: '14', texto: 'Eu perdoo a mim mesmo e aos outros com compaixão.', autor: 'Caminho Interior' },
  { id: '15', texto: 'A sabedoria antiga reside em meu interior.', autor: 'Caminho Interior' },
  { id: '16', texto: 'Eu crio o meu próprio destino com consciência e propósito.', autor: 'Caminho Interior' },
  { id: '17', texto: 'Cada respiração é uma renovação do meu ser.', autor: 'Caminho Interior' },
  { id: '18', texto: 'Eu me conecto com a energia sagrada que me sustenta.', autor: 'Caminho Interior' },
  { id: '19', texto: 'Minha mente está em paz e meu espírito está em harmonia.', autor: 'Caminho Interior' },
  { id: '20', texto: 'Eu sou grato pela jornada que me trouxe até aqui.', autor: 'Caminho Interior' },
  { id: '21', texto: 'O universo conspira a meu favor quando mantenho minha intenção clara.', autor: 'Caminho Interior' },
  { id: '22', texto: 'Eu aceito as mudanças como parte essencial do meu desenvolvimento.', autor: 'Caminho Interior' },
  { id: '23', texto: 'Minha alma irradia luz para todos que encontro.', autor: 'Caminho Interior' },
  { id: '24', texto: 'Eu cultivo paciência e gentileza comigo mesmo.', autor: 'Caminho Interior' },
  { id: '25', texto: 'As estrelas me lembram do meu lugar infinito no cosmos.', autor: 'Caminho Interior' },
  { id: '26', texto: 'Eu sou digno de realizar meus sonhos mais profundos.', autor: 'Caminho Interior' },
  { id: '27', texto: 'Cada ritual que pratico fortalece minha conexão espiritual.', autor: 'Caminho Interior' },
  { id: '28', texto: 'Eu honro os ciclos da natureza em meu ser.', autor: 'Caminho Interior' },
  { id: '29', texto: 'Minha voz interior é clara e merece ser ouvida.', autor: 'Caminho Interior' },
  { id: '30', texto: 'Eu permito que a magia do universo flua através de mim.', autor: 'Caminho Interior' },
  { id: '31', texto: 'A coragem de ser eu mesmo é minha maior virtude.', autor: 'Caminho Interior' },
  { id: '32', texto: 'Eu abençoo este dia com gratidão e presença.', autor: 'Caminho Interior' },
  { id: '33', texto: 'Meu mapa natal me revelou meu caminho; eu o sigo com alegria.', autor: 'Caminho Interior' },
  { id: '34', texto: 'A energia da lua alimenta minhas intenções.', autor: 'Caminho Interior' },
  { id: '35', texto: 'Eu sou um veículo de luz e amor neste mundo.', autor: 'Caminho Interior' },
  { id: '36', texto: 'Cada pensamento negativo que solto abre espaço para a luz.', autor: 'Caminho Interior' },
  { id: '37', texto: 'Eu me alinho com o fluxo natural do cosmos.', autor: 'Caminho Interior' },
  { id: '38', texto: 'A sabedoria dos anos me fortalece a cada dia.', autor: 'Caminho Interior' },
  { id: '39', texto: 'Eu carrego em mim a essência de todas as eras.', autor: 'Caminho Interior' },
  { id: '40', texto: 'O sagrado se manifesta através das minhas ações cotidianas.', autor: 'Caminho Interior' },
  { id: '41', texto: 'Eu respiro profundamente e libero toda tensão.', autor: 'Caminho Interior' },
  { id: '42', texto: 'Meu ser está em equilíbrio entre céu e terra.', autor: 'Caminho Interior' },
  { id: '43', texto: 'Eu acolho minhas sombras com amor, pois elas me completam.', autor: 'Caminho Interior' },
  { id: '44', texto: 'A meditação me ancora na paz do momento presente.', autor: 'Caminho Interior' },
  { id: '45', texto: 'Eu permito que a abundância flua naturalmente para mim.', autor: 'Caminho Interior' },
  { id: '46', texto: 'Cada planeta em meu mapa astral traz uma bênção.', autor: 'Caminho Interior' },
  { id: '47', texto: 'Eu danço entre as dimensões com graça e propósito.', autor: 'Caminho Interior' },
  { id: '48', texto: 'Meu coração conhece o caminho; eu o sigo.', autor: 'Caminho Interior' },
  { id: '49', texto: 'Eu honro a criança sagrada que habita em mim.', autor: 'Caminho Interior' },
  { id: '50', texto: 'A noite me traz renovação e os dias me trazem propósito.', autor: 'Caminho Interior' },
  { id: '51', texto: 'Eu sou um espelho da beleza divina para o mundo.', autor: 'Caminho Interior' },
  { id: '52', texto: 'Meus rituais criam pontes entre o visível e o invisível.', autor: 'Caminho Interior' },
  { id: '53', texto: 'Eu abraço a dualidade com sabedoria e aceitação.', autor: 'Caminho Interior' },
  { id: '54', texto: 'A luz das estrelas guia meus passos à noite.', autor: 'Caminho Interior' },
  { id: '55', texto: 'Eu sou grato pela comunidade que me sustenta.', autor: 'Caminho Interior' },
  { id: '56', texto: 'O sagrado se revela nos momentos mais simples.', autor: 'Caminho Interior' },
  { id: '57', texto: 'Eu escolho a compaixão em cada interação.', autor: 'Caminho Interior' },
  { id: '58', texto: 'Meu corpo é um instrumento de paz e harmonia.', autor: 'Caminho Interior' },
  { id: '59', texto: 'Eu me abro para receber a orientação superior.', autor: 'Caminho Interior' },
  { id: '60', texto: 'A cada novo amanhecer, renasço em luz.', autor: 'Caminho Interior' },
  { id: '61', texto: 'Eu honro meus ancestrais e carrego sua sabedoria.', autor: 'Caminho Interior' },
  { id: '62', texto: 'Meu lar é um santuário de paz e amor.', autor: 'Caminho Interior' },
  { id: '63', texto: 'Eu me torno mais fluído como a água que contorna obstáculos.', autor: 'Caminho Interior' },
  { id: '64', texto: 'A gratidão transforma cada momento em uma bênção.', autor: 'Caminho Interior' },
  { id: '65', texto: 'Eu sou firme como a montanha e flexível como o vento.', autor: 'Caminho Interior' },
  { id: '66', texto: 'Cada batida do meu coração ecoa o ritmo do universo.', autor: 'Caminho Interior' },
  { id: '67', texto: 'Eu declaro paz sobre todas as áreas da minha vida.', autor: 'Caminho Interior' },
  { id: '68', texto: 'Meus olhos enxergam a beleza em todo lugar.', autor: 'Caminho Interior' },
  { id: '69', texto: 'Eu libero a necessidade de controle e confio no processo.', autor: 'Caminho Interior' },
  { id: '70', texto: 'O amor é a força motriz de todas as minhas escolhas.', autor: 'Caminho Interior' },
  { id: '71', texto: 'Eu me movo com intenção e consciência em cada passo.', autor: 'Caminho Interior' },
  { id: '72', texto: 'Minhas palavras são portadoras de luz e cura.', autor: 'Caminho Interior' },
  { id: '73', texto: 'Eu honro os limites sagrados que me protegem.', autor: 'Caminho Interior' },
  { id: '74', texto: 'A escuridão não me assusta, pois sei que ela traz crescimento.', autor: 'Caminho Interior' },
  { id: '75', texto: 'Eu me entrego à dança cósmica com alegria.', autor: 'Caminho Interior' },
  { id: '76', texto: 'Minha essência é pura luz e amor incondicional.', autor: 'Caminho Interior' },
  { id: '77', texto: 'Eu permito que o tempo sagramental do descanso me renove.', autor: 'Caminho Interior' },
  { id: '78', texto: 'Cada lágrima rega as sementes do meu renascimento.', autor: 'Caminho Interior' },
  { id: '79', texto: 'Eu me lembro de quem realmente sou além do ego.', autor: 'Caminho Interior' },
  { id: '80', texto: 'A simplicidade é a linguagem da minha alma.', autor: 'Caminho Interior' },
  { id: '81', texto: 'Eu abraço o mistério com curiosidade e reverência.', autor: 'Caminho Interior' },
  { id: '82', texto: 'Minha presença é um presente para o mundo.', autor: 'Caminho Interior' },
  { id: '83', texto: 'Eu carrego a tocha da sabedoria ancestral.', autor: 'Caminho Interior' },
  { id: '84', texto: 'Cada novo ciclo traz renovadas bênçãos.', autor: 'Caminho Interior' },
  { id: '85', texto: 'Eu sou um guardião da paz na Terra.', autor: 'Caminho Interior' },
  { id: '86', texto: 'A natureza me ensina a ser paciente e resiliente.', autor: 'Caminho Interior' },
  { id: '87', texto: 'Eu honro meus sentimentos sem julgamento.', autor: 'Caminho Interior' },
  { id: '88', texto: 'Minha voz ecoa com a sabedoria de mil almas.', autor: 'Caminho Interior' },
  { id: '89', texto: 'Eu sou um templo vivo do divino.', autor: 'Caminho Interior' },
  { id: '90', texto: 'A cada inspiração, recebo nova vida.', autor: 'Caminho Interior' },
  { id: '91', texto: 'Eu danço no ritmo do coração do mundo.', autor: 'Caminho Interior' },
  { id: '92', texto: 'Minhas mãos são instrumentos de cura.', autor: 'Caminho Interior' },
  { id: '93', texto: 'Eu me abro para a sincronicidade do universo.', autor: 'Caminho Interior' },
  { id: '94', texto: 'O sagrado se manifesta através do meu ser.', autor: 'Caminho Interior' },
  { id: '95', texto: 'Eu sou um farol de luz na escuridão.', autor: 'Caminho Interior' },
  { id: '96', texto: 'A harmonia interior se reflete em minha vida.', autor: 'Caminho Interior' },
  { id: '97', texto: 'Eu me entrego à maré da vida com confiança.', autor: 'Caminho Interior' },
  { id: '98', texto: 'Cada momento é uma oportunidade de começar de novo.', autor: 'Caminho Interior' },
  { id: '99', texto: 'Eu carrego a bênção da lua em meu coração.', autor: 'Caminho Interior' },
  { id: '100', texto: 'O amor que procuro fora já habita em mim.', autor: 'Caminho Interior' },
  { id: '101', texto: 'Eu honro a sagrada conexão com todos os seres.', autor: 'Caminho Interior' },
  { id: '102', texto: 'Minha alma conhece o caminho de volta para casa.', autor: 'Caminho Interior' },
  { id: '103', texto: 'Eu permito que a paz infinita me envolva.', autor: 'Caminho Interior' },
  { id: '104', texto: 'Cada sombra que abraço me traz mais luz.', autor: 'Caminho Interior' },
  { id: '105', texto: 'Eu sou um co-criador da minha realidade.', autor: 'Caminho Interior' },
  { id: '106', texto: 'A escuridão precede sempre o amanhecer.', autor: 'Caminho Interior' },
  { id: '107', texto: 'Eu me reconecto com a criança luminosa que sempre fui.', autor: 'Caminho Interior' },
  { id: '108', texto: 'Minha gratitude abre as portas da abundância.', autor: 'Caminho Interior' },
  { id: '109', texto: 'Eu honro o templo do meu corpo com amor.', autor: 'Caminho Interior' },
  { id: '110', texto: 'A eachinchada transformação me traz mais perto de quem sou.', autor: 'Caminho Interior' },
  { id: '111', texto: 'Eu sou um guardião dos segredos sagrados.', autor: 'Caminho Interior' },
  { id: '112', texto: 'Minha intenção é pura e meu coração é verdadeiro.', autor: 'Caminho Interior' },
  { id: '113', texto: 'Eu fluo como o rio: suave mas poderoso.', autor: 'Caminho Interior' },
  { id: '114', texto: 'A sabedoria não vem do saber, mas do ser.', autor: 'Caminho Interior' },
  { id: '115', texto: 'Eu abraço cada estação da minha vida com gratidão.', autor: 'Caminho Interior' },
  { id: '116', texto: 'Meus sonhos são mensagens da minha alma.', autor: 'Caminho Interior' },
  { id: '117', texto: 'Eu escolho ver o bem em todas as situações.', autor: 'Caminho Interior' },
  { id: '118', texto: 'O silêncio me conecta com a voz do alto.', autor: 'Caminho Interior' },
  { id: '119', texto: 'Eu sou um com a terra, o céu e tudo entre eles.', autor: 'Caminho Interior' },
  { id: '120', texto: 'A magia acontece quando me permito acreditar.', autor: 'Caminho Interior' },
  { id: '121', texto: 'Eu honro a tradição que nutre minha prática.', autor: 'Caminho Interior' },
  { id: '122', texto: 'Minha alma ascende em cada ato de amor.', autor: 'Caminho Interior' },
  { id: '123', texto: 'Eu carrego em mim o poder da criação.', autor: 'Caminho Interior' },
  { id: '124', texto: 'A cada passo, deixo pegadas de luz na Terra.', autor: 'Caminho Interior' },
  { id: '125', texto: 'Eu sou abençoado e protegido em todos os caminhos.', autor: 'Caminho Interior' },
  { id: '126', texto: 'O sagrado se esconde nos detalhes do cotidiano.', autor: 'Caminho Interior' },
  { id: '127', texto: 'Eu me torno mais luminoso a cada perdão que ofereço.', autor: 'Caminho Interior' },
  { id: '128', texto: 'Minha essência é imperecível como as estrelas.', autor: 'Caminho Interior' },
  { id: '129', texto: 'Eu sou um channels limpo para a energia divina.', autor: 'Caminho Interior' },
  { id: '130', texto: 'A eachinação me leva aonde preciso estar.', autor: 'Caminho Interior' },
  { id: '131', texto: 'Eu declaro minha intenção de viver em paz.', autor: 'Caminho Interior' },
  { id: '132', texto: 'O fogo sagrado queima em meu peito.', autor: 'Caminho Interior' },
  { id: '133', texto: 'Eu permito que a água da vida me purifique.', autor: 'Caminho Interior' },
  { id: '134', texto: 'Minhas raízes estão firmes na terra sagrada.', autor: 'Caminho Interior' },
  { id: '135', texto: 'O ar que respiro carrega bênçãos celestiais.', autor: 'Caminho Interior' },
  { id: '136', texto: 'Eu sou um com o todo e o todo está em mim.', autor: 'Caminho Interior' },
  { id: '137', texto: 'A cada ciclo lunar, renovo minhas intenções.', autor: 'Caminho Interior' },
  { id: '138', texto: 'Eu me torno um ímã para experiências extraordinárias.', autor: 'Caminho Interior' },
  { id: '139', texto: 'Meu coração bate em harmonia com o coração do mundo.', autor: 'Caminho Interior' },
  { id: '140', texto: 'A paz que busco fora já reside em meu interior.', autor: 'Caminho Interior' },
  { id: '141', texto: 'Eu sou digno de tiempo, espaço e amor.', autor: 'Caminho Interior' },
  { id: '142', texto: 'A cada dia, aprofundo minha conexão com o alto.', autor: 'Caminho Interior' },
  { id: '143', texto: 'Eu honro o sagrado feminine e masculino em mim.', autor: 'Caminho Interior' },
  { id: '144', texto: 'Minha prática é uma oferenda ao mundo.', autor: 'Caminho Interior' },
  { id: '145', texto: 'Eu permito que o universo cuide dos detalhes.', autor: 'Caminho Interior' },
  { id: '146', texto: 'O caminho se revela enquanto caminhop.', autor: 'Caminho Interior' },
  { id: '147', texto: 'Eu sou um ancorador de luz nesta Terra.', autor: 'Caminho Interior' },
  { id: '148', texto: 'Cada palavra que escolho tem poder sagrado.', autor: 'Caminho Interior' },
  { id: '149', texto: 'Eu me abençoo com a luz de todos os tempos.', autor: 'Caminho Interior' },
  { id: '150', texto: 'A eachlise da alma me traz mais perto da verdade.', autor: 'Caminho Interior' },
  { id: '151', texto: 'Eu sou um eterno aprendiz na escola da vida.', autor: 'Caminho Interior' },
  { id: '152', texto: 'Minha intuição é uma bússola infalível.', autor: 'Caminho Interior' },
  { id: '153', texto: 'Eu honro o sagrado nos pequenos rituais.', autor: 'Caminho Interior' },
  { id: '154', texto: 'O universo responde às minhas vibrações mais elevadas.', autor: 'Caminho Interior' },
  { id: '155', texto: 'Eu escolho pensamentos de saúde e vitalidade.', autor: 'Caminho Interior' },
  { id: '156', texto: 'Minha presenca transforma o espaço ao meu redor.', autor: 'Caminho Interior' },
  { id: '157', texto: 'Eu sou grato pelo milagre da existência.', autor: 'Caminho Interior' },
  { id: '158', texto: 'A escuridão não é minha inimiga, mas minha professora.', autor: 'Caminho Interior' },
  { id: '159', texto: 'Eu me torno mais livre a cada apego que solto.', autor: 'Caminho Interior' },
  { id: '160', texto: 'O sagrado se manifesta quando leasto com atenção.', autor: 'Caminho Interior' },
  { id: '161', texto: 'Eu sou um reflexo da infinita sabedoria.', autor: 'Caminho Interior' },
  { id: '162', texto: 'Cada desafio é uma oportunidade de brilhar.', autor: 'Caminho Interior' },
  { id: '163', texto: 'Eu honro os limites sagrados da minha alma.', autor: 'Caminho Interior' },
  { id: '164', texto: 'Minha energia atrai pessoas e situações alinhadas.', autor: 'Caminho Interior' },
  { id: '165', texto: 'O perdão me liberta e me eleva.', autor: 'Caminho Interior' },
  { id: '166', texto: 'Eu permito que a criatividade flua através de mim.', autor: 'Caminho Interior' },
  { id: '167', texto: 'A paciência é uma virtude que cultivo diariamente.', autor: 'Caminho Interior' },
  { id: '168', texto: 'Eu sou um mensageiro da luz nas trevas.', autor: 'Caminho Interior' },
  { id: '169', texto: 'Cada momento presente é um presente.', autor: 'Caminho Interior' },
  { id: '170', texto: 'O amor é a resposta para toda pergunta.', autor: 'Caminho Interior' },
  { id: '171', texto: 'Eu abraço a totalidade do meu ser com amor.', autor: 'Caminho Interior' },
  { id: '172', texto: 'Minha alma é antiga e sábia e jovem e fresca.', autor: 'Caminho Interior' },
  { id: '173', texto: 'Eu me reconecto com o fire sagrado interior.', autor: 'Caminho Interior' },
  { id: '174', texto: 'A eachordância me traz paz em tempos de storm.', autor: 'Caminho Interior' },
  { id: '175', texto: 'Eu declaro que a paz é meu estado natural.', autor: 'Caminho Interior' },
  { id: '176', texto: 'O universo celebra minha existência.', autor: 'Caminho Interior' },
  { id: '177', texto: 'Eu sou um com o rhythm pulsante da vida.', autor: 'Caminho Interior' },
  { id: '178', texto: 'Minha respiração é uma oração constante.', autor: 'Caminho Interior' },
  { id: '179', texto: 'Eu honro o trabalho sagrado do autoconhecimento.', autor: 'Caminho Interior' },
  { id: '180', texto: 'A luz que busco está ao alcance das minhas mãos.', autor: 'Caminho Interior' },
  { id: '181', texto: 'Eu me permito descansar na graça do momento.', autor: 'Caminho Interior' },
  { id: '182', texto: 'Minha mente é um jardim que escolho bem plantar.', autor: 'Caminho Interior' },
  { id: '183', texto: 'Eu sou um withess consciente da magia da vida.', autor: 'Caminho Interior' },
  { id: '184', texto: 'O eachho que faço retorna multiplicado.', autor: 'Caminho Interior' },
  { id: '185', texto: 'Eu me abro para a cura que o universo oferece.', autor: 'Caminho Interior' },
  { id: '186', texto: 'Minha essência não pode ser ferida, apenas testada.', autor: 'Caminho Interior' },
  { id: '187', texto: 'Eu escolho a leveza em meio aos desafios.', autor: 'Caminho Interior' },
  { id: '188', texto: 'A eachlução me traz sabedoria e compaixão.', autor: 'Caminho Interior' },
  { id: '189', texto: 'Eu sou um withess do sagrado em todos os seres.', autor: 'Caminho Interior' },
  { id: '190', texto: 'O eachlance é a linguagem da alma.', autor: 'Caminho Interior' },
  { id: '191', texto: 'Eu me permito ser vulnerável e forte ao mesmo tempo.', autor: 'Caminho Interior' },
  { id: '192', texto: 'Minha prática de gratidão transforma minha realidade.', autor: 'Caminho Interior' },
  { id: '193', texto: 'Eu honro a estrada percorrida e abençoo o caminho à frente.', autor: 'Caminho Interior' },
  { id: '194', texto: 'O sagrado está em toda parte, mesmo onde menos espero.', autor: 'Caminho Interior' },
  { id: '195', texto: 'Eu sou um withess do mistério da existência.', autor: 'Caminho Interior' },
  { id: '196', texto: 'A eachlução me traz libertação.', autor: 'Caminho Interior' },
  { id: '197', texto: 'Eu permito que minha verdadeira natureza se manifeste.', autor: 'Caminho Interior' },
  { id: '198', texto: 'Minha alma é uma chama imperecível.', autor: 'Caminho Interior' },
  { id: '199', texto: 'Eu sou digno de paz, amor e felicidade.', autor: 'Caminho Interior' },
  { id: '200', texto: 'O universo é abundante e eu sou parte dessa abundância.', autor: 'Caminho Interior' },
  { id: '201', texto: 'Eu me entrego à magia do desconhecido.', autor: 'Caminho Interior' },
  { id: '202', texto: 'A eachensão do coração me abre para nuevas possibilidades.', autor: 'Caminho Interior' },
  { id: '203', texto: 'Eu honro os ciclos de vida, morte e renascimento.', autor: 'Caminho Interior' },
  { id: '204', texto: 'Minha intenção está alinhada com o bem maior.', autor: 'Caminho Interior' },
  { id: '205', texto: 'O sagrado se manifesta quando menos espero.', autor: 'Caminho Interior' },
  { id: '206', texto: 'Eu sou um withess grato da beleza do mundo.', autor: 'Caminho Interior' },
  { id: '207', texto: 'A eachidão me traz wisdom e serenidade.', autor: 'Caminho Interior' },
  { id: '208', texto: 'Eu escolho o amor em cada circunstância.', autor: 'Caminho Interior' },
  { id: '209', texto: 'Minha alma conhece o caminho de casa.', autor: 'Caminho Interior' },
  { id: '210', texto: 'O eachho que semeio retorna como harvest.', autor: 'Caminho Interior' },
  { id: '211', texto: 'Eu permito que a luz atraviese minhas sombras.', autor: 'Caminho Interior' },
  { id: '212', texto: 'A eachância me sustenta nos momentos difíceis.', autor: 'Caminho Interior' },
  { id: '213', texto: 'Eu sou um withess do poder transformador do amor.', autor: 'Caminho Interior' },
  { id: '214', texto: 'O sagrado me convida a descansar em sua paz.', autor: 'Caminho Interior' },
  { id: '215', texto: 'Eu honro o silêncio como fonte de sabedoria.', autor: 'Caminho Interior' },
  { id: '216', texto: 'Minha prática diária fortalece minha espiritualidade.', autor: 'Caminho Interior' },
  { id: '217', texto: 'Eu permito que a graça me sustente.', autor: 'Caminho Interior' },
  { id: '218', texto: 'O universo conspira para meu benefício.', autor: 'Caminho Interior' },
  { id: '219', texto: 'Eu sou um withess do sagrado em mim e ao meu redor.', autor: 'Caminho Interior' },
  { id: '220', texto: 'A eachpetuação do agora me traz paz infinita.', autor: 'Caminho Interior' },
  { id: '221', texto: 'Eu declaro que estou no caminho da minha verdadeira essência.', autor: 'Caminho Interior' },
  { id: '222', texto: 'Minha alma é um farol que ilumina o mundo.', autor: 'Caminho Interior' },
  { id: '223', texto: 'O eachho de amor que semeio multiplica-se.', autor: 'Caminho Interior' },
  { id: '224', texto: 'Eu honro o sagrado feminine em toda a sua glory.', autor: 'Caminho Interior' },
  { id: '225', texto: 'A eachluência me permite dar e receber com grace.', autor: 'Caminho Interior' },
  { id: '226', texto: 'Eu sou um withess da eternidade presente em cada instante.', autor: 'Caminho Interior' },
  { id: '227', texto: 'O eachamento do coração me conecta com tudo o que é.', autor: 'Caminho Interior' },
  { id: '228', texto: 'Eu permito que a sagrada sabedoria me guie.', autor: 'Caminho Interior' },
  { id: '229', texto: 'Minha presença é uma oferenda de paz ao mundo.', autor: 'Caminho Interior' },
  { id: '230', texto: 'A eachinação é uma bênção que cultivo com cuidado.', autor: 'Caminho Interior' },
  { id: '231', texto: 'Eu honro minha trajetória como um caminho sagrado.', autor: 'Caminho Interior' },
  { id: '232', texto: 'O eachho de luz que carrego ilumina meu caminho.', autor: 'Caminho Interior' },
  { id: '233', texto: 'Eu sou um withess da interconexão de todas as coisas.', autor: 'Caminho Interior' },
  { id: '234', texto: 'A eachpetuação me liberta das correntes do tempo.', autor: 'Caminho Interior' },
  { id: '235', texto: 'O sagrado me reconhece como seu filho amado.', autor: 'Caminho Interior' },
  { id: '236', texto: 'Eu permito que o mistério me fascine e me aprofunde.', autor: 'Caminho Interior' },
  { id: '237', texto: 'Minha alma reconhece sua própria luz.', autor: 'Caminho Interior' },
  { id: '238', texto: 'O eachho de gratidão que expresso abre portas.', autor: 'Caminho Interior' },
  { id: '239', texto: 'Eu declaro que a paz é meu direito divino.', autor: 'Caminho Interior' },
  { id: '240', texto: 'A eachluência do universo sustenta minha jornada.', autor: 'Caminho Interior' },
  { id: '241', texto: 'Eu sou um withess grato do milagre da consciência.', autor: 'Caminho Interior' },
  { id: '242', texto: 'O eachho sagrado ressoa em cada fibra do meu ser.', autor: 'Caminho Interior' },
  { id: '243', texto: 'Eu honro o trabalho interior que faço em silêncio.', autor: 'Caminho Interior' },
  { id: '244', texto: 'Minha abertura para a orientação superior se expande.', autor: 'Caminho Interior' },
  { id: '245', texto: 'A eachclusão me traz sabedoria e discernimento.', autor: 'Caminho Interior' },
  { id: '246', texto: 'Eu permito que a luz do eu superior me ilumine.', autor: 'Caminho Interior' },
  { id: '247', texto: 'O sagrado me chama para casa com doçura.', autor: 'Caminho Interior' },
  { id: '248', texto: 'Eu sou um withess da perfeição nos detalhes.', autor: 'Caminho Interior' },
  { id: '249', texto: 'O eachho que recebo é proporcional ao que ofereço.', autor: 'Caminho Interior' },
  { id: '250', texto: 'Eu declaro que a luz sempre vence a escuridão.', autor: 'Caminho Interior' },
  { id: '251', texto: 'Minha prática espiritual é um ato de resistência e amor.', autor: 'Caminho Interior' },
  { id: '252', texto: 'A eachpetuação do sagrado me traz força.', autor: 'Caminho Interior' },
  { id: '253', texto: 'Eu honro os mistérios que a mente não pode compreender.', autor: 'Caminho Interior' },
  { id: '254', texto: 'O universo se dobra diante de minha intenção clara.', autor: 'Caminho Interior' },
  { id: '255', texto: 'Eu permito que a eternidade habite em meu coração.', autor: 'Caminho Interior' },
  { id: '256', texto: 'A eachluência flui através de mim naturalmente.', autor: 'Caminho Interior' },
  { id: '257', texto: 'Eu sou um withess da transformação constante.', autor: 'Caminho Interior' },
  { id: '258', texto: 'O eachho de amor que cultivo sustenta minha alma.', autor: 'Caminho Interior' },
  { id: '259', texto: 'Minha abertura para o novo é infinita.', autor: 'Caminho Interior' },
  { id: '260', texto: 'O sagrado se revela quando abandono minha resistência.', autor: 'Caminho Interior' },
  { id: '261', texto: 'Eu declaro que o amor é a única realidade.', autor: 'Caminho Interior' },
  { id: '262', texto: 'A eachclusão de coração me traz paz.', autor: 'Caminho Interior' },
  { id: '263', texto: 'Eu honro minha intuição como bússola sagrada.', autor: 'Caminho Interior' },
  { id: '264', texto: 'Minha alma sabe que pertence ao infinito.', autor: 'Caminho Interior' },
  { id: '265', texto: 'O universo dança comigo quando eu danço.', autor: 'Caminho Interior' },
  { id: '266', texto: 'Eu permito que o sagrado me consagre a cada dia.', autor: 'Caminho Interior' },
  { id: '267', texto: 'A eachpetuação do momento presente é minha prática.', autor: 'Caminho Interior' },
  { id: '268', texto: 'Eu sou um withess da magia que se desenrola.', autor: 'Caminho Interior' },
  { id: '269', texto: 'O eachho de luz que escolho ilumina o mundo.', autor: 'Caminho Interior' },
  { id: '270', texto: 'Minha prática é uma oração em movimento.', autor: 'Caminho Interior' },
  { id: '271', texto: 'Eu declaro que a escuridão é apenas ausência de luz temporária.', autor: 'Caminho Interior' },
  { id: '272', texto: 'A eachluência do cosmos sustenta minha existência.', autor: 'Caminho Interior' },
  { id: '273', texto: 'Eu honro o sagrado masculino e feminino em equilíbrio.', autor: 'Caminho Interior' },
  { id: '274', texto: 'O eachho que solto cria espaço para o novo.', autor: 'Caminho Interior' },
  { id: '275', texto: 'Eu permito que a sabedoria dos antigos me guie.', autor: 'Caminho Interior' },
  { id: '276', texto: 'Minha alma está em paz com o passado.', autor: 'Caminho Interior' },
  { id: '277', texto: 'O sagrado me reconhece como seu filho.', autor: 'Caminho Interior' },
  { id: '278', texto: 'Eu sou um withess da interconexão sagrada.', autor: 'Caminho Interior' },
  { id: '279', texto: 'A eachpetuação do momento traz clareza.', autor: 'Caminho Interior' },
  { id: '280', texto: 'Eu declaro minha intenção de viver em harmonia.', autor: 'Caminho Interior' },
  { id: '281', texto: 'Minha prática daily me fortalece espiritualmente.', autor: 'Caminho Interior' },
  { id: '282', texto: 'O universo responde quando clamo em sinceridade.', autor: 'Caminho Interior' },
  { id: '283', texto: 'Eu permito que o amor cure todas as feridas.', autor: 'Caminho Interior' },
  { id: '284', texto: 'A eachluência me sustenta na jornada.', autor: 'Caminho Interior' },
  { id: '285', texto: 'Eu honro o sagrado que habita em cada ser.', autor: 'Caminho Interior' },
  { id: '286', texto: 'O eachho de gratidão que semeio retorna multiplicado.', autor: 'Caminho Interior' },
  { id: '287', texto: 'Minha alma reconhece o caminho da luz.', autor: 'Caminho Interior' },
  { id: '288', texto: 'Eu sou um withess do poder da intenção.', autor: 'Caminho Interior' },
  { id: '289', texto: 'O sacred habita no centro do meu ser.', autor: 'Caminho Interior' },
  { id: '290', texto: 'Eu declaro que a paz começa em mim.', autor: 'Caminho Interior' },
  { id: '291', texto: 'A eachclusão me traz sabedoria interior.', autor: 'Caminho Interior' },
  { id: '292', texto: 'Eu permito que minha verdadeira essência brilhe.', autor: 'Caminho Interior' },
  { id: '293', texto: 'Minha prática é um withess da devoção.', autor: 'Caminho Interior' },
  { id: '294', texto: 'O universo é meu aliado e companheiro.', autor: 'Caminho Interior' },
  { id: '295', texto: 'Eu honro o caminho que me trouxe até aqui.', autor: 'Caminho Interior' },
  { id: '296', texto: 'A eachpetuação me liberta do peso do ontem.', autor: 'Caminho Interior' },
  { id: '297', texto: 'O eachho de luz que carrego transforma.', autor: 'Caminho Interior' },
  { id: '298', texto: 'Eu permito que a graça me sustente.', autor: 'Caminho Interior' },
  { id: '299', texto: 'Minha alma está ancorada na eternidade.', autor: 'Caminho Interior' },
  { id: '300', texto: 'O sagrado se manifesta através das minhas ações.', autor: 'Caminho Interior' },
  { id: '301', texto: 'Eu declaro que o amor é minha natureza fundamental.', autor: 'Caminho Interior' },
  { id: '302', texto: 'A eachluência do universo me sustenta.', autor: 'Caminho Interior' },
  { id: '303', texto: 'Eu sou um withess da magia da criação.', autor: 'Caminho Interior' },
  { id: '304', texto: 'O eachho de paz que semeio retorna.', autor: 'Caminho Interior' },
  { id: '305', texto: 'Minha abertura para o divino se expande a cada dia.', autor: 'Caminho Interior' },
  { id: '306', texto: 'Eu honro a criança sagrada em mim.', autor: 'Caminho Interior' },
  { id: '307', texto: 'O sagrado me chama com voz suave e amorosa.', autor: 'Caminho Interior' },
  { id: '308', texto: 'Eu permito que a luz dissolva minhas dúvidas.', autor: 'Caminho Interior' },
  { id: '309', texto: 'A eachclusão do coração me traz clareza.', autor: 'Caminho Interior' },
  { id: '310', texto: 'Eu declaro que o caminho se revela para mim.', autor: 'Caminho Interior' },
  { id: '311', texto: 'Minha alma conhece a verdade que me liberta.', autor: 'Caminho Interior' },
  { id: '312', texto: 'O universo conspira para que eu encontre paz.', autor: 'Caminho Interior' },
  { id: '313', texto: 'Eu sou um withess da perfeição imperfeita.', autor: 'Caminho Interior' },
  { id: '314', texto: 'A eachpetuação do sagrado me transforma.', autor: 'Caminho Interior' },
  { id: '315', texto: 'O eachho que ofereço é o eachho que recebo.', autor: 'Caminho Interior' },
  { id: '316', texto: 'Eu permito que o mistério me aproxime do divino.', autor: 'Caminho Interior' },
  { id: '317', texto: 'Minha prática espiritual me ancora na verdade.', autor: 'Caminho Interior' },
  { id: '318', texto: 'O sagrado me reconhece como parte do todo.', autor: 'Caminho Interior' },
  { id: '319', texto: 'Eu honro os ciclos que me movem forward.', autor: 'Caminho Interior' },
  { id: '320', texto: 'A eachluência flui quando confio no processo.', autor: 'Caminho Interior' },
  { id: '321', texto: 'Eu declaro que a sabedoria habita em mim.', autor: 'Caminho Interior' },
  { id: '322', texto: 'Minha alma é um espelho do cosmos.', autor: 'Caminho Interior' },
  { id: '323', texto: 'O eachho de amor que cultivamos nos conecta.', autor: 'Caminho Interior' },
  { id: '324', texto: 'Eu permito que a luz do alto me ilumine.', autor: 'Caminho Interior' },
  { id: '325', texto: 'A eachclusão me traz paz interior.', autor: 'Caminho Interior' },
  { id: '326', texto: 'Eu sou um withess da eternidade em cada instante.', autor: 'Caminho Interior' },
  { id: '327', texto: 'O sagrado se manifesta quando leasto em presença.', autor: 'Caminho Interior' },
  { id: '328', texto: 'Minha intenção está alinhada com a luz.', autor: 'Caminho Interior' },
  { id: '329', texto: 'Eu honro o trabalho invisível da alma.', autor: 'Caminho Interior' },
  { id: '330', texto: 'O universo me sustenta em cada passo.', autor: 'Caminho Interior' },
  { id: '331', texto: 'Eu permito que a paz me envolva completamente.', autor: 'Caminho Interior' },
  { id: '332', texto: 'A eachpetuação do agora é minha prática sagrada.', autor: 'Caminho Interior' },
  { id: '333', texto: 'Minha alma sabe que é amada incondicionalmente.', autor: 'Caminho Interior' },
  { id: '334', texto: 'O eachho de gratidão que expresso transforma.', autor: 'Caminho Interior' },
  { id: '335', texto: 'Eu declaro que a luz cresce em mim a cada dia.', autor: 'Caminho Interior' },
  { id: '336', texto: 'O sagrado me aguarda em cada amanhecer.', autor: 'Caminho Interior' },
  { id: '337', texto: 'Eu sou um withess da transformação interior.', autor: 'Caminho Interior' },
  { id: '338', texto: 'A eachclusão me traz sabedoria.', autor: 'Caminho Interior' },
  { id: '339', texto: 'Eu permito que o universo me guie.', autor: 'Caminho Interior' },
  { id: '340', texto: 'Minha prática diaria fortalece minha fé.', autor: 'Caminho Interior' },
  { id: '341', texto: 'O eachho que semeio retorna multiplicado.', autor: 'Caminho Interior' },
  { id: '342', texto: 'Eu honro a sagrada confiança que cresce em mim.', autor: 'Caminho Interior' },
  { id: '343', texto: 'A eachluência do cosmos sustenta minha jornada.', autor: 'Caminho Interior' },
  { id: '344', texto: 'O sacred habita no silêncio entre os pensamentos.', autor: 'Caminho Interior' },
  { id: '345', texto: 'Eu permito que a eternidade me console.', autor: 'Caminho Interior' },
  { id: '346', texto: 'Minha alma reconhece sua própria divindade.', autor: 'Caminho Interior' },
  { id: '347', texto: 'O universo é um espelho do meu estado interior.', autor: 'Caminho Interior' },
  { id: '348', texto: 'Eu declaro que o amor é a resposta.', autor: 'Caminho Interior' },
  { id: '349', texto: 'A eachpetuação me traz força interior.', autor: 'Caminho Interior' },
  { id: '350', texto: 'Eu sou um withess do sagrado no ordinário.', autor: 'Caminho Interior' },
  { id: '351', texto: 'O eachho de luz que escolho me fortalece.', autor: 'Caminho Interior' },
  { id: '352', texto: 'Minha prática de presença transforma minha realidade.', autor: 'Caminho Interior' },
  { id: '353', texto: 'O sacred me reconhece como seu.', autor: 'Caminho Interior' },
  { id: '354', texto: 'Eu honro o caminho de volta para casa.', autor: 'Caminho Interior' },
  { id: '355', texto: 'A eachclusão do coração me abre para o novo.', autor: 'Caminho Interior' },
  { id: '356', texto: 'Eu permito que a luz cure o que precisa ser curado.', autor: 'Caminho Interior' },
  { id: '357', texto: 'Minha alma está em paz com o que é.', autor: 'Caminho Interior' },
  { id: '358', texto: 'O eachho que ofereço é uma oferenda sagrada.', autor: 'Caminho Interior' },
  { id: '359', texto: 'O universo dança com minha alma em harmonia.', autor: 'Caminho Interior' },
  { id: '360', texto: 'Eu declaro que a gratidão é minha prática.', autor: 'Caminho Interior' },
  { id: '361', texto: 'A eachluência flui quando amo sem medo.', autor: 'Caminho Interior' },
];

const STORAGE_KEY = 'cabala-afirmacoes-favoritas';

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getAffirmationByDayOfYear(dayOfYear: number): Afirmacao {
  const index = dayOfYear % AFIRMACOES.length;
  return AFIRMACOES[index];
}

function loadFavorites(): Afirmacao[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavoritesToStorage(favorites: Afirmacao[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Silently fail on storage errors
  }
}

export function useAfirmacoes() {
  const [favorites, setFavorites] = useState<Afirmacao[]>([]);
  const [currentAffirmation, setCurrentAffirmation] = useState<Afirmacao | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize on client side
  useEffect(() => {
    setIsClient(true);
    setFavorites(loadFavorites());
    setCurrentAffirmation(getAffirmationByDayOfYear(getDayOfYear()));
  }, []);

  const getNewAffirmation = useCallback((): Afirmacao => {
    const dayOfYear = getDayOfYear();
    const randomIndex = Math.floor(Math.random() * AFIRMACOES.length);
    const newAffirmation = AFIRMACOES[randomIndex];
    setCurrentAffirmation(newAffirmation);
    return newAffirmation;
  }, []);

  const saveFavorite = useCallback((afirmacao: Afirmacao): boolean => {
    setFavorites((prev) => {
      const alreadyExists = prev.some((f) => f.id === afirmacao.id);
      if (alreadyExists) return prev;
      const updated = [...prev, afirmacao];
      saveFavoritesToStorage(updated);
      return updated;
    });
    return true;
  }, []);

  const removeFavorite = useCallback((afirmacaoId: string): boolean => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== afirmacaoId);
      saveFavoritesToStorage(updated);
      return updated;
    });
    return true;
  }, []);

  return {
    currentAffirmation,
    getNewAffirmation,
    saveFavorite,
    removeFavorite,
    favorites,
  };
}
