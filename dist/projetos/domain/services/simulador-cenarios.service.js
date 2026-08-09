"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimuladorCenariosService = void 0;
exports.deepFreeze = deepFreeze;
const library_1 = require("@prisma/client/runtime/library");
function deepFreeze(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach((prop) => {
        const val = obj[prop];
        if (val !== null &&
            (typeof val === 'object' || typeof val === 'function') &&
            !Object.isFrozen(val)) {
            deepFreeze(val);
        }
    });
    return obj;
}
class SimuladorCenariosService {
    simular(snapshot, parametros = {}) {
        deepFreeze(snapshot);
        const referenceDate = snapshot.referenceDate
            ? new Date(snapshot.referenceDate)
            : new Date();
        const dataInicioSimulada = parametros.dataInicioSimulada
            ? new Date(parametros.dataInicioSimulada)
            : referenceDate;
        const aporteGlobal = this.toDecimal(parametros.aporteMensalGlobal ?? 0);
        const multEsfriamento = Math.max(0.0, Math.min(2.0, parametros.multiplicadorEsfriamento ?? 1.0));
        const mapAportesEtapas = this.parseAportesEtapas(parametros.aportesMensaisEtapas);
        const mapAjustesCustos = this.parseAjustesCustos(parametros.ajustesCustoEtapas);
        const baseline = this.calcularMetricasBaseline(snapshot, dataInicioSimulada);
        const etapasOrdenadas = [...snapshot.etapas].sort((a, b) => a.ordem - b.ordem);
        const etapasSimuladas = [];
        let dataAtualCronograma = new Date(dataInicioSimulada);
        let custoTotalSimulado = new library_1.Decimal(0);
        let valorFinanciadoTotalSimulado = new library_1.Decimal(0);
        let totalItensWishlistProjeto = 0;
        let totalItensProntosProjeto = 0;
        let dataMaxCoberturaProjeto = new Date(dataInicioSimulada);
        let dataMaxReadinessProjeto = new Date(dataInicioSimulada);
        let projetoIncompletoFinanceiro = false;
        for (const etapa of etapasOrdenadas) {
            let custoBaseEtapa = new library_1.Decimal(0);
            let valorFinanciadoEtapa = new library_1.Decimal(0);
            let itensWishlistEtapa = 0;
            let itensProntosEtapa = 0;
            let maxFimEsfriamentoEtapa = new Date(dataAtualCronograma);
            for (const item of etapa.itens) {
                if (item.itemWishlist) {
                    const w = item.itemWishlist;
                    const preco = this.toDecimal(w.preco);
                    custoBaseEtapa = custoBaseEtapa.plus(preco);
                    itensWishlistEtapa += 1;
                    if (w.status === 'COMPRADO') {
                        itensProntosEtapa += 1;
                    }
                    else {
                        const diasOrig = w.diasEsfriamento ?? 7;
                        const diasSimulados = Math.floor(diasOrig * multEsfriamento);
                        const inicio = w.inicioEsfriamento
                            ? new Date(w.inicioEsfriamento)
                            : new Date(dataAtualCronograma);
                        const fimEsfriamentoSimulado = new Date(inicio);
                        fimEsfriamentoSimulado.setDate(fimEsfriamentoSimulado.getDate() + diasSimulados);
                        if (fimEsfriamentoSimulado.getTime() <= referenceDate.getTime()) {
                            itensProntosEtapa += 1;
                        }
                        if (fimEsfriamentoSimulado.getTime() > maxFimEsfriamentoEtapa.getTime()) {
                            maxFimEsfriamentoEtapa = fimEsfriamentoSimulado;
                        }
                    }
                }
                if (item.meta && item.meta.status !== 'CANCELADA') {
                    const metaVal = this.toDecimal(item.meta.valorAcumulado);
                    valorFinanciadoEtapa = valorFinanciadoEtapa.plus(metaVal);
                    if (!item.itemWishlist) {
                        const alvo = this.toDecimal(item.meta.valorAlvo);
                        custoBaseEtapa = custoBaseEtapa.plus(alvo);
                    }
                }
            }
            const ajuste = mapAjustesCustos.get(etapa.id);
            let custoSimuladoEtapa = custoBaseEtapa;
            if (ajuste) {
                if (ajuste.multiplicadorCusto !== undefined) {
                    custoSimuladoEtapa = custoSimuladoEtapa.times(new library_1.Decimal(ajuste.multiplicadorCusto.toString()));
                }
                if (ajuste.custoFixoAdicional !== undefined) {
                    custoSimuladoEtapa = custoSimuladoEtapa.plus(this.toDecimal(ajuste.custoFixoAdicional));
                }
            }
            const diff = custoSimuladoEtapa.minus(valorFinanciadoEtapa);
            const deficitEtapa = diff.greaterThan(0) ? diff : new library_1.Decimal(0);
            const aporteDisponivelEtapa = mapAportesEtapas.has(etapa.id)
                ? mapAportesEtapas.get(etapa.id)
                : aporteGlobal;
            let mesesParaCobertura = 0;
            let dataCobertura100Etapa = null;
            if (deficitEtapa.isZero()) {
                mesesParaCobertura = 0;
                dataCobertura100Etapa = new Date(dataAtualCronograma);
            }
            else if (aporteDisponivelEtapa.isZero() ||
                aporteDisponivelEtapa.isNegative()) {
                mesesParaCobertura = null;
                dataCobertura100Etapa = null;
                projetoIncompletoFinanceiro = true;
            }
            else {
                const div = deficitEtapa.dividedBy(aporteDisponivelEtapa).toNumber();
                mesesParaCobertura = Math.ceil(div);
                const dCob = new Date(dataAtualCronograma);
                dCob.setMonth(dCob.getMonth() + mesesParaCobertura);
                dataCobertura100Etapa = dCob;
            }
            const dataReadiness100Etapa = maxFimEsfriamentoEtapa;
            let dataConclusaoEstimadaEtapa = null;
            if (dataCobertura100Etapa === null) {
                dataConclusaoEstimadaEtapa = null;
            }
            else {
                dataConclusaoEstimadaEtapa =
                    dataCobertura100Etapa.getTime() >= dataReadiness100Etapa.getTime()
                        ? dataCobertura100Etapa
                        : dataReadiness100Etapa;
            }
            custoTotalSimulado = custoTotalSimulado.plus(custoSimuladoEtapa);
            valorFinanciadoTotalSimulado = valorFinanciadoTotalSimulado.plus(valorFinanciadoEtapa);
            totalItensWishlistProjeto += itensWishlistEtapa;
            totalItensProntosProjeto += itensProntosEtapa;
            if (dataCobertura100Etapa !== null) {
                if (dataMaxCoberturaProjeto === null ||
                    dataCobertura100Etapa.getTime() > dataMaxCoberturaProjeto.getTime()) {
                    dataMaxCoberturaProjeto = dataCobertura100Etapa;
                }
            }
            else {
                dataMaxCoberturaProjeto = null;
            }
            if (dataMaxReadinessProjeto === null ||
                dataReadiness100Etapa.getTime() > dataMaxReadinessProjeto.getTime()) {
                dataMaxReadinessProjeto = dataReadiness100Etapa;
            }
            etapasSimuladas.push({
                etapaId: etapa.id,
                nome: etapa.nome,
                ordem: etapa.ordem,
                custoBase: custoBaseEtapa,
                custoSimulado: custoSimuladoEtapa,
                valorFinanciado: valorFinanciadoEtapa,
                deficitFinanceiro: deficitEtapa,
                aporteMensalDisponivel: aporteDisponivelEtapa,
                mesesParaCobertura,
                dataCobertura100: dataCobertura100Etapa,
                dataReadiness100: dataReadiness100Etapa,
                dataConclusaoEstimada: dataConclusaoEstimadaEtapa,
                totalItensWishlist: itensWishlistEtapa,
                itensProntos: itensProntosEtapa,
            });
            if (dataConclusaoEstimadaEtapa !== null) {
                dataAtualCronograma = new Date(dataConclusaoEstimadaEtapa);
            }
        }
        const coberturaPercentualSimulada = custoTotalSimulado.isZero()
            ? 0
            : Math.min(100, Number(valorFinanciadoTotalSimulado
                .dividedBy(custoTotalSimulado)
                .times(100)
                .toFixed(2)));
        const readinessPercentualSimulada = totalItensWishlistProjeto > 0
            ? Number(((totalItensProntosProjeto / totalItensWishlistProjeto) * 100).toFixed(2))
            : 0;
        const dataCobertura100Simulada = projetoIncompletoFinanceiro
            ? null
            : dataMaxCoberturaProjeto;
        const dataReadiness100Simulada = dataMaxReadinessProjeto;
        let dataConclusaoEstimadaRealSimulada = null;
        if (dataCobertura100Simulada === null) {
            dataConclusaoEstimadaRealSimulada = null;
        }
        else {
            dataConclusaoEstimadaRealSimulada =
                dataCobertura100Simulada.getTime() >= dataReadiness100Simulada.getTime()
                    ? dataCobertura100Simulada
                    : dataReadiness100Simulada;
        }
        const metricasSimuladas = {
            custoTotal: custoTotalSimulado,
            valorFinanciadoTotal: valorFinanciadoTotalSimulado,
            coberturaPercentual: coberturaPercentualSimulada,
            readinessPercentual: readinessPercentualSimulada,
            dataCobertura100: dataCobertura100Simulada,
            dataReadiness100: dataReadiness100Simulada,
            dataConclusaoEstimada: dataConclusaoEstimadaRealSimulada,
            dataConclusaoEstimadaReal: dataConclusaoEstimadaRealSimulada,
        };
        const deltaCobertura = Number((metricasSimuladas.coberturaPercentual - baseline.coberturaPercentual).toFixed(2));
        const deltaReadiness = Number((metricasSimuladas.readinessPercentual - baseline.readinessPercentual).toFixed(2));
        let diasAntecipados = 0;
        let mesesAntecipados = 0;
        if (baseline.dataConclusaoEstimada !== null &&
            metricasSimuladas.dataConclusaoEstimadaReal !== null) {
            const diffMs = baseline.dataConclusaoEstimada.getTime() -
                metricasSimuladas.dataConclusaoEstimadaReal.getTime();
            diasAntecipados = Math.round(diffMs / (1000 * 60 * 60 * 24));
            mesesAntecipados = Math.round(diasAntecipados / 30);
        }
        const gargalo = this.detectarGargaloCritico(etapasSimuladas);
        return {
            referenceDate,
            baseline,
            simulado: metricasSimuladas,
            deltas: {
                deltaCobertura,
                deltaReadiness,
                diasAntecipados,
                mesesAntecipados,
            },
            gargalo,
            etapas: etapasSimuladas,
        };
    }
    calcularMetricasBaseline(snapshot, dataInicio) {
        let custoTotal = new library_1.Decimal(0);
        let valorFinanciadoTotal = new library_1.Decimal(0);
        let totalWish = 0;
        let totalProntos = 0;
        let maxReadinessDate = new Date(dataInicio);
        for (const etapa of snapshot.etapas) {
            for (const item of etapa.itens) {
                if (item.itemWishlist) {
                    totalWish += 1;
                    const w = item.itemWishlist;
                    custoTotal = custoTotal.plus(this.toDecimal(w.preco));
                    if (w.status === 'COMPRADO') {
                        totalProntos += 1;
                    }
                    else {
                        const diasOrig = w.diasEsfriamento ?? 7;
                        const fimEsfriamento = w.fimEsfriamento
                            ? new Date(w.fimEsfriamento)
                            : new Date(dataInicio.getTime() + diasOrig * 24 * 60 * 60 * 1000);
                        if (fimEsfriamento.getTime() <= snapshot.referenceDate.getTime()) {
                            totalProntos += 1;
                        }
                        if (fimEsfriamento.getTime() > maxReadinessDate.getTime()) {
                            maxReadinessDate = fimEsfriamento;
                        }
                    }
                }
                if (item.meta && item.meta.status !== 'CANCELADA') {
                    const val = this.toDecimal(item.meta.valorAcumulado);
                    valorFinanciadoTotal = valorFinanciadoTotal.plus(val);
                    if (!item.itemWishlist) {
                        custoTotal = custoTotal.plus(this.toDecimal(item.meta.valorAlvo));
                    }
                }
            }
        }
        const coberturaPercentual = custoTotal.isZero()
            ? 0
            : Math.min(100, Number(valorFinanciadoTotal.dividedBy(custoTotal).times(100).toFixed(2)));
        const readinessPercentual = totalWish > 0 ? Number(((totalProntos / totalWish) * 100).toFixed(2)) : 0;
        const dataCobertura100 = coberturaPercentual >= 100 ? new Date(dataInicio) : null;
        const dataReadiness100 = maxReadinessDate;
        const dataConclusaoEstimada = dataCobertura100 === null
            ? null
            : dataCobertura100.getTime() >= dataReadiness100.getTime()
                ? dataCobertura100
                : dataReadiness100;
        return {
            custoTotal,
            valorFinanciadoTotal,
            coberturaPercentual,
            readinessPercentual,
            dataCobertura100,
            dataReadiness100,
            dataConclusaoEstimada,
        };
    }
    detectarGargaloCritico(etapas) {
        if (etapas.length === 0) {
            return { criticalStageId: null, criticalStageReason: null };
        }
        const etapaSemCobertura = etapas.find((e) => e.dataCobertura100 === null);
        if (etapaSemCobertura) {
            return {
                criticalStageId: etapaSemCobertura.etapaId,
                criticalStageReason: `Gargalo Financeiro Crítico: Etapa '${etapaSemCobertura.nome}' possui déficit de R$ ${etapaSemCobertura.deficitFinanceiro.toFixed(2)} sem aporte mensal definido.`,
            };
        }
        let gargaloEtapa = etapas[0];
        for (const etapa of etapas) {
            if (etapa.dataConclusaoEstimada &&
                (!gargaloEtapa.dataConclusaoEstimada ||
                    etapa.dataConclusaoEstimada.getTime() >
                        gargaloEtapa.dataConclusaoEstimada.getTime())) {
                gargaloEtapa = etapa;
            }
        }
        if (!gargaloEtapa.dataConclusaoEstimada) {
            return { criticalStageId: null, criticalStageReason: null };
        }
        const cobTime = gargaloEtapa.dataCobertura100
            ? gargaloEtapa.dataCobertura100.getTime()
            : 0;
        const readTime = gargaloEtapa.dataReadiness100
            ? gargaloEtapa.dataReadiness100.getTime()
            : 0;
        if (cobTime >= readTime) {
            return {
                criticalStageId: gargaloEtapa.etapaId,
                criticalStageReason: `Gargalo Financeiro: Etapa '${gargaloEtapa.nome}' requer ${gargaloEtapa.mesesParaCobertura} meses de aporte mensal (R$ ${gargaloEtapa.aporteMensalDisponivel.toFixed(2)}) para cobrir o déficit de R$ ${gargaloEtapa.deficitFinanceiro.toFixed(2)}.`,
            };
        }
        else {
            return {
                criticalStageId: gargaloEtapa.etapaId,
                criticalStageReason: `Gargalo de Readiness: Etapa '${gargaloEtapa.nome}' retida pelo tempo de esfriamento acumulado dos itens da wishlist.`,
            };
        }
    }
    parseAportesEtapas(input) {
        const map = new Map();
        if (!input)
            return map;
        if (Array.isArray(input)) {
            for (const item of input) {
                if (item.etapaId) {
                    map.set(item.etapaId, this.toDecimal(item.aporteMensal));
                }
            }
        }
        else if (typeof input === 'object') {
            for (const [key, val] of Object.entries(input)) {
                map.set(key, this.toDecimal(val));
            }
        }
        return map;
    }
    parseAjustesCustos(input) {
        const map = new Map();
        if (!input)
            return map;
        if (Array.isArray(input)) {
            for (const item of input) {
                if (item.etapaId) {
                    map.set(item.etapaId, item);
                }
            }
        }
        else if (typeof input === 'object') {
            for (const [key, val] of Object.entries(input)) {
                map.set(key, { etapaId: key, custoFixoAdicional: this.toDecimal(val) });
            }
        }
        return map;
    }
    toDecimal(val) {
        if (val === null || val === undefined)
            return new library_1.Decimal(0);
        if (library_1.Decimal.isDecimal(val))
            return val;
        return new library_1.Decimal(val.toString());
    }
}
exports.SimuladorCenariosService = SimuladorCenariosService;
//# sourceMappingURL=simulador-cenarios.service.js.map