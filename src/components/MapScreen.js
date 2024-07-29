import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Button, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

const MapScreen = ({ voltar, paradas, onPressParada }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [previsao, setPrevisao] = useState(null);
  const [paradaSelecionada, setParadaSelecionada] = useState(null);
  const [veiculos, setVeiculos] = useState([]);
  const [showVeiculos, setShowVeiculos] = useState(false);
  const [showParadas, setShowParadas] = useState(true);
  const [visibleVeiculosCount, setVisibleVeiculosCount] = useState(50);

  const fetchPrevisao = async (codigoParada) => {
    try {
      const response = await axios.get(`https://aiko-olhovivo-proxy.aikodigital.io/Previsao/Parada?codigoParada=${codigoParada}`);
      setPrevisao(response.data.p);
    } catch (error) {
      console.error('Erro ao buscar previsão:', error);
    }
  };

  const fetchVeiculos = async () => {
    try {
      const response = await axios.get('https://aiko-olhovivo-proxy.aikodigital.io/Posicao');
      const veiculosData = response.data;

      const veiculosList = veiculosData.l.flatMap(linha => 
        linha.vs.map(veiculo => ({
          latitude: veiculo.py,
          longitude: veiculo.px,
        }))
      );

      setVeiculos(veiculosList);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    }
  };

  const handlePressParada = (parada) => {
    setParadaSelecionada(parada);
    fetchPrevisao(parada.cp);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchVeiculos(); // Buscar veículos quando o componente é montado
  }, []);

  useEffect(() => {
    if (paradaSelecionada) {
      fetchPrevisao(paradaSelecionada.cp);
    }
  }, [paradaSelecionada]);

  const paradaMarkers = useMemo(() => (
    showParadas && paradas.map((parada) => (
      <Marker
        key={parada.cp}
        coordinate={{ latitude: parada.py, longitude: parada.px }}
        title={parada.np}
        description={parada.ed}
        onPress={() => handlePressParada(parada)}
      />
    ))
  ), [showParadas, paradas]);

  const veiculoMarkers = useMemo(() => (
    showVeiculos && veiculos.slice(0, visibleVeiculosCount).map((veiculo, index) => (
      <Marker
        key={index}
        coordinate={{ latitude: veiculo.latitude, longitude: veiculo.longitude }}
        title={`Veículo ${index + 1}`}
        pinColor="blue" // Alterar cor para diferenciar os veículos
      />
    ))
  ), [showVeiculos, veiculos, visibleVeiculosCount]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -23.55052,
          longitude: -46.633308,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {paradaMarkers}
        {veiculoMarkers}
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setShowVeiculos(!showVeiculos)}>
          <Text style={styles.buttonText}>Veículos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setShowParadas(!showParadas)}>
          <Text style={styles.buttonText}>Paradas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={voltar}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      {showVeiculos && visibleVeiculosCount < veiculos.length && (
        <TouchableOpacity style={styles.loadMoreButton} onPress={() => setVisibleVeiculosCount(visibleVeiculosCount + 50)}>
          <Text style={styles.buttonText}>Carregar Mais Veículos</Text>
        </TouchableOpacity>
      )}

      {paradaSelecionada && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{paradaSelecionada.np}</Text>
              {previsao && previsao.l && previsao.l.length > 0 ? (
                previsao.l.map((linha) => (
                  linha.vs.map((veiculo, index) => (
                    <Text key={index} style={styles.modalText}>
                      {`Linha: ${linha.c} - Previsão de Chegada: ${veiculo.t}`}
                    </Text>
                  ))
                ))
              ) : (
                <Text style={styles.modalText}>Nenhuma previsão disponível</Text>
              )}
              <Button title="Fechar" onPress={() => setModalVisible(false)} color="red" />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
  },
  button: {
    marginVertical: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  loadMoreButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 14,
    marginVertical: 5,
  },
});

export default MapScreen;
