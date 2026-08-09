import { SeveridadeAlertaEnum } from '../alertas.service';
export declare class ListarAlertasQueryDto {
    page?: number;
    pageSize?: number;
    apenasNaoLidos?: boolean;
    severidade?: SeveridadeAlertaEnum;
}
