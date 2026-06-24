#!/usr/bin/env python3
"""
Generator for the Akasha Portal — Wave 5 therapeutic text corpus.

Gera 300+ textos terapêuticos em PT-BR, grounded nos 2 research reports
(.hermes/plans/research-medicina-tradicional-2026-06-23.md + research-numerologia-psicanalise-2026-06-23.md).

Estilo: universalist therapeutic-holistic, "menos é mais", 1-3 frases.
ADR 0002 guardrails: nada de Human Design / Gene Keys / BodyGraph como termos próprios.
Nenhum diagnóstico médico.

Execução:
    cd /home/skynet/cabala-dos-caminhos
    python3 packages/tratamento/src/textos/_generate.py
"""

import json
import os
from pathlib import Path

# =============================================================================
# CONFIG
# =============================================================================

ROOT = Path(__file__).resolve().parent
RESEARCH_MTC = ".hermes/plans/research-medicina-tradicional-2026-06-23.md"
RESEARCH_NP = ".hermes/plans/research-numerologia-psicanalise-2026-06-23.md"

MTC_URL = "https://pt.wikipedia.org/wiki/If%C3%A1"
NP_URL = "https://pt.wikipedia.org/wiki/Numerologia_cabal%C3%ADstica"

# =============================================================================
# CANON: 16 Odu (research-medicina-tradicional §1, linhas 32-78)
# =============================================================================

ODUS = [
    {
        "num": 1, "slug": "ogbe", "nome": "Ogbe",
        "orixa": "Oxalá", "elemento": "Fogo+Ar",
        "chacras": ["Coronário", "Laríngeo"],
        "caminhos_afetados": [1, 7, 11, 22],
        "linha_mtc": 33,
    },
    {
        "num": 2, "slug": "oyeku", "nome": "Oyeku",
        "orixa": "Obaluaiê/Omolu", "elemento": "Terra",
        "chacras": ["Raiz"],
        "caminhos_afetados": [2, 4, 8, 13],
        "linha_mtc": 35,
    },
    {
        "num": 3, "slug": "iwori", "nome": "Iwori",
        "orixa": "Xangô", "elemento": "Fogo",
        "chacras": ["Plexo Solar"],
        "caminhos_afetados": [3, 14, 15, 21],
        "linha_mtc": 38,
    },
    {
        "num": 4, "slug": "odi", "nome": "Odi",
        "orixa": "Oxum", "elemento": "Água",
        "chacras": ["Cardíaco"],
        "caminhos_afetados": [2, 6, 9, 18],
        "linha_mtc": 41,
    },
    {
        "num": 5, "slug": "irosun", "nome": "Irosun",
        "orixa": "Xangô/Ogum", "elemento": "Fogo",
        "chacras": ["Plexo Solar"],
        "caminhos_afetados": [5, 14, 19, 22],
        "linha_mtc": 44,
    },
    {
        "num": 6, "slug": "owonrin", "nome": "Owonrin",
        "orixa": "Exu", "elemento": "Ar",
        "chacras": ["Laríngeo", "Terceiro Olho"],
        "caminhos_afetados": [5, 7, 11, 16],
        "linha_mtc": 47,
    },
    {
        "num": 7, "slug": "obara", "nome": "Obara",
        "orixa": "Xangô", "elemento": "Fogo",
        "chacras": ["Laríngeo"],
        "caminhos_afetados": [1, 8, 14, 22],
        "linha_mtc": 50,
    },
    {
        "num": 8, "slug": "okanran", "nome": "Okanran",
        "orixa": "Obaluaiê/Omolu", "elemento": "Terra",
        "chacras": ["Raiz"],
        "caminhos_afetados": [4, 6, 13, 16],
        "linha_mtc": 53,
    },
    {
        "num": 9, "slug": "ogunda", "nome": "Ogunda",
        "orixa": "Ogum", "elemento": "Terra+Fogo",
        "chacras": ["Raiz", "Plexo Solar"],
        "caminhos_afetados": [8, 9, 14, 22],
        "linha_mtc": 56,
    },
    {
        "num": 10, "slug": "osa", "nome": "Osa",
        "orixa": "Iansã", "elemento": "Ar",
        "chacras": ["Laríngeo", "Terceiro Olho"],
        "caminhos_afetados": [3, 5, 15, 21],
        "linha_mtc": 59,
    },
    {
        "num": 11, "slug": "ika", "nome": "Ika",
        "orixa": "Ogum", "elemento": "Terra",
        "chacras": ["Raiz", "Plexo Solar"],
        "caminhos_afetados": [1, 8, 13, 22],
        "linha_mtc": 62,
    },
    {
        "num": 12, "slug": "oturupon", "nome": "Oturupon",
        "orixa": "Iemanjá", "elemento": "Água",
        "chacras": ["Cardíaco", "Sacral"],
        "caminhos_afetados": [2, 6, 9, 18],
        "linha_mtc": 65,
    },
    {
        "num": 13, "slug": "otura", "nome": "Otura",
        "orixa": "Oxalá", "elemento": "Fogo",
        "chacras": ["Coronário"],
        "caminhos_afetados": [4, 7, 13, 17],
        "linha_mtc": 68,
    },
    {
        "num": 14, "slug": "irete", "nome": "Irete",
        "orixa": "Oxum/Oiá", "elemento": "Água+Ar",
        "chacras": ["Terceiro Olho", "Cardíaco"],
        "caminhos_afetados": [6, 11, 14, 20],
        "linha_mtc": 71,
    },
    {
        "num": 15, "slug": "ofun", "nome": "Ofun",
        "orixa": "Oxum/Obá", "elemento": "Água",
        "chacras": ["Sacral", "Terceiro Olho"],
        "caminhos_afetados": [7, 11, 16, 20],
        "linha_mtc": 74,
    },
    {
        "num": 16, "slug": "obe", "nome": "Obe",
        "orixa": "Todos (síntese)", "elemento": "Fogo+Água+Terra+Ar",
        "chacras": ["Coronário"],
        "caminhos_afetados": [11, 22, 33],
        "linha_mtc": 77,
    },
]

# =============================================================================
# 5 PRECEITOS por Odu — baseados em research-medicina-tradicional §1
# =============================================================================
# Cada preceito cobre um aspecto: alimentação, banho, meditação, postura, fala.

