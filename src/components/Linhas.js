export const buscarLinhas = async (termosBusca) => {
  try {
    const response = await api.get(`/Linha/Buscar`, {
      params: { termosBusca },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

