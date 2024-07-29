import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import MapScreen from './src/components/MapScreen';
import { buscarParadas } from './src/components/Paradas';
import { previsaoChegada } from './src/components/PrevisaoChegada';

const App = () => {
  const [token, setToken] = useState('');
  const [busca, setBusca] = useState('');
  const [linhas, setLinhas] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [previsao, setPrevisao] = useState(null);
  const [paradaSelecionada, setParadaSelecionada] = useState(null);
  const [mostrarInput, setMostrarInput] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [mostrarParadas, setMostrarParadas] = useState(false);
  const [erro, setErro] = useState('');

  const autenticar = async () => {
    try {
      const response = await axios.post('https://aiko-olhovivo-proxy.aikodigital.io/Login/Autenticar', null, {
        params: {
          token: '708a28796db35b0ce807f4c7719502eeea6b2b9a09d72342a71fcae367f5533e',
        },
      });
      if (response.data) {
        alert('Autenticado com sucesso!');
        setToken('708a28796db35b0ce807f4c7719502eeea6b2b9a09d72342a71fcae367f5533e');
      }
    } catch (error) {
      setErro('Erro na autenticação. Por favor, tente novamente.');
      console.error('Erro na autenticação:', error);
    }
  };

  const buscarLinhas = async () => {
    try {
      const response = await axios.get('https://aiko-olhovivo-proxy.aikodigital.io/Linha/Buscar', {
        params: {
          termosBusca: busca,
        },
      });
      setLinhas(response.data);
    } catch (error) {
      setErro('Erro ao buscar linhas. Por favor, tente novamente.');
      console.error('Erro ao buscar linhas:', error);
    }
  };

  const carregarParadas = async (termosBusca) => {
    try {
      const todasParadas = await buscarParadas(termosBusca);
      if (Array.isArray(todasParadas)) {
        const paradasFiltradas = todasParadas.filter(parada => parada.np);
        setParadas(paradasFiltradas);
      } else {
        console.error('O formato da resposta não é um array.');
      }
    } catch (error) {
      setErro('Erro ao carregar paradas. Por favor, tente novamente.');
      console.error('Erro ao carregar paradas:', error);
    }
  };

  const buscarPrevisao = async (codigoParada) => {
    try {
      const response = await axios.get(`https://aiko-olhovivo-proxy.aikodigital.io/Previsao/Parada?codigoParada=${codigoParada}`);
      const previsaoData = response.data;
      setPrevisao(previsaoData);
      setParadaSelecionada(previsaoData.p);
    } catch (error) {
      setErro('Erro ao buscar previsão. Por favor, tente novamente.');
      console.error('Erro ao buscar previsão:', error);
    }
  };

  const voltarInicio = () => {
    setMostrarInput(false);
    setBusca('');
    setLinhas([]);
    setParadas([]);
    setPrevisao(null);
    setParadaSelecionada(null);
    setMostrarParadas(false);
    setErro('');
  };

  if (mostrarMapa) {
    return (
      <MapScreen
        voltar={() => {
          setMostrarMapa(false);
          setMostrarParadas(true);
        }}
        paradas={paradas}
        onPressParada={(codigoParada) => buscarPrevisao(codigoParada)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Image source={require('./src/images/veiculo-icon.png')} style={styles.icon} />
        <Text style={styles.title}>Bus Stop SP</Text>
        {erro && <Text style={styles.errorText}>{erro}</Text>}
        {!mostrarInput && !mostrarParadas && (
          <>
            <TouchableOpacity style={styles.button} onPress={() => setMostrarInput(true)}>
              <Text style={styles.buttonText}>Mostrar Linhas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {
              carregarParadas(busca);
              setMostrarMapa(true);
            }}>
              <Text style={styles.buttonText}>Mostrar Mapa</Text>
            </TouchableOpacity>
          </>
        )}
        {mostrarInput && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Digite um parâmetro. EX: Lapa, 8000"
              value={busca}
              onChangeText={setBusca}
            />
            <TouchableOpacity style={styles.button} onPress={buscarLinhas}>
              <Text style={styles.buttonText}>Buscar Linhas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonRed]} onPress={voltarInicio}>
              <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
          </>
        )}
        {mostrarParadas && (
          <>
            <FlatList
              data={paradas}
              keyExtractor={(item) => item.cp.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => buscarPrevisao(item.cp)}>
                  <Text>{`Nome Parada: ${item.np}`}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[styles.button, styles.buttonRed]} onPress={voltarInicio}>
              <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
          </>
        )}
        {linhas.length > 0 && (
          <FlatList
            data={linhas}
            keyExtractor={(item) => item.cl.toString()}
            renderItem={({ item }) => (
              <View style={styles.infoContainer}>
                <Text>{`Código ID da linha: ${item.cl}`}</Text>
                <Text>{`Letreiro Principal: ${item.lt}`}</Text>
                <Text>{`Letreiro Secundário: ${item.tl}`}</Text>
                <Text>{`Terminal Principal: ${item.tp}`}</Text>
                <Text>{`Terminal Secundário: ${item.ts}`}</Text>
                <Text>{`Sentido Da Linha: ${item.sl}`}</Text>
              </View>
            )}
          />
        )}
        {previsao && paradaSelecionada && previsao.p && previsao.p.l && (
          <View style={styles.previsaoContainer}>
            <Text style={styles.previsaoTitle}>{`Nome da Parada: ${paradaSelecionada.np}`}</Text>
            <Text style={styles.previsaoSubtitle}>Previsão de Chegada:</Text>
            {previsao.p.l.map((linha) => (
              linha.vs.map((v) => (
                <Text key={v.p} style={styles.previsaoText}>{`Linha: ${linha.c} - Previsão de Chegada: ${v.t} - Veículo: ${v.p}`}</Text>
              ))
            ))}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gray',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    width: '100%',
    color: 'white',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  buttonRed: {
    backgroundColor: '#FF0000',
  },
  infoContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    backgroundColor: 'white',
  },
  previsaoContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    width: '100%',
  },
  previsaoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  previsaoSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'white',
  },
  previsaoText: {
    fontSize: 14,
    color: 'white',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  icon: {
    width: 300,
    height: 300,
    marginBottom: -50,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
});

export default App;