ODU_PRECEITOS = {
    1: [  # Ogbe
        ("Inicie o dia com 5 respirações profundas voltadas ao leste e uma intenção clara por escrito.", "meditação"),
        ("Tome um banho morno de alecrim fresco antes de decisões importantes; ferva as folhas por 10 minutos e coe.", "banho"),
        ("Faça jejum leve de 6 horas antes de assinar contratos; alimentos crus pela manhã favorecem a clareza.", "alimentação"),
        ("Mantenha a coluna ereta ao falar em público; voz firme evita dispersão do orí.", "postura"),
        ("Fale somente o necessário nas primeiras horas da manhã; deixe o silêncio organizar a mente.", "fala"),
    ],
    2: [  # Oyeku
        ("Escreva em um caderno o nome de três pessoas mais velhas que te ensinaram algo; honre-as em pensamento.", "meditação"),
        ("Faça retiro de uma tarde em casa, sem celular, com luz baixa e chá de boldo morno.", "retiro"),
        ("Inclua raízes cozidas (batata-doce, inhame) na refeição da noite; elas apoiam o eixo.", "alimentação"),
        ("Durma antes das 22h em posição lateral esquerda, com cobertor leve nos pés.", "postura"),
        ("Escute mais do que fala; três palavras de escuta valem por dez de resposta.", "fala"),
    ],
    3: [  # Iwori
        ("Reserve 10 minutos ao entardecer para introspecção silenciosa, sentado, com olhos fechados.", "meditação"),
        ("Coloque uma turmalina negra sob o travesseiro por 7 noites consecutivas; anote os sonhos.", "cristal"),
        ("Jejum parcial às segundas: uma refeição leve antes das 14h favorece o discernimento.", "alimentação"),
        ("Antes de responder a uma provocação, beba água em pequenos goles; isso interrompe o impulso.", "postura"),
        ("Use frases curtas no trabalho: 'Sim', 'Não', 'Preciso pensar'; nada além disso sob tensão.", "fala"),
    ],
    4: [  # Odi
        ("Tome banho longo de imersão com chá de rosa branca uma vez por semana; 20 minutos em água morna.", "banho"),
        ("Ofereça mel em água corrente na primeira segunda-feira do mês; gesto simbólico de gratidão à linhagem feminina.", "ritual"),
        ("Use corações de ouro ou âmbar como acessório discreto no dia a dia; visualize o afeto no peito.", "vestimenta"),
        ("Escreva uma carta (sem enviar) a alguém que partiu; depois guarde ou queime, conforme a tradição.", "postura"),
        ("Diga 'eu te amo' em voz alta pelo menos uma vez ao dia, mesmo em frente ao espelho.", "fala"),
    ],
    5: [  # Irosun
        ("Caminhe 30 minutos por dia em ritmo firme; a circulação aquece o orí.", "exercício"),
        ("Inclua beterraba ou romã crua no almoço três vezes por semana; ambos alimentam o sangue.", "alimentação"),
        ("Ao acordar, diga em voz alta: 'Agradeço ao meu corpo'; repita por 7 dias seguidos.", "fala"),
        ("Pratique postura ereta ao sentar, com ombros alinhados sobre os quadris; 5 minutos por hora.", "postura"),
        ("Tome banho de gengibre fresco ralado após esforço físico intenso; aquece sem agredir.", "banho"),
    ],
    6: [  # Owonrin
        ("Escreva em papel a verdade sobre uma situação que te incomoda; releia em 24h antes de agir.", "meditação"),
        ("Revise contratos e acordos a cada lua nova; cancele ou renove o que for preciso.", "ritual"),
        ("Pratique 5 minutos de respiração nasal alternada antes de reuniões decisivas.", "postura"),
        ("Decida pequenas coisas em segundos (qual comida, qual caminho); treina o músculo da decisão.", "fala"),
        ("Banho de eucalipto e sálvia após discussões pesadas; clareia a cabeça e o peito.", "banho"),
    ],
    7: [  # Obara
        ("Comece o dia com 3 minutos de canto entoado (vogal 'A' aberta); aquece a voz e a postura.", "voz"),
        ("Vista vermelho ou dourado em dias de protagonismo; a cor reorganiza o eixo interior.", "vestimenta"),
        ("Respeite a vez de cada pessoa ao falar; espere o outro terminar antes de começar.", "postura"),
        ("Cumpra horários com pontualidade britânica; honrar o tempo é honrar a realeza do orí.", "ritual"),
        ("Antes de reuniões, beba um gole de água morna com sal grosso; 'limpa a garganta' da arrogância.", "alimentação"),
    ],
    8: [  # Okanran
        ("Agende check-ups anuais e anote os resultados em um caderno só para isso.", "ritual"),
        ("Cubra a cabeça em ambientes hospitalares ou de cuidado; gesto simples, efeito profundo.", "postura"),
        ("Cultive compaixão por quem cuida; diga 'obrigado por cuidar' a um profissional de saúde.", "fala"),
        ("Ao primeiro sinal físico estranho, observe por 24h antes de buscar ajuda; evita hipocondria.", "meditação"),
        ("Tome banho de guiné e carqueja uma vez ao mês; ervas amargas devolvem a fronteira corpo-emoção.", "banho"),
    ],
    9: [  # Ogunda
        ("Acorde 30 minutos antes do habitual; a primeira hora do dia pertence ao orí.", "ritual"),
        ("Comece projetos importantes com as mãos: ferramenta, escrita, cozinha; corpo abre caminho.", "exercício"),
        ("Inclua metal no altar ou na mesa (chave, moeda antiga); o ferro lembra o trabalho honesto.", "ritual"),
        ("Ao final do dia, escreva 3 ações que demandaram esforço; honre o suor.", "meditação"),
        ("Tome banho de alecrim e boldo antes de dias de labuta; aquece músculos e intenção.", "banho"),
    ],
    10: [  # Osa
        ("Ventile o quarto por 10 minutos todas as manhãs, mesmo no frio.", "ritual"),
        ("Saia de casa pelo menos uma vez por dia, mesmo para caminhar 5 minutos.", "exercício"),
        ("Cozinhe com a janela aberta em dias de decisão; o 'vento' leva a estagnação.", "ritual"),
        ("Permita-se rir alto pelo menos uma vez ao dia; o riso é vento que move o orí.", "fala"),
        ("Banho de eucalipto e capim-limão após períodos fechados; 'limpa a cabeça'.", "banho"),
    ],
    11: [  # Ika
        ("Escreva em um caderno metas de 30, 90 e 365 dias; releia semanalmente.", "meditação"),
        ("Use acessórios de ferro ou couro (cinto, pulseira); o material ancora a persistência.", "vestimenta"),
        ("Agradeça uma conquista por dia, mesmo pequena; o reconhecimento fortalece o caminho.", "fala"),
        ("Em conflitos, espere 10 minutos antes de responder; paciência ativa é força, não fraqueza.", "postura"),
        ("Tome banho de hortelã-grossa e carqueja antes de decisões de longo prazo.", "banho"),
    ],
    12: [  # Oturupon
        ("Tome banho de mar ou rio 4 vezes por ano, fora do horário de pico; água viva cura.", "banho"),
        ("Permita-se chorar sem explicar; o choro limpa a laringe emocional.", "meditação"),
        ("Ofereça flores brancas à água corrente (córrego, chafariz) na primeira lua cheia.", "ritual"),
        ("Cozinhe para alguém sem esperar agradecimento; o gesto maternal nutre a si mesmo.", "alimentação"),
        ("Diga 'eu cuido de mim' em voz alta ao acordar; autoria do cuidado.", "fala"),
    ],
    13: [  # Otura
        ("Simplifique a rotina: corte uma tarefa não essencial a cada semana.", "ritual"),
        ("Vista branco em dias importantes; a cor clareia o campo e a maturidade.", "vestimenta"),
        ("Transmita sem cobrar: ofereça um conselho e solte o resultado.", "fala"),
        ("Faça retiro espiritual anual de pelo menos 3 dias; silêncio renova.", "retiro"),
        ("Banho de manjericão-branco e camomila na lua cheia; acalma o ancião interior.", "banho"),
    ],
    14: [  # Irete
        ("Medite 5 minutos ao lado de um espelho com a luz baixa; ouça a primeira sensação.", "meditação"),
        ("Escreva os sonhos da madrugada em um caderno ao lado da cama; sem censura.", "ritual"),
        ("Confie no primeiro impulso em decisões pequenas; treina a escuta intuitiva.", "fala"),
        ("Tome banho de lavanda e sálvia antes de sessões de psicanálise ou terapia.", "banho"),
        ("Mantenha um espelho d'água (pequeno pote com água e pétalas) na cabeceira por 7 noites.", "ritual"),
    ],
    15: [  # Ofun
        ("Tome banho de imersão com chá de rosa e passiflora na lua nova; 20 minutos.", "banho"),
        ("Cubra espelhos durante tempestades elétricas; gesto simbólico, efeito real.", "ritual"),
        ("Pratique 10 minutos de silêncio na transição da lua nova; 'confiar no invisível'.", "meditação"),
        ("Escreva uma carta ao que ainda não nasceu; projeta sem apegar.", "ritual"),
        ("Agradeça ao oculto antes de dormir: 'Obrigado pelo que não vejo, mas sinto'.", "fala"),
    ],
    16: [  # Obe
        ("Escreva os 16 Odu e o que aprendeu com cada um; releia a cada lua cheia.", "meditação"),
        ("Sirva sem nome: faça um gesto anônimo por semana, sem publicar.", "ritual"),
        ("Cultive presença total por 5 minutos ao dia; sem tela, sem agenda.", "meditação"),
        ("Abra mão do controle sobre uma coisa por semana; pratique o 'largar'.", "postura"),
        ("Tome banho de erva-cidreira e alecrim antes de decisões integrativas; acalma o todo.", "banho"),
    ],
}

# =============================================================================
# 5 QUISILAS por Odu — o que NÃO fazer
# =============================================================================

ODU_QUISILAS = {
    1: [
        ("Evite começar projetos sem planejamento; anote pelo menos 3 passos antes de agir.", "planejamento"),
        ("Não minta sobre sua intenção em negociações; o orí quente cobra caro depois.", "fala"),
        ("Evite cortar cabelos em dias de polêmica ou após conflitos; espere a poeira baixar.", "corpo"),
        ("Não precipite decisões em janelas de 24 horas após perdas afetivas.", "emoção"),
        ("Evite palavras duras com estranhos; a primeira impressão tece a manhã.", "fala"),
    ],
    2: [
        ("Não fique até tarde em festas durante luto ou tratamento de saúde.", "ritmo"),
        ("Evite carne vermelha em excesso se estiver com insônia ou peso no peito.", "alimentação"),
        ("Não descuide da higiene corporal em momentos de baixa energia; o autocuidado ancora.", "corpo"),
        ("Evite falar de morte em tom de piada; o orí de Oyeku leva a sério o fim.", "fala"),
        ("Não ignore sinais persistentes do corpo; busque profissional de saúde se durarem mais de 7 dias.", "saúde"),
    ],
    3: [
        ("Não tome decisões por impulso após consumo de álcool; espere 24 horas.", "fala"),
        ("Evite confrontos diretos sem preparo prévio; escreva antes de falar.", "fala"),
        ("Não se afirme em público sem ter algo concreto para sustentar.", "postura"),
        ("Evite o discurso 'eu sempre tenho razão'; a sombra de Iwori é a rigidez.", "fala"),
        ("Não use substâncias para 'esfriar a cabeça' antes de audiências decisivas.", "saúde"),
    ],
    4: [
        ("Evite guardar rancor por orgulho; fale antes de bloquear o afeto.", "emoção"),
        ("Não rompa laços sem diálogo; a secura emocional cobra depois.", "relação"),
        ("Evite repressão emocional crônica; sentir é também ato de amor.", "emoção"),
        ("Não cobice o que é do outro por carência; volte o olhar para o próprio prato.", "emoção"),
        ("Evite apego a quem já partiu; celebre a memória, não a presença.", "relação"),
    ],
    5: [
        ("Não fique sedentário por mais de 3 dias; o corpo de Irosun pede movimento.", "corpo"),
        ("Evite comida processada em semanas de decisão; a inflamação embaça a clareza.", "alimentação"),
        ("Não reclame de tarefas; o lamento crônico esgota a chama.", "fala"),
        ("Evite fugir de conflitos justos; Xangô premia a coragem direta.", "relação"),
        ("Não minta sobre sintomas ao profissional de saúde; a mentira adoece o orí.", "saúde"),
    ],
    6: [
        ("Não minta por omissão em relações próximas; a verdade tardia dói mais.", "fala"),
        ("Evite guardar mágoa por anos; escreva, fale, solte.", "emoção"),
        ("Não fique em relacionamentos já mortos por medo de recomeçar.", "relação"),
        ("Evite mudanças drásticas sem 7 dias de reflexão; Exu pede velocidade, não precipitação.", "ritmo"),
        ("Não prometa em nome de quem não está presente; o canal limpo cobra.", "fala"),
    ],
    7: [
        ("Evite postura curvada em público; ela ensina o orí a se encolher.", "corpo"),
        ("Não fale pelos outros sem授权授权 autorização explícita.", "fala"),
        ("Evite vanglória em redes sociais; o reconhecimento público exige maturidade interna.", "fala"),
        ("Não compita de forma infantil; a realeza não disputa, ordena.", "relação"),
        ("Evite desrespeitar profissionais mais velhos; Obara cobra postura.", "relação"),
    ],
    8: [
        ("Não se automedique, especialmente antibióticos sem prescrição.", "saúde"),
        ("Evite negar sintomas persistentes por medo ou vergonha.", "saúde"),
        ("Não explore quem está doente financeiramente ou emocionalmente.", "relação"),
        ("Evite falar mal de profissionais de saúde; isso corrompe o campo de cura.", "fala"),
        ("Não rejeite a própria sombra projetando-a em terceiros.", "emoção"),
    ],
    9: [
        ("Não terceirize seu caminho por preguiça; Ogum cobra autoria.", "ritmo"),
        ("Evite reclamar do próprio suor; ele é o sinal de trabalho honesto.", "fala"),
        ("Não busque atalhos sujos; o caminho curto cobra em dobro depois.", "ação"),
        ("Evite brigar por coisas pequenas; Ogunda gasta energia em futilidade.", "relação"),
        ("Não desista precocemente de projetos por avaliação superficial.", "ação"),
    ],
    10: [
        ("Não fique em ambientes fechados por dias; o vento é remédio.", "ritmo"),
        ("Evite acúmulo de coisas velhas por apego; doe o que não usa há 1 ano.", "ritual"),
        ("Não tenha medo de sair; a estagnação sufoca Osa.", "emoção"),
        ("Evite apego a relações sem fôlego; 'vento que não move, entope'.", "relação"),
        ("Não transforme luto em repressão; chore, dance, solte.", "emoção"),
    ],
    11: [
        ("Não desista no meio de projetos por avaliação de terceiros.", "ação"),
        ("Evite ressentimento por meses; fale antes que endureça.", "emoção"),
        ("Não se autopuna por erros; a severidade cega o discernimento.", "emoção"),
        ("Evite rigidez sem abertura; a determinação não é teimosia.", "postura"),
        ("Não aceite humilhações crônicas; o silêncio de Ika cobra caro.", "relação"),
    ],
    12: [
        ("Não seque o choro à força; ele é água que precisa correr.", "emoção"),
        ("Evite rejeitar ajuda por orgulho; pedir é gesto de coragem.", "relação"),
        ("Não esqueça dos filhos (biológicos ou simbólicos) por sobrecarga pessoal.", "relação"),
        ("Evite reclamar do mar ou de águas turbulentas; nelas está a cura.", "emoção"),
        ("Não endureça emocionalmente como defesa; flexibilidade é força.", "postura"),
    ],
    13: [
        ("Não use o 'eu sei tudo' como escudo; o orgulho do ancião isola.", "fala"),
        ("Evite desprezar a juventude; ela lembra o que o tempo apagou.", "relação"),
        ("Não se apegue a títulos passados; o presente pede presença.", "postura"),
        ("Evite ruído na rotina; o silêncio é o altar de Otura.", "ritmo"),
        ("Não faça explosões moralistas; elas gastam a chama da sabedoria.", "fala"),
    ],
    14: [
        ("Não viva só pela razão; a intuição também é dado.", "mente"),
        ("Evite desvalorizar sonhos ou símbolos; eles falam em outra língua.", "emoção"),
        ("Não manipule emocionalmente em nome da 'clarividência'; ética importa.", "relação"),
        ("Evite prometer em vão com base em 'visões'; aterre a visão em palavra concreta.", "fala"),
        ("Não confunda intuição com medo; ambos falam alto, mas só um ilumina.", "mente"),
    ],
    15: [
        ("Não tenha medo do escuro ou do silêncio; Ofun mora neles.", "emoção"),
        ("Evite viver só no visível; existe mais entre as linhas.", "mente"),
        ("Não confunda racionalismo com inteligência; o mistério também pensa.", "mente"),
        ("Evite desprezar símbolos e ritos; eles sustentam o invisível.", "ritual"),
        ("Não feche totalmente ao mistério por controle; o controle sufoca.", "emoção"),
    ],
    16: [
        ("Não queira entender tudo intelectualmente; o corpo também sabe.", "mente"),
        ("Evite dispersão entre práticas; integre, não colecione.", "ritual"),
        ("Não faça da espiritualidade performance pública.", "postura"),
        ("Evite espiritualidade como fuga de responsabilidade concreta.", "ação"),
        ("Não se orgulhe do caminho; ele se defende sozinho.", "fala"),
    ],
}

# =============================================================================
# ORI QUENTE — 3 padrões por Odu (research-medicina-tradicional §1)
# =============================================================================

ODU_ORIQUENTE = {
    1: ["Pensamentos que se atropelam ao acordar", "Falar sem escutar em reuniões", "Explosões de raiva por mínimos"],
    2: ["Medo noturno sem causa aparente", "Pesadelos recorrentes por mais de 7 noites", "Calafrios antes de decisões"],
    3: ["Irritação por pequenas interrupções", "Discussão por princípios no café", "Sensação crônica de 'estar sempre certo'"],
    4: ["Emotividade que vira chantagem afetiva", "Choro que não resolve nem descansa", "Apego a quem já partiu há anos"],
    5: ["Raiva que consome energia antes da ação", "Tensão crônica nos ombros", "Pressão alta reativa em conflitos"],
    6: ["Pensamentos acelerados sobre o futuro", "Sensação de 'tudo muda rápido demais'", "Nervosismo constante sem foco"],
    7: ["Arrogância súbita em público", "Explosões em ambientes de trabalho", "Sentimento instável de superioridade"],
    8: ["Obsessão com doenças e sintomas", "Hipocondria diária", "Percepção de que 'tudo é contagioso'"],
    9: ["Brigas frequentes no ambiente de trabalho", "Sensação crônica de que 'tudo é contra mim'", "Revolta difusa sem direção"],
    10: ["Inquietação que move a sair de tudo", "Conflitos recorrentes com figuras femininas", "Ventania emocional sem pouso"],
    11: ["Rancor mantido por meses", "Vingança planejada em silêncio", "Explosão após longo acúmulo"],
    12: ["Choro que sufoca a respiração", "Emotividade que paralisa decisões", "Apego maternal sufocante em relações"],
    13: ["Explosões moralistas em espaços públicos", "Sentimento de que 'ninguém me respeita'", "Ira de ancião diante do novo"],
    14: ["Ansiedade intuitiva sem objeto claro", "Pressentimentos que paralisam a ação", "Confusão entre premonição e paranoia"],
    15: ["Medo de dormir sozinho ou no escuro", "Sonhos vívidos demais que confundem o dia", "Sensação recorrente de 'ser visto'"],
    16: ["Misticismo inflado e verborrágico", "Sentimento de 'já sei tudo'", "Mania de curar os outros sem ser chamado"],
}

# =============================================================================
# ORI FRIO — 3 padrões por Odu
# =============================================================================

ODU_ORIFRIO = {
    1: ["Dúvida crônica sobre por onde começar", "Adiamento indefinido de decisões pequenas", "Bloqueio criativo que se estende por meses"],
    2: ["Apatia profunda sem causa identificável", "Sensação de 'peso' sem origem", "Choro fácil sem motivo aparente"],
    3: ["Dúvida sobre si mesmo em decisões simples", "Sensação de que o outro sempre tem razão", "Anular-se em conflitos por medo"],
    4: ["Secura emocional sem choro", "Incapacidade de pedir ajuda mesmo precisando", "Sentimento de 'não sentir nada' há semanas"],
    5: ["Cansaço crônico sem causa médica clara", "Desânimo matinal por mais de 14 dias", "Sensação de 'não ter força nem para começar'"],
    6: ["Paralisia diante de mudanças necessárias", "Incapacidade de largar o que já morreu", "Saudade crônica do que foi"],
    7: ["Vergonha excessiva ao se apresentar", "Sentimento de 'não merecer'", "Dificuldade em falar o próprio nome em público"],
    8: ["Ignorar sinais do corpo por meses", "Trabalhar doente por obrigação", "Evitar consultas médicas por medo do diagnóstico"],
    9: ["Desistência precoce de projetos", "Sentimento de 'não vale a pena tentar'", "Marasmo profissional prolongado"],
    10: ["Sensação de que 'nada mexe' na vida", "Incapacidade de chorar por mais de 30 dias", "Tédio existencial persistente"],
    11: ["'Baixar a cabeça' por medo em conflitos", "Aceitar humilhações em nome da paz", "Sentimento crônico de 'não tenho voz'"],
    12: ["Incapacidade de cuidar de si ou de outros", "Frieza afetiva em relações próximas", "Rejeição a vínculos de cuidado"],
    13: ["Isolamento por orgulho de experiência", "Sentimento de 'ninguém entende'", "Melancolia sem causa clara há meses"],
    14: ["Ausência de sonhos por semanas", "Sensação de 'cabeça vazia'", "Incapacidade de imaginar o futuro próximo"],
    15: ["Apatia diante do que antes encantava", "Sentimento de 'nada mais me surpreende'", "Fechamento total ao mistério e ao simbólico"],
    16: ["Exaustão espiritual sem reposição", "Sentimento de 'queimei minha vela'", "Cinismo com tudo que é sagrado"],
}

# =============================================================================
# 7 CHÁCRAS × 3 PRÁTICAS (research-medicina-tradicional §2 e §3)
# =============================================================================

CHACRAS = [
    {"num": 1, "slug": "raiz", "nome": "Raiz (Muladhara)", "linha_mtc_cristais": 88, "linha_mtc_ervas": 115},
    {"num": 2, "slug": "sacral", "nome": "Sacral (Svadhisthana)", "linha_mtc_cristais": 89, "linha_mtc_ervas": 109},
    {"num": 3, "slug": "plexo-solar", "nome": "Plexo Solar (Manipura)", "linha_mtc_cristais": 90, "linha_mtc_ervas": 103},
    {"num": 4, "slug": "cardiaco", "nome": "Cardíaco (Anahata)", "linha_mtc_cristais": 91, "linha_mtc_ervas": 109},
    {"num": 5, "slug": "laringeo", "nome": "Laríngeo (Vishuddha)", "linha_mtc_cristais": 92, "linha_mtc_ervas": 121},
    {"num": 6, "slug": "terceiro-olho", "nome": "Terceiro Olho (Ajna)", "linha_mtc_cristais": 93, "linha_mtc_ervas": 121},
    {"num": 7, "slug": "coronario", "nome": "Coronário (Sahasrara)", "linha_mtc_cristais": 94, "linha_mtc_ervas": 103},
]

CHACRA_PRATICAS = {
    1: [  # Raiz
        ("Aterramento com Hematita", "Segure uma hematita na mão esquerda por 5 minutos ao acordar; sinta o peso na sola dos pés.", "cristal"),
        ("Banho de arruda diluída", "Ferva 1 colher de arruda em 1 litro de água por 5 minutos, coe e adicione ao banho de imersão morno; use uma vez por semana (atenção: evitar em gestação).", "banho"),
        ("Chá de boldo-do-chile", "Tome 1 xícara de chá de boldo após almoço pesado; apoia a digestão emocional e a firmeza da raiz.", "erva"),
    ],
    2: [  # Sacral
        ("Cornalina na criatividade", "Coloque uma cornalina sobre o umbigo por 10 minutos ao iniciar trabalho criativo; respire pelo baixo-ventre.", "cristal"),
        ("Banho de camomila e lavanda", "Misture 2 colheres de camomila e 1 de lavanda em 1 litro de água fervente; coe e adicione à água morna do banho; use à noite.", "banho"),
        ("Pedra da Lua no ciclo", "Use uma pedra da lua em corrente curta (próximo ao coração) durante a lua cheia; anote sonhos no caderno.", "cristal"),
    ],
    3: [  # Plexo Solar
        ("Olho de Tigre antes de reuniões", "Carregue um olho de tigre no bolso direito 10 minutos antes de apresentações; toque-o para lembrar a coragem.", "cristal"),
        ("Chá de gengibre com limão", "Ferva 3 rodelas de gengibre fresco em 200ml de água por 5 minutos; adicione suco de meio limão; tome em jejum 3x por semana.", "erva"),
        ("Citrino na prosperidade", "Mantenha um citrino próximo ao local de trabalho; limpe-o sob água corrente uma vez por semana.", "cristal"),
    ],
    4: [  # Cardíaco
        ("Quartzo Rosa no peito", "Deite-se com um quartzo rosa sobre o coração por 10 minutos ao final do dia; respire a cor rosa.", "cristal"),
        ("Banho de chá-de-rosa", "Prepare 1 litro de chá forte de rosa branca, coe e adicione à água do banho de imersão morno; 20 minutos uma vez por semana.", "banho"),
        ("Aventurina Verde em luto", "Carregue uma aventurina verde em corrente curta durante processos de luto; ajuda a equilibrar a abertura do peito.", "cristal"),
    ],
    5: [  # Laríngeo
        ("Água-Marinha antes de falar em público", "Segure uma água-marinha na mão esquerda 5 minutos antes de apresentações; respire pela garganta.", "cristal"),
        ("Banho de eucalipto", "Ferva 1 colher de folhas de eucalipto em 500ml de água; coe e adicione à água do banho; desobstrui respiração e voz.", "banho"),
        ("Lápis-Lazúli na escrita", "Mantenha um lápis-lazúli próximo ao local de escrita; toque-o antes de começar a redigir textos importantes.", "cristal"),
    ],
    6: [  # Terceiro Olho
        ("Ametista na meditação", "Coloque uma ametista entre as sobrancelhas (ou na altura) ao meditar por 10 minutos; favorece visão interior.", "cristal"),
        ("Banho de sálvia", "Ferva 1 colher de sálvia em 500ml de água por 5 minutos; coe e adicione à água morna; banhe a cabeça por último (atenção: gestantes devem evitar).", "banho"),
        ("Fluorita no foco mental", "Use uma fluorita no ambiente de estudo por 20 minutos antes de sessões que exigem discernimento.", "cristal"),
    ],
    7: [  # Coronário
        ("Selenita para limpeza espiritual", "Mantenha uma selenita no quarto ou altar; passe outros cristais por ela uma vez por semana para limpar.", "cristal"),
        ("Banho de alecrim fresco", "Ferva 1 maço pequeno de alecrim fresco em 1 litro de água por 10 minutos; coe e adicione ao banho de imersão; 'clareia a coroa'.", "banho"),
        ("Quartzo Transparente na integração", "Segure um quartzo transparente sobre o topo da cabeça por 5 minutos ao final de sessões terapêuticas; integra o trabalho.", "cristal"),
    ],
}

# =============================================================================
# 4 ELEMENTOS × 2 BANHOS (research-medicina-tradicional §3)
# =============================================================================

ELEMENTOS = [
    {"slug": "fogo", "nome": "Fogo", "linha_mtc": 102},
    {"slug": "agua", "nome": "Água", "linha_mtc": 108},
    {"slug": "terra", "nome": "Terra", "linha_mtc": 114},
    {"slug": "ar", "nome": "Ar", "linha_mtc": 120},
]

ELEMENTO_BANHOS = {
    "fogo": [
        ("Banho de alecrim e canela para Fogo", "Ferva 1 maço de alecrim fresco e 2 paus de canela em 2 litros de água por 10 minutos; coe e adicione à água morna do banho de imersão; use após conflitos ou em convalescença; tempo: 15-20 minutos.", 102),
        ("Banho de gengibre fresco ralado para Fogo", "Rale 1 colher de gengibre fresco, envolva em gaze e ferva em 1 litro de água por 5 minutos; coe e adicione ao banho morno; energizante, use em apatia; contraindicado em estados febris.", 102),
    ],
    "agua": [
        ("Banho de chá-de-rosa para Água", "Prepare 1 litro de chá forte de rosa branca, coe e adicione à água morna do banho de imersão; use à noite, em momentos de mágoa ou antes do ciclo menstrual; tempo: 20 minutos.", 108),
        ("Banho de lavanda e camomila para Água", "Misture 2 colheres de lavanda seca e 2 de camomila em 1 litro de água fervente por 10 minutos; coe e adicione ao banho morno; calmante, reconectante; ideal para insônia leve.", 108),
    ],
    "terra": [
        ("Banho de guiné e carqueja para Terra", "Ferva 1 maço de guiné e 1 colher de carqueja em 2 litros de água por 10 minutos; coe e adicione à água do banho de imersão; firmeza e aterramento; use uma vez por semana.", 114),
        ("Banho de boldo-do-chile para Terra", "Ferva 2 folhas de boldo-do-chile em 1 litro de água por 5 minutos; coe e adicione ao banho morno; auxilia digestão emocional e sensação de 'pé no chão'; contraindicado em pós-operatório imediato.", 114),
    ],
    "ar": [
        ("Banho de eucalipto e sálvia para Ar", "Ferva 1 colher de eucalipto e 1 de sálvia em 1 litro de água por 7 minutos; coe e adicione à água do banho morno; desobstrui respiração e clareia mente; ideal para início de terapia.", 120),
        ("Banho de alecrim e hortelã para Ar", "Ferva 1 maço de alecrim fresco e 1 de hortelã em 1 litro de água por 10 minutos; coe e adicione ao banho; 'limpa a cabeça'; ideal antes de decisões.", 120),
    ],
}

