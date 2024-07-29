export const posicaoVeiculos = async () => {
  try {
    const response = await api.get(`/Posicao`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const posicaoVeiculosPorLinha = async (codigoLinha) => {
  try {
    const response = await api.get(`/Posicao/Linha`, {
      params: { codigoLinha },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const posicaoVeiculosPorGaragem = async (codigoEmpresa, codigoLinha) => {
  try {
    const response = await api.get(`/Posicao/Garagem`, {
      params: { codigoEmpresa, codigoLinha },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
