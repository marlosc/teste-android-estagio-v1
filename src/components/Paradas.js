import axios from 'axios';

export const buscarParadas = async (termosBusca) => {
  try {
    const response = await axios.get('https://aiko-olhovivo-proxy.aikodigital.io/Parada/Buscar', {
      params: { termosBusca },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar paradas:', error);
    throw error;
  }
};
