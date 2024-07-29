import axios from 'axios';

const api = axios.create({
  baseURL: 'https://aiko-olhovivo-proxy.aikodigital.io',
});

export const previsaoChegada = async (codigoParada, codigoLinha) => {
  try {
    const response = await api.get('/Previsao', {
      params: { codigoParada, codigoLinha },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const buscarParadasPorLinha = async (codigoLinha) => {
  try {
    const response = await api.get('/Parada/BuscarParadasPorLinha', {
      params: { codigoLinha },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