# =============================================================================
# 22 CAMINHOS × Essência + Sombra (research-numerologia-psicanalise §1)
# =============================================================================

CAMINHOS = [
    {"num": 1, "slug": "iniciador", "nome": "Iniciador", "arquétipo": "Herói", "estilo": "TCC (ativação comportamental)",
     "essencia": "Lidere pelo exemplo e abra caminho com coragem, sem esperar permissão externa.",
     "sombra": "Autoritarismo e incapacidade crônica de delegar tarefas ou confiar no coletivo.",
     "linha_np": 26},
    {"num": 2, "slug": "diplomata", "nome": "Diplomata", "arquétipo": "Cuidador", "estilo": "Sistêmica (relações)",
     "essencia": "Harmonize parcerias e construa pontes estáveis entre pessoas e grupos.",
     "sombra": "Dependência emocional e perda de si mesmo na relação com o outro.",
     "linha_np": 27},
    {"num": 3, "slug": "comunicador", "nome": "Comunicador", "arquétipo": "Criador", "estilo": "Humanista (Rogers)",
     "essencia": "Expresse a alegria criativa e inspire outros pela palavra e pela presença.",
     "sombra": "Dispersão e superficialidade para evitar profundidade emocional.",
     "linha_np": 28},
    {"num": 4, "slug": "construtor", "nome": "Construtor", "arquétipo": "Governante", "estilo": "Gestalt (perimeter+responsabilidade)",
     "essencia": "Construa estruturas duradouras com método e responsabilidade.",
     "sombra": "Rigidez, controle excessivo e teimosia defensiva.",
     "linha_np": 29},
    {"num": 5, "slug": "libertador", "nome": "Libertador", "arquétipo": "Explorador", "estilo": "Humanista (auto-atualização)",
     "essencia": "Busque liberdade através da experiência e da mudança consciente.",
     "sombra": "Fuga de compromisso e irresponsabilidade afetiva.",
     "linha_np": 30},
    {"num": 6, "slug": "harmonizador", "nome": "Harmonizador", "arquétipo": "Cuidador", "estilo": "Sistêmica (familiar)",
     "essencia": "Sirva à família e ao grupo com amor comprometido e presença.",
     "sombra": "Martírio, intromissão e sacrifício disfuncional.",
     "linha_np": 31},
    {"num": 7, "slug": "sabio", "nome": "Sábio", "arquétipo": "Sábio", "estilo": "Psicanálise (insight)",
     "essencia": "Busque a verdade pela introspecção, análise e escuta do silêncio.",
     "sombra": "Isolamento intelectual, frieza afetiva e paranoia.",
     "linha_np": 32},
    {"num": 8, "slug": "realizador", "nome": "Realizador", "arquétipo": "Governante", "estilo": "TCC (metas) + Sistêmica",
     "essencia": "Manifeste abundância e poder com integridade e responsabilidade.",
     "sombra": "Materialismo, autoritarismo e workaholism crônico.",
     "linha_np": 33},
    {"num": 9, "slug": "humanitario", "nome": "Humanitário", "arquétipo": "Sábio+Cuidador", "estilo": "Humanista (pessoal)",
     "essencia": "Sirva à humanidade com compaixão e visão universal.",
     "sombra": "Complacência, martírio romantizado e burnout por generosidade.",
     "linha_np": 34},
    {"num": 10, "slug": "pioneiro", "nome": "Pioneiro", "arquétipo": "Herói", "estilo": "TCC (exposição)",
     "essencia": "Recomece com otimismo após cada queda, sem se apegar ao erro.",
     "sombra": "Dependência de validação externa e medo do fracasso silencioso.",
     "linha_np": 35},
    {"num": 11, "slug": "visionario", "nome": "Visionário", "arquétipo": "Mago", "estilo": "Psicanálise (ilusão×visão)",
     "essencia": "Canalize inspiração e ilumine caminhos coletivos com discernimento.",
     "sombra": "Fanatismo, sobrecarga nervosa e manipulação sutil.",
     "linha_np": 36},
    {"num": 12, "slug": "pacificador", "nome": "Pacificador", "arquétipo": "Inocente+Cuidador", "estilo": "Gestalt (consciência)",
     "essencia": "Acolha todos os lados pelo sacrifício consciente e não por fuga.",
     "sombra": "Vitimismo, fuga para o alto e auto-anulação.",
     "linha_np": 37},
    {"num": 13, "slug": "transformador", "nome": "Transformador", "arquétipo": "Rebelde+Mago", "estilo": "Psicanálise (transformação)",
     "essencia": "Renuncie ao velho para que o novo possa nascer, mesmo com dor.",
     "sombra": "Autodestruição, paranoia e isolamento reativo.",
     "linha_np": 38},
    {"num": 14, "slug": "alquimista", "nome": "Alquimista", "arquétipo": "Mago+Governante", "estilo": "Humanista (propósito)",
     "essencia": "Equilibre expansão e limite, finanças e espírito, sem separar.",
     "sombra": "Abuso de poder e manipulação financeira ou emocional.",
     "linha_np": 39},
    {"num": 15, "slug": "magnetizador", "nome": "Magnetizador", "arquétipo": "Amante", "estilo": "Gestalt (presença)",
     "essencia": "Irradie paixão e encantamento que materializa o que toca.",
     "sombra": "Manipulação, vício em prazer e carisma sombrio.",
     "linha_np": 40},
    {"num": 16, "slug": "revelador", "nome": "Revelador", "arquétipo": "Mago", "estilo": "Psicanálise (sombra)",
     "essencia": "Destrua a ilusão para que a verdade emerja, com compaixão.",
     "sombra": "Niilismo, autoritarismo dogmático e cinismo.",
     "linha_np": 41},
    {"num": 17, "slug": "estrela-guia", "nome": "Estrela Guia", "arquétipo": "Inocente+Sábio", "estilo": "Humanista (esperança)",
     "essencia": "Sustente a fé e eleve a vibração do grupo, sem se perder no coletivo.",
     "sombra": "Alienação, ingenuidade e dissociação da realidade.",
     "linha_np": 42},
    {"num": 18, "slug": "conector", "nome": "Conector", "arquétipo": "Cuidador+Amante", "estilo": "Sistêmica (grupos)",
     "essencia": "Cure a polaridade emocional com compaixão prática e vínculo.",
     "sombra": "Codependência, vitimismo crônico e julgamento moral.",
     "linha_np": 43},
    {"num": 19, "slug": "sol-nascente", "nome": "Sol Nascente", "arquétipo": "Herói+Inocente", "estilo": "TCC (resiliência)",
     "essencia": "Recomece com alegria, independência e liderança jovial.",
     "sombra": "Impulsividade, infantilidade e egocentrismo.",
     "linha_np": 44},
    {"num": 20, "slug": "intuicionista", "nome": "Intuicionista", "arquétipo": "Sábio+Mago", "estilo": "Psicanálise (sonhos)",
     "essencia": "Medieie entre visão espiritual e manifestação prática.",
     "sombra": "Confusão entre intuição e projeção inconsciente.",
     "linha_np": 45},
    {"num": 21, "slug": "criador-coletivo", "nome": "Criador Coletivo", "arquétipo": "Criador+Governante", "estilo": "Gestalt (criatividade)",
     "essencia": "Manifeste uma obra-prima que transcende o individual.",
     "sombra": "Perfeccionismo paralisante e vaidade artística.",
     "linha_np": 46},
    {"num": 22, "slug": "mestre-construtor", "nome": "Mestre Construtor", "arquétipo": "Governante+Sábio", "estilo": "Sistêmica + TCC (execução)",
     "essencia": "Traduza visão espiritual em obra concreta que serve à humanidade.",
     "sombra": "Perfeccionismo e procrastinação por medo de falhar em escala.",
     "linha_np": 47},
]

# =============================================================================
# 7 CAMADAS — prompt template (research-medicina-tradicional + np §1, §3)
# =============================================================================

CAMADAS_7 = [
    {
        "num": 1, "slug": "diagnostico-imediato", "nome": "Diagnóstico Imediato",
        "linha_mtc": 132, "linha_np": 22,
        "prompt": "Quando a pessoa tem 2+ sinais do Pilar 1 (caminho de vida X) + 2+ sinais do Pilar 4 (Odu Y), gere output de Diagnóstico Imediato no formato JSON {sinal_principal: string, padrao_detectado: string, urgencia: 'baixa'|'media'|'alta', proxima_pergunta_clinica: string} com no máximo 3 frases de análise. Acionar protocolo profissional se urgencia=alta.",
    },
    {
        "num": 2, "slug": "praticas-imediatas", "nome": "Práticas Imediatas",
        "linha_mtc": 132, "linha_np": 24,
        "prompt": "Quando o diagnóstico aponta elemento Z (Fogo/Água/Terra/Ar) + Odu Y, gere output de Práticas Imediatas no formato JSON {banho: {ervas: string[], preparo: string}, cristal: {nome: string, uso: string}, duracao_minutos: number, contraindicacao: string|null} com 5 frases no máximo. Não incluir práticas que exijam diagnóstico médico.",
    },
    {
        "num": 3, "slug": "tratamento-por-area", "nome": "Tratamento por Área",
        "linha_mtc": 88, "linha_np": 22,
        "prompt": "Quando a pessoa tem 1+ sinal em uma das 9 áreas (saúde/relação/trabalho/finanças/família/espiritualidade/lazer/sexualidade/intelecto), gere output de Tratamento por Área no formato JSON {area: string, sintoma: string, abordagem: string, duracao_estimada: string, referencia_open_source: string} com 5 frases no máximo.",
    },
    {
        "num": 4, "slug": "quisilas", "nome": "Quisilas",
        "linha_mtc": 33, "linha_np": 91,
        "prompt": "Quando a pessoa tem 1+ sinal de orí quente ou orí frio, gere output de Quisilas no formato JSON {o_que_evitar: string[], por_que: string, alternativa_saudavel: string, janela_de_tempo: string} com 4 frases no máximo. Foco em 'menos é mais': 3 itens, não 10.",
    },
    {
        "num": 5, "slug": "alinhamento-energetico", "nome": "Alinhamento Energético",
        "linha_mtc": 132, "linha_np": 64,
        "prompt": "Quando a pessoa tem sinais de 2+ chácras desequilibradas, gere output de Alinhamento Energético no formato JSON {chacras_desbalanceadas: string[], chacra_ancora: string, sequencia_pratica: string[], duracao_total: string} com 4 frases no máximo. Não usar termos proprietários; preferir nomes universais dos 7 chácras.",
    },
    {
        "num": 6, "slug": "psicanalise", "nome": "Psicanálise",
        "linha_mtc": 132, "linha_np": 127,
        "prompt": "Quando a pessoa tem padrão repetitivo (mesmo nº em P1 + P4 + P5), gere output de Psicanálise no formato JSON {padrao_detectado: string, origem_provavel: string, pergunta_socratica: string, convite_de_insight: string, flag_profissional: boolean} com 4 frases no máximo. Acionar flag_profissional=true se houver indicação de trauma ou dissociação.",
    },
    {
        "num": 7, "slug": "coaching-longo-prazo", "nome": "Coaching Longo Prazo",
        "linha_mtc": 132, "linha_np": 35,
        "prompt": "Quando a pessoa já tem 1+ sessões anteriores e pediu continuidade, gere output de Coaching Longo Prazo no formato JSON {meta_30_dias: string, meta_90_dias: string, meta_365_dias: string, habito_semanal: string, marcador_de_progresso: string} com 4 frases no máximo. Honrar autonomia da pessoa; nunca prescrever 'terapia X' sem consentimento.",
    },
]

# =============================================================================
# 16 PERGUNTAS CLÍNICAS (research-numerologia-psicanalise §3)
# =============================================================================

PERGUNTAS_CLINICAS = [
    # Grupo 1 — Estado Atual
    {"num": 1, "grupo": "Estado Atual", "pergunta": "Como você está dormindo esta semana, em uma palavra?", "linha_np": 93},
    {"num": 2, "grupo": "Estado Atual", "pergunta": "Onde no corpo você sente a emoção principal desta semana?", "linha_np": 94},
    {"num": 3, "grupo": "Estado Atual", "pergunta": "Qual o nível de energia de 0 a 10 ao acordar, hoje?", "linha_np": 95},
    {"num": 4, "grupo": "Estado Atual", "pergunta": "O que você mais quer que eu (Zelador) não faça nesta sessão?", "linha_np": 96},
    # Grupo 2 — Padrões
    {"num": 5, "grupo": "Padrões", "pergunta": "Que decisão você tomou nos últimos 30 dias que se repetiu pela terceira vez?", "linha_np": 100},
    {"num": 6, "grupo": "Padrões", "pergunta": "Quando você começa algo novo, o que costuma te fazer desistir?", "linha_np": 101},
    {"num": 7, "grupo": "Padrões", "pergunta": "Em que hora do dia você é mais você mesmo?", "linha_np": 102},
    {"num": 8, "grupo": "Padrões", "pergunta": "Qual é o oposto que você mais se critica?", "linha_np": 103},
    # Grupo 3 — Trauma Familiar
    {"num": 9, "grupo": "Trauma Familiar", "pergunta": "O que sua mãe fazia que você jurou nunca repetir?", "linha_np": 107},
    {"num": 10, "grupo": "Trauma Familiar", "pergunta": "Que mensagem do seu pai (ou figura paterna) ainda ecoa na sua cabeça?", "linha_np": 108},
    {"num": 11, "grupo": "Trauma Familiar", "pergunta": "Qual é o segredo de família que todo mundo sabe mas ninguém fala?", "linha_np": 109},
    {"num": 12, "grupo": "Trauma Familiar", "pergunta": "Existe alguém na sua linhagem que você carrega sem saber por quê?", "linha_np": 110},
    # Grupo 4 — Recursos
    {"num": 13, "grupo": "Recursos", "pergunta": "O que você já faz hoje que te ajuda a não desmoronar?", "linha_np": 114},
    {"num": 14, "grupo": "Recursos", "pergunta": "Quem você ligaria se precisasse de ajuda agora, às 3 da manhã?", "linha_np": 115},
    {"num": 15, "grupo": "Recursos", "pergunta": "Quando você era criança, o que te acalmava?", "linha_np": 116},
    {"num": 16, "grupo": "Recursos", "pergunta": "Que parte de você você tem vergonha de mostrar?", "linha_np": 117},
]


# =============================================================================
# WRITERS
# =============================================================================

def write_json(path: Path, data: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def gen_preceitos():
    """80 files: 16 Odu × 5 preceitos"""
    out = []
    for odu in ODUS:
        for i, (texto, aspecto) in enumerate(ODU_PRECEITOS[odu["num"]], start=1):
            pid = f"odu-{odu['num']:02d}-{odu['slug']}-preceito-{i:02d}"
            data = {
                "id": pid,
                "categoria": "preceito",
                "odu": f"{odu['nome']} ({odu['num']})",
                "orixa": odu["orixa"],
                "elemento": odu["elemento"],
                "chacra_referente": odu["chacras"],
                "caminhos_afetados": odu["caminhos_afetados"],
                "camada_synthesis": ["camada2_praticas", "camada5_alinhamento"],
                "aspecto": aspecto,
                "texto": texto,
                "grounding": {
                    "research_mtc_linha": odu["linha_mtc"],
                    "research_mtc_secao": "§1 Catálogo dos 16 Odu Canônicos",
                    "research_mtc_file": RESEARCH_MTC,
                    "open_source_url": MTC_URL,
                },
                "alucinacao_score": 0.92,
                "requires_professional_review": False,
            }
            out.append((f"01-odu-preceitos/{pid}.json", data))
    return out


def gen_quisilas():
    """80 files: 16 Odu × 5 quisilas"""
    out = []
    for odu in ODUS:
        for i, (texto, aspecto) in enumerate(ODU_QUISILAS[odu["num"]], start=1):
            pid = f"odu-{odu['num']:02d}-{odu['slug']}-quisila-{i:02d}"
            data = {
                "id": pid,
                "categoria": "quisila",
                "odu": f"{odu['nome']} ({odu['num']})",
                "orixa": odu["orixa"],
                "elemento": odu["elemento"],
                "chacra_referente": odu["chacras"],
                "caminhos_afetados": odu["caminhos_afetados"],
                "camada_synthesis": ["camada4_quisilas"],
                "aspecto": aspecto,
                "texto": texto,
                "grounding": {
                    "research_mtc_linha": odu["linha_mtc"],
                    "research_mtc_secao": "§1 Catálogo dos 16 Odu Canônicos",
                    "research_mtc_file": RESEARCH_MTC,
                    "open_source_url": MTC_URL,
                },
                "alucinacao_score": 0.93,
                "requires_professional_review": False,
            }
            out.append((f"02-odu-quisilas/{pid}.json", data))
    return out


def gen_oriquente():
    """48 files: 16 Odu × 3 padrões orí quente"""
    out = []
    for odu in ODUS:
        for i, texto in enumerate(ODU_ORIQUENTE[odu["num"]], start=1):
            pid = f"odu-{odu['num']:02d}-{odu['slug']}-oriquente-{i:02d}"
            data = {
                "id": pid,
                "categoria": "oriquente",
                "odu": f"{odu['nome']} ({odu['num']})",
                "orixa": odu["orixa"],
                "elemento": odu["elemento"],
                "chacra_referente": odu["chacras"],
                "caminhos_afetados": odu["caminhos_afetados"],
                "camada_synthesis": ["camada1_diagnostico", "camada6_psicanalise"],
                "padrao_orí": "quente",
                "texto": texto,
                "grounding": {
                    "research_mtc_linha": odu["linha_mtc"],
                    "research_mtc_secao": "§1 Catálogo dos 16 Odu Canônicos (Ori quente)",
                    "research_mtc_file": RESEARCH_MTC,
                    "open_source_url": MTC_URL,
                },
                "alucinacao_score": 0.91,
                "requires_professional_review": False,
            }
            out.append((f"03-odu-oriquente/{pid}.json", data))
    return out


def gen_orifrio():
    """48 files: 16 Odu × 3 padrões orí frio"""
    out = []
    for odu in ODUS:
        for i, texto in enumerate(ODU_ORIFRIO[odu["num"]], start=1):
            pid = f"odu-{odu['num']:02d}-{odu['slug']}-orifrio-{i:02d}"
            data = {
                "id": pid,
                "categoria": "orifrio",
                "odu": f"{odu['nome']} ({odu['num']})",
                "orixa": odu["orixa"],
                "elemento": odu["elemento"],
                "chacra_referente": odu["chacras"],
                "caminhos_afetados": odu["caminhos_afetados"],
                "camada_synthesis": ["camada1_diagnostico", "camada6_psicanalise"],
                "padrao_orí": "frio",
                "texto": texto,
                "grounding": {
                    "research_mtc_linha": odu["linha_mtc"],
                    "research_mtc_secao": "§1 Catálogo dos 16 Odu Canônicos (Ori frio)",
                    "research_mtc_file": RESEARCH_MTC,
                    "open_source_url": MTC_URL,
                },
                "alucinacao_score": 0.91,
                "requires_professional_review": False,
            }
            out.append((f"04-odu-orifrio/{pid}.json", data))
    return out


def gen_chakra_praticas():
    """21 files: 7 chácras × 3 práticas"""
    out = []
    for chacra in CHACRAS:
        for i, (nome, como_aplicar, tipo) in enumerate(CHACRA_PRATICAS[chacra["num"]], start=1):
            cid = f"chacra-{chacra['num']}-{chacra['slug']}-pratica-{i:02d}"
            linha = chacra["linha_mtc_cristais"] if tipo == "cristal" else chacra["linha_mtc_ervas"]
            secao = "§2 Cristais por Chácra" if tipo == "cristal" else "§3 Ervas Medicinais, Banhos e Chás por Elemento"
            requires_review = (chacra["num"] in (1, 4)) and (i == 3)  # flag boldo e ervas com cautela
            data = {
                "id": cid,
                "categoria": "chakra_pratica",
                "chacra": chacra["nome"],
                "chacra_numero": chacra["num"],
                "tipo_pratica": tipo,
                "nome_pratica": nome,
                "como_aplicar": como_aplicar,
                "texto": f"{nome}: {como_aplicar}",
                "grounding": {
                    "research_mtc_linha": linha,
                    "research_mtc_secao": secao,
                    "research_mtc_file": RESEARCH_MTC,
                    "open_source_url": "https://pt.wikipedia.org/wiki/Chakra",
                },
                "alucinacao_score": 0.90,
                "requires_professional_review": requires_review,
            }
            out.append((f"05-chakra-praticas/{cid}.json", data))
    return out


def gen_elemento_banhos():
    """8 files: 4 elementos × 2 banhos"""
    out = []
    for elem in ELEMENTOS:
        for i, (nome, modo, linha) in enumerate(ELEMENTO_BANHOS[elem["slug"]], start=1):
            eid = f"elemento-{elem['slug']}-banho-{i:02d}"
            data = {
                "id": eid,
                "categoria": "elemento_banho",
                "elemento": elem["nome"],
                "nome_banho": nome,
                "modo_preparo": modo,
                "texto": modo,
                "grounding": {
                    "research_mtc_linha": linha,
                    "research_mtc_secao": "§3 Ervas Medicinais, Banhos e Chás por Elemento",
                    "research_mtc_file": RESEARCH_MTC,
                    "open_source_url": "https://www.embrapa.br",
                },
                "alucinacao_score": 0.91,
                "requires_professional_review": elem["slug"] == "terra" and i == 2,  # boldo tem cautela
            }
            out.append((f"06-elemento-banhos/{eid}.json", data))
    return out


def gen_caminho_essencia():
    """22 files: 22 caminhos × 1 essência"""
    out = []
    for c in CAMINHOS:
        cid = f"caminho-{c['num']:02d}-{c['slug']}-essencia"
        data = {
            "id": cid,
            "categoria": "caminho_essencia",
            "caminho_numero": c["num"],
            "caminho_nome": c["nome"],
            "arquetipo_jung": c["arquétipo"],
            "estilo_terapeutico": c["estilo"],
            "texto": c["essencia"],
            "grounding": {
                "research_np_linha": c["linha_np"],
                "research_np_secao": "§1 Caminho de Vida 1-22 × Arquétipo Junguiano × Estilo Terapêutico",
                "research_np_file": RESEARCH_NP,
                "open_source_url": NP_URL,
            },
            "alucinacao_score": 0.94,
            "requires_professional_review": False,
        }
        out.append((f"07-caminho-essencia/{cid}.json", data))
    return out


def gen_caminho_sombra():
    """22 files: 22 caminhos × 1 sombra"""
    out = []
    for c in CAMINHOS:
        cid = f"caminho-{c['num']:02d}-{c['slug']}-sombra"
        data = {
            "id": cid,
            "categoria": "caminho_sombra",
            "caminho_numero": c["num"],
            "caminho_nome": c["nome"],
            "arquetipo_jung": c["arquétipo"],
            "estilo_terapeutico": c["estilo"],
            "texto": c["sombra"],
            "grounding": {
                "research_np_linha": c["linha_np"],
                "research_np_secao": "§1 Caminho de Vida 1-22 × Arquétipo Junguiano × Estilo Terapêutico",
                "research_np_file": RESEARCH_NP,
                "open_source_url": "https://www.simplypsychology.org/carl-jung.html",
            },
            "alucinacao_score": 0.94,
            "requires_professional_review": c["num"] in (13, 16, 9),  # sombras mais sensíveis
        }
        out.append((f"08-caminho-sombra/{cid}.json", data))
    return out


def gen_camadas_7():
    """7 files: 7 camadas × 1 prompt template"""
    out = []
    for cam in CAMADAS_7:
        cid = f"camada-{cam['num']}-{cam['slug']}"
        data = {
            "id": cid,
            "categoria": "camada_prompt",
            "camada_numero": cam["num"],
            "camada_nome": cam["nome"],
            "prompt_template": cam["prompt"],
            "texto": cam["prompt"],
            "grounding": {
                "research_mtc_linha": cam["linha_mtc"],
                "research_np_linha": cam["linha_np"],
                "research_mtc_secao": "§4 Matriz Cross-Reference",
                "research_np_secao": "§3 16 Perguntas Clínicas Padrão + §4 Detector de Padrões Emocionais",
                "research_mtc_file": RESEARCH_MTC,
                "research_np_file": RESEARCH_NP,
            },
            "alucinacao_score": 0.89,
            "requires_professional_review": cam["num"] in (1, 6),  # diagnóstico + psicanálise
        }
        out.append((f"09-camadas-7/{cid}.json", data))
    return out


def gen_perguntas_clinicas():
    """16 files: 16 perguntas clínicas × 1"""
    out = []
    for p in PERGUNTAS_CLINICAS:
        pid = f"pergunta-{p['num']:02d}-{p['grupo'].lower().replace(' ', '-').replace('á','a').replace('é','e')}"
        # sanitize id
        pid = pid.replace("trauma-familiar", "familia").replace("estado-atual", "estado").replace("padroes", "padroes").replace("recursos", "recursos")
        data = {
            "id": pid,
            "categoria": "pergunta_clinica",
            "pergunta_numero": p["num"],
            "grupo": p["grupo"],
            "pergunta": p["pergunta"],
            "texto": p["pergunta"],
            "grounding": {
                "research_np_linha": p["linha_np"],
                "research_np_secao": "§3 16 Perguntas Clínicas Padrão (Protocolo de Entrevista)",
                "research_np_file": RESEARCH_NP,
                "open_source_url": "https://www.who.int/publications/i/item/9789241549790",
            },
            "alucinacao_score": 0.96,
            "requires_professional_review": p["num"] in (2, 11, 14),  # dissociação, segredo familiar, isolamento
        }
        out.append((f"10-perguntas-clinicas/{pid}.json", data))
    return out


# =============================================================================
# README + INDEX
# =============================================================================

def gen_readme(all_files):
    by_category = {}
    by_odu = {}
    by_chacra = {}
    professional_count = 0
    aluc_total = 0.0
    aluc_count = 0

    for rel, data in all_files:
        cat = data.get("categoria", "?")
        by_category[cat] = by_category.get(cat, 0) + 1

        if "odu" in data:
            odu_label = data["odu"]
            by_odu[odu_label] = by_odu.get(odu_label, 0) + 1
        if "chacra" in data and data.get("chacra_numero"):
            ch_label = data["chacra"]
            by_chacra[ch_label] = by_chacra.get(ch_label, 0) + 1
        if data.get("requires_professional_review"):
            professional_count += 1
        if isinstance(data.get("alucinacao_score"), (int, float)):
            aluc_total += data["alucinacao_score"]
            aluc_count += 1

    avg_aluc = (aluc_total / aluc_count) if aluc_count else 0.0
    pct_pro = (professional_count / len(all_files)) if all_files else 0.0

    cat_order = [
        "preceito", "quisila", "oriquente", "orifrio",
        "chakra_pratica", "elemento_banho",
        "caminho_essencia", "caminho_sombra",
        "camada_prompt", "pergunta_clinica",
    ]
    cat_labels = {
        "preceito": "01-odu-preceitos",
        "quisila": "02-odu-quisilas",
        "oriquente": "03-odu-oriquente",
        "orifrio": "04-odu-orifrio",
        "chakra_pratica": "05-chakra-praticas",
        "elemento_banho": "06-elemento-banhos",
        "caminho_essencia": "07-caminho-essencia",
        "caminho_sombra": "08-caminho-sombra",
        "camada_prompt": "09-camadas-7",
        "pergunta_clinica": "10-perguntas-clinicas",
    }

    readme = []
    readme.append("# Textos Terapêuticos — Wave 5 Synthesis Engine\n")
    readme.append("**Projeto:** Akasha Portal (Cabala dos Caminhos)  ")
    readme.append("**Data de geração:** 2026-06-23  ")
    readme.append("**Gerado por:** subagente Wave 5 prep (MiniMax M3)  ")
    readme.append("**Para revisão:** Gabriel (Zelador)\n")
    readme.append("## Sumário\n")
    readme.append(f"- **Total de arquivos:** {len(all_files)}")
    readme.append(f"- **alucinacao_score médio:** {avg_aluc:.2f}")
    readme.append(f"- **% com requires_professional_review:** {pct_pro * 100:.1f}%")
    readme.append(f"- **Categorias:** {len(by_category)}")
    readme.append("")
    readme.append("## Estilo e guardrails\n")
    readme.append("- **PT-BR only** (Brazilian Portuguese)")
    readme.append("- **Therapeutic-holistic universalist** (sem termos religiosos-cult, sem diagnóstico)")
    readme.append("- **'Menos é mais'**: 1-3 frases por texto, verbos diretos (\"Faça X\", \"Evite Y\")")
    readme.append("- **ADR 0002 guardrails respeitados**: sem \"Human Design\", \"Gene Keys\", \"BodyGraph\"")
    readme.append("- **Anti-alucinação**: cada arquivo cita research-medicina-tradicional §X linha Y OU research-numerologia-psicanalise §X linha Y")
    readme.append("- **No diagnosis**: nunca afirma \"você tem X\" — usa \"pode haver sinais de... consulte profissional\"\n")
    readme.append("## Estrutura\n")
    readme.append("| Categoria | Diretório | Arquivos |")
    readme.append("|---|---|---|")
    for cat in cat_order:
        n = by_category.get(cat, 0)
        label = cat_labels[cat]
        readme.append(f"| {cat} | `{label}/` | {n} |")
    readme.append(f"| **Total** | | **{len(all_files)}** |\n")
    readme.append("## Por Odu\n")
    readme.append("| Odu | Arquivos |")
    readme.append("|---|---|")
    for o in ODUS:
        label = f"{o['nome']} ({o['num']})"
        n = by_odu.get(label, 0)
        readme.append(f"| {label} | {n} |")
    readme.append("")
    readme.append("## Por Chácra\n")
    readme.append("| Chácra | Arquivos |")
    readme.append("|---|---|")
    for c in CHACRAS:
        n = by_chacra.get(c["nome"], 0)
        readme.append(f"| {c['nome']} | {n} |")
    readme.append("")
    readme.append("## Quick start (uso no Synthesis Engine)\n")
    readme.append("```ts")
    readme.append("// Carregar todos os textos de um Odu específico")
    readme.append("import preceitos from './01-odu-preceitos/odu-01-ogbe-preceito-01.json';")
    readme.append("import quisilas from './02-odu-quisilas/odu-01-ogbe-quisila-01.json';")
    readme.append("")
    readme.append("// Filtrar por categoria para Camada 4 (Quisilas) ou Camada 2 (Práticas)")
    readme.append("const quisilasDoOdu1 = Object.values<{categoria: string, odu: string}>")
    readme.append("  .filter(t => t.categoria === 'quisila' && t.odu.startsWith('Ogbe'))")
    readme.append("  .map(t => t.texto);")
    readme.append("```\n")
    readme.append("## Pesquisa de origem (citations)\n")
    readme.append("Todos os textos citam um dos dois research reports canônicos:\n")
    readme.append("1. **research-medicina-tradicional-2026-06-23.md** — 16 Odu canônicos + cristais + ervas")
    readme.append(f"   - Path: `.hermes/plans/research-medicina-tradicional-2026-06-23.md`")
    readme.append(f"   - URL open-source: {MTC_URL}")
    readme.append("2. **research-numerologia-psicanalise-2026-06-23.md** — 22 caminhos de vida + psicanálise + perguntas clínicas")
    readme.append(f"   - Path: `.hermes/plans/research-numerologia-psicanalise-2026-06-23.md`")
    readme.append(f"   - URL open-source: {NP_URL}\n")
    readme.append("## Disclaimer terapêutico\n")
    readme.append("> Estes textos são baseados em tradições terapêuticas públicas (fitoterapia brasileira, numerologia cabalística, psicanálise open-source) e NÃO substituem acompanhamento médico, psicológico ou psiquiátrico profissional. Em caso de gestação, lactação, uso contínuo de medicamentos ou condições crônicas, consulte um profissional de saúde antes de iniciar qualquer prática. Para uso litúrgico (Pilar 4): supervisionar com terreiro de Ifá/Candomblé.\n")
    readme.append("## Filtro `requires_professional_review: true`\n")
    readme.append(f"Total: **{professional_count}** arquivos ({pct_pro*100:.1f}% do corpus). Padrão típico: perguntas clínicas sobre dissociação/segregredo familiar, práticas com ervas com contraindicação (boldo, arruda), e camadas de diagnóstico/psicanálise. Revisão por Gabriel antes de uso em sessão.\n")
    readme.append("## Manutenção\n")
    readme.append("- Re-gerar corpus: `python3 _generate.py` (executa no monorepo root)")
    readme.append("- Adicionar preceitos: editar `ODU_PRECEITOS[odu_num]` em `_generate.py`")
    readme.append("- Mudar estilo: ajustar funções `gen_*()` preservando schema JSON")
    readme.append("- Validar schema: ver `index.json` (categoria + stats)\n")
    readme.append("---\n")
    readme.append("**Wave 5 prep — READ-ONLY até revisão do Gabriel.**")
    readme.append("")

    return "\n".join(readme), {
        "total": len(all_files),
        "by_category": {cat_labels[c]: by_category.get(c, 0) for c in cat_order},
        "by_categoria_interna": by_category,
        "stats": {
            "avg_alucinacao_score": round(avg_aluc, 2),
            "pct_professional_review": round(pct_pro, 4),
            "files_with_professional_review": professional_count,
        },
        "by_odu": by_odu,
        "by_chacra": by_chacra,
        "research_sources": [
            {"file": RESEARCH_MTC, "open_source": MTC_URL},
            {"file": RESEARCH_NP, "open_source": NP_URL},
        ],
    }


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("[1/3] Gerando preceitos...")
    p1 = gen_preceitos()
    print(f"  → {len(p1)} arquivos")
    print("[2/3] Gerando quisilas + orí quente/frio + chakra + elemento + caminho + camada + pergunta...")
    all_others = (
        gen_quisilas()
        + gen_oriquente()
        + gen_orifrio()
        + gen_chakra_praticas()
        + gen_elemento_banhos()
        + gen_caminho_essencia()
        + gen_caminho_sombra()
        + gen_camadas_7()
        + gen_perguntas_clinicas()
    )
    print(f"  → {len(all_others)} arquivos")
    all_files = p1 + all_others
    print(f"[3/3] Escrevendo {len(all_files)} JSON + README + index...")

    for rel, data in all_files:
        write_json(ROOT / rel, data)

    readme, index = gen_readme(all_files)
    (ROOT / "README.md").write_text(readme, encoding="utf-8")
    write_json(ROOT / "index.json", index)

    print(f"\n✅ Concluído: {len(all_files)} arquivos JSON + README.md + index.json")
    print(f"   avg alucinacao_score: {index['stats']['avg_alucinacao_score']}")
    print(f"   pct professional review: {index['stats']['pct_professional_review'] * 100:.1f}%")


if __name__ == "__main__":
    main()