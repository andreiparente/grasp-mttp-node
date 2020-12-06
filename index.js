const { v4: uuidv4 } = require('uuid');
const Logger = require('./utils/logger');

const logman = new Logger(uuidv4(), 'excecao');
logger = logman.logger;

logger.info(`COMEÇO\n`);

const D = [
    [000, 10, 40, 60, 90, 110], 
    [10, 0, 20, 50, 80, 130], 
    [40, 20, 0, 150, 70, 30], 
    [60, 50, 150, 0, 10, 40], 
    [90, 80, 70, 10, 0, 10], 
    [110, 130, 30, 40, 10, 0]
];
const alfa = 0.6;

var solucao = construcao();



function construcao() {
    logger.info(`Matriz de distância:`);
    logger.info(`X|  0  |  1  |  2  |  3  |  4  |  5  |`);
    for (let i = 0; i < D.length; i++) {
        var linhaMsg = `${i}| `;
        for (let j = 0; j < D[0].length; j++) {
            linhaMsg += pad(D[i][j], 3) + ' | ';
        }
        logger.info(linhaMsg);
    }
    logger.info('');
    
    const solucao = graspInitialSolutionMttp(D, alfa);
    
    logger.info(`Solução:`);
    logger.info(`X|  0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 |`);
    for (let i = 0; i < solucao.length; i++) {
        var linhaMsg = `${i}| `;
        for (let j = 0; j < solucao[0].length; j++) {
            linhaMsg += solucao[i][j] + ' | ';
        }
        logger.info(linhaMsg);
    }
    
    calcularCustos(solucao, D);
    
    logger.info(`\nFIM DA CONSTRUÇÃO`);
    return solucao;
}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function printMatrix(matrix, matrixName) {
    logger.verbose(`Matriz ${matrixName} :`);
    for (let i = 0; i < matrix.length; i++) {
        logger.verbose(`${i}| ${matrix[i]}`);
    }
    logger.verbose(``);
}

function graspInitialSolutionMttp(D, alfa) {
    printMatrix(D, 'D');
    logger.verbose(`alfa: ${alfa}`);
    var reset = true;
    while (reset) {
        try {
            var S = [];
            var P = [];
            for (let i = 0; i < D.length; i++) {
                S[i] = [];
                P[i] = [];
                for (let j = 0; j < D.length; j++) {
                    S[i][j] = null;
                    P[i][j] = j;   
                }
                S[i].splice(i, 1);
                P[i].splice(i, 1);
            }
            printMatrix(S, 'S');
            printMatrix(P, 'P');
            for (let i = 0; i < S.length - 1; i++) {
                var P2 = JSON.parse(JSON.stringify(P));
                printMatrix(P2, 'P2');
                var timeAtual, adversario;
                while (P2.some( v => v != null)) {
                    var [timeAtual, vetorAdversario] = timeMenosPossibilidades(P2);
                    logger.debug(`vetorAdversario: ${vetorAdversario}`);
                    vetorAdversario = listaRestrita(vetorAdversario, alfa, D, i-1 < 0 ? timeAtual : S[timeAtual][i-1]);
                    adversario = vetorAdversario[Math.floor(Math.random() * vetorAdversario.length)];
                    logger.debug(`vetorAdversario restrito: ${vetorAdversario}`);
                    S[timeAtual][i] = adversario;
                    S[adversario][i] = timeAtual;
                    P2[adversario] = null;
                    P2[timeAtual] = null;
                    for (let i = 0; i < P2.length; i++) {
                        if (P2[i] != null) {
                            for (let j = 0; j < P2[i].length; j++) {
                                if (P2[i][j] === timeAtual) {
                                    P2[i].splice(j, 1);
                                    j = -1;
                                }
                                if (P2[i][j] === adversario) {
                                    P2[i].splice(j, 1);
                                    j = -1;
                                }
                            }
                        }
                    }
                    printMatrix(P2, 'P2');
                    var index = P[timeAtual].indexOf(adversario);
                    P[timeAtual].splice(index, 1);
                    index = P[adversario].indexOf(timeAtual);
                    P[adversario].splice(index, 1);
                    printMatrix(P, 'P');
                }
            }
            reset = false;
        }
        catch (e) {
            logger.info(`RESETANDO CONFRONTOS\n`);
        }
    }
    logger.info(`CONFRONTOS DEFINIDOS\n`);
    var S2 = S;
    printMatrix(S2, 'S2');
    for (let j = 0; j < S2[0].length; j++) {
        for (let i = 0; i < S2.length; i++) {
            if (j === 0) {
                if (typeof S2[i][j] != 'string') {
                    var adversario = S2[i][j];
                    var localAleatorio = 'HA'[Math.floor(Math.random() * 2)];
                    S2[i][j] = localAleatorio + S2[i][j];
                    S2[adversario][j] = localContrario(localAleatorio) + S2[adversario][j];
                }
            }
            else if (j !== (S2[0].length-1)) {
                if (typeof S2[i][j] != 'string') {
                    var time1 = i;
                    var time2 = S2[i][j];
                    var [ultimoLocal1, seq1] = analisarSequencia(S2[time1], j);
                    var [ultimoLocal2, seq2] = analisarSequencia(S2[time2], j);
                    if (seq1 > seq2) {
                        S2[time1][j] = localContrario(ultimoLocal1) + S2[time1][j];
                        S2[time2][j] = ultimoLocal1 + S2[time2][j];
                    } 
                    else if (seq1 < seq2) {
                        S2[time1][j] = ultimoLocal2 + S2[time1][j];
                        S2[time2][j] = localContrario(ultimoLocal2) + S2[time2][j];
                    } 
                    else {
                        if (ultimoLocal1 !== ultimoLocal2) {
                            S2[time1][j] = ultimoLocal2 + S2[time1][j];
                            S2[time2][j] = ultimoLocal1 + S2[time2][j];
                        }
                        else {
                            let localAleatorio = 'HA'[Math.floor(Math.random() * 2)];
                            S2[time1][j] = localAleatorio + S2[time1][j];
                            S2[time2][j] = localContrario(localAleatorio) + S2[time2][j];
                        }
                    }
                }
            }
            else {
                var solucao = testandoUltimos(S2);
                if (solucao != null) {
                    logger.info(`SOLUÇÃO VALIDADA\n`);
                    return solucao;
                }
                logger.info(`RESETANDO LOCAIS\n`);
                S2 = S;
                j = -1;
            }
        }
        printMatrix(S2, 'S2');
    }
    printMatrix(S2, 'S2');
}
 
function timeMenosPossibilidades(P2) {
    var timesComMenos = [];
    var menorPossibilidade = P2.length;
    for (let i = 0; i < P2.length; i++) {
        if (P2[i] != null) {
            var possibilidades = P2[i].length;
            if (possibilidades < menorPossibilidade) {
                menorPossibilidade = possibilidades;
                timesComMenos = [];
                timesComMenos.push(i);        
            }
            else if (possibilidades == menorPossibilidade) {
                timesComMenos.push(i);
            }
        }
    }
    var escolhido = timesComMenos[Math.floor(Math.random() * timesComMenos.length)];
    var vetorL = P2[escolhido];
    if (menorPossibilidade === 2) {
        var igual = [];
        for (let i = 0; i < vetorL.length; i++) {
            for (let j = 0; j < timesComMenos.length; j++) {
                if (vetorL[i] === timesComMenos[j]) {
                    igual.push(vetorL[i]);
                    break;
                }
            }
        }
        if (igual.length > 0) return [escolhido, igual];
    }
    return [escolhido, vetorL];
}

function listaRestrita(V, alfa, D, localAnterior) {
    var qtd = V.length - Math.floor(alfa * V.length);
    qtd = qtd < 1 ? 1 : qtd;
    var arrayDeObjTimeCusto = [];
    for (let i = 0; i < V.length ; i++) {
        arrayDeObjTimeCusto[i] = {
            time: V[i],
            custo: D[localAnterior][V[i]]
        }
    }
    if (arrayDeObjTimeCusto.length > 1) arrayDeObjTimeCusto = arrayDeObjTimeCusto.sort( (a, b) => (a.custo - b.custo));
    arrayDeObjTimeCusto.splice(qtd+1);
    var vetorRestrito = [];
    for (let i = 0; i < arrayDeObjTimeCusto.length; i++) {
        vetorRestrito.push(arrayDeObjTimeCusto[i].time);
    }
    return vetorRestrito;
}

function analisarSequencia(VS, j) {
    var ultimoLocal = VS[j-1].replace(/[0-9]/g, '');
    var seq = 0;
    while (j > 0 && VS[j-1].replace(/[0-9]/g, '') === ultimoLocal) {
        seq++;
        j--;
    }
    return [ultimoLocal, seq];
}

function localContrario(el) {
    if (el.includes('A')) {
        return el.replace('A', 'H');
    }
    return el.replace('H', 'A');
}

function testandoUltimos(S2) {
    var ultimaPartida = S2[0].length - 1;
    var metade = [...Array( S2.length).keys()];
    for (let i = 0; i < metade.length; i++) {
        var index = metade.indexOf(S2[metade[i]][ultimaPartida]);
        metade.splice(index, 1);
    }
    const maxTentativas = Math.pow(2,(S2.length/2));
    for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
        var padrao = tentativa.toString(2);
        var toAdd = '';
        for (let index = 0; index < ((S2.length/2) - padrao.length); index++) {
            toAdd += '0';
        }
        padrao = toAdd + padrao;
        padrao = padrao.replace(/0/g, 'H');
        padrao = padrao.replace(/1/g, 'A');
        var solucao = JSON.parse(JSON.stringify(S2));
        for (let i = 0; i < metade.length; i++) {
            var adversario = solucao[metade[i]][ultimaPartida];
            var local = padrao[i];
            solucao[metade[i]][ultimaPartida] = local + solucao[metade[i]][ultimaPartida];
            solucao[adversario][ultimaPartida] = localContrario(local) + solucao[adversario][ultimaPartida];
        }
        var outraMetade = JSON.parse(JSON.stringify(solucao));
        for (let i = 0; i < outraMetade.length; i++) {
            for (let j = 0; j < outraMetade[0].length; j++) {
                outraMetade[i][j] = localContrario(outraMetade[i][j]);
            }
            solucao[i] = solucao[i].concat(outraMetade[i]);
        }
        if (solucaoValida(solucao)) return solucao;
        logger.info(`TESTANDO OUTRA SOLUÇÃO PARA PARTIDA FINAL`);
    }
    return null;
}

function solucaoValida(S) {
    for (let i = 0; i < S.length; i++) {
        var contador = 0;
        var ultimoTipoLocal = S[i][0].replace(/[0-9]/g, '');
        for (let j = 0; j < S[0].length; j++) {
            if (S[i][j].replace(/[0-9]/g, '') === ultimoTipoLocal) {
                contador++;
                if (contador === 4) return false;
            }
            else {
                contador = 1;
                ultimoTipoLocal = S[i][j].replace(/[0-9]/g, '');
            }
        }
    }
    return true;
}

function calcularCustos(solucao, D) {
    logger.info(``);
    var vetorCustos = [];
    for (let i = 0; i < solucao.length; i++) {
        var custoLinha = [];
        var origem = i;
        var jogosDoTime = solucao[i];
        var destino;
        for (let j = 0; j < jogosDoTime.length; j++) {
            if(jogosDoTime[j].includes('H')) destino = i;
            else destino = jogosDoTime[j].replace(/\D/g,'');
            custoLinha.push(D[origem][destino]);
            origem = destino;
        }
        vetorCustos.push(custoLinha.reduce((a, b) => a + b, 0));
        logger.info(`Vetor de custo da linha ${i}: ${custoLinha} = ${vetorCustos[i]}`);
    }
    logger.info(`\nSomatório de custos: ${vetorCustos.reduce((a, b) => a + b, 0)}`);
}

function homeAwaySwap(solucao) {
    
}

function teamSwap(solucao) {

}

/*/ UNUSED FUNCTIONS
function homeAwayFiltro(V, S, casa, i) {
    V = V.filter(possibilidade => possibilidade !== null);
    var Vnew = [];
 
    if (i > 2) {
        var seqUltimos = S[casa][i-3] + S[casa][i-2] + S[casa][i-1];
        if (i !== (V.length - 1)) {
            if (quebraRegraDos3Seguidos(seqUltimos, 'H', null)) return V.array.forEach(adversario => adversario = 'A'+adversario.toString);
            if (quebraRegraDos3Seguidos(seqUltimos, 'A', null)) return V.array.forEach(adversario => adversario = 'H'+adversario.toString);
 
            for (let j = 0; j < V.length - 1; j++) {
                var partidas = S[V[j]];
                seqUltimos = partidas[i-3] + partidas[i-2] + partidas[i-1];
                if (quebraRegraDos3Seguidos(seqUltimos, 'H', null)) newV.push('A'+V[j]);
                else if (quebraRegraDos3Seguidos(seqUltimos, 'A', null)) newV.push('H'+V[j]);
                else { 
                    newV.push('A'+V[j]);
                    newV.push('H'+V[j]);
                }
            }
        } else {
            var seqPrimeiros = S[casa][0] + S[casa][1] + S[casa][2];
           
            if (quebraRegraDos3Seguidos(seqUltimos, 'H', seqPrimeiros)) return V.array.forEach(adversario => adversario = 'A'+adversario.toString);
            if (quebraRegraDos3Seguidos(seqUltimos, 'A', seqPrimeiros)) return V.array.forEach(adversario => adversario = 'H'+adversario.toString);
 
            for (let j = 0; j < V.length - 1; j++) {
                var partidas = S[V[j]];
                seqUltimos = partidas[i-3] + partidas[i-2] + partidas[i-1];
                seqPrimeiros = partidas[0] + partidas[1] + partidas[2];
                if (quebraRegraDos3Seguidos(seqUltimos, 'H', seqPrimeiros)) newV.push('A'+V[j]);
                else if (quebraRegraDos3Seguidos(seqUltimos, 'A', seqPrimeiros)) newV.push('H'+V[j]);
                else { 
                    newV.push('A'+V[j]);
                    newV.push('H'+V[j]);
                }
            }
        }    
    } else {
        for (let j = 0; j < V.length - 1; j++) {
            newV.push('A'+V[j]);
            newV.push('H'+V[j]);
        }
    }
 
    return Vnew;
}
 
function quebraRegraDos3Seguidos(seqUltimos, local, seqPrimeiros) {
    var seq = seqUltimos + local;
    if (seqPrimeiros !== null) {
        for (let i = 0; i < seqPrimeiros.length; i++) {
            if (seqPrimeiros[i] === 'H') seqPrimeiros[i] = 'A';
            else if (seqPrimeiros[i] === 'A') seqPrimeiros[i] = 'H';
        }
        seq = seq + seqPrimeiros;
    }
    seq = seq.replace(/[0-9]/g, '');
 
    var contador = 1;
    var ultimo = seq[0];
 
    for (let j = 1; j < seq.length; j++) {
        if (seq[j] === ultimo) contador++;
        else contador = 1;
        if (contador === 4) return true;
        ultimo = seq[j];
    }
    return false;
}
*/