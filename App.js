import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import BarraDePesquisa from './componentes/BarraDePesquisa';

export default function App() {
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [idMoeda, setIdMoeda] = useState('btc-bitcoin');
  const [textoBusca, setTextoBusca] = useState('');
  
  const [infoMoeda, setInfoMoeda] = useState(null);
  const [cotacaoMoeda, setCotacaoMoeda] = useState(null);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valor || 0);
  };
  
  const formatarNumero = (valor) => {
    return new Intl.NumberFormat('en-US').format(valor || 0);
  };

  const buscarDadosMoeda = async (id = idMoeda) => {
    setCarregando(true);
    try {
      const idFormatado = id.toLowerCase();
      
      const [respostaInfo, respostaCotacao] = await Promise.all([
        fetch(`https://api.coinpaprika.com/v1/coins/${idFormatado}`),
        fetch(`https://api.coinpaprika.com/v1/tickers/${idFormatado}`)
      ]);

      if (!respostaInfo.ok || !respostaCotacao.ok) {
        throw new Error('Moeda não encontrada.');
      }

      const dadosInfo = await respostaInfo.json();
      const dadosCotacao = await respostaCotacao.json();

      setInfoMoeda(dadosInfo);
      setCotacaoMoeda(dadosCotacao);
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useEffect(() => {
    buscarDadosMoeda();
  }, []);

  const aoAtualizar = useCallback(() => {
    setAtualizando(true);
    buscarDadosMoeda(idMoeda);
  }, [idMoeda]);

  const lidarComBusca = () => {
    if (textoBusca.trim() === '') return;
    setIdMoeda(textoBusca);
    buscarDadosMoeda(textoBusca);
  };

  if (carregando && !atualizando) {
    return (
      <View style={styles.containerCentral}>
        <ActivityIndicator size="large" color="#f7931a" />
        <Text style={styles.textoCarregando}>Buscando dados na Blockchain...</Text>
      </View>
    );
  }

  const variacao24h = cotacaoMoeda?.quotes?.USD?.percent_change_24h || 0;
  const ehPositivo = variacao24h >= 0;

  return (
    <SafeAreaView style={styles.containerSeguro}>
  
      <BarraDePesquisa 
        valor={textoBusca} 
        aoMudarTexto={setTextoBusca} 
        aoPesquisar={lidarComBusca} 
      />

      <ScrollView
        contentContainerStyle={styles.containerRolagem}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} tintColor="#f7931a" />
        }
      >
        {infoMoeda && cotacaoMoeda && (
          <>
            <View style={styles.cabecalho}>
              <Image source={{ uri: infoMoeda.logo }} style={styles.logo} />
              <Text style={styles.titulo}>{infoMoeda.name} ({infoMoeda.symbol})</Text>
              <Text style={styles.rank}>Rank: #{cotacaoMoeda.rank}</Text>
            </View>

            <View style={styles.cartao}>
              <Text style={styles.tituloSecao}>Mercado (USD)</Text>
              
              <View style={styles.containerPreco}>
                <Text style={styles.textoPreco}>
                  {formatarMoeda(cotacaoMoeda.quotes.USD.price)}
                </Text>
                <Text style={[styles.textoPercentual, ehPositivo ? styles.textoVerde : styles.textoVermelho]}>
                  {ehPositivo ? '▲' : '▼'} {Math.abs(variacao24h)}%
                </Text>
              </View>

              <View style={styles.divisor} />

              <View style={styles.linhaInfo}>
                <Text style={styles.rotulo}>Volume (24h):</Text>
                <Text style={styles.valor}>{formatarMoeda(cotacaoMoeda.quotes.USD.volume_24h)}</Text>
              </View>
              <View style={styles.linhaInfo}>
                <Text style={styles.rotulo}>Cap. de Mercado:</Text>
                <Text style={styles.valor}>{formatarMoeda(cotacaoMoeda.quotes.USD.market_cap)}</Text>
              </View>
              <View style={styles.linhaInfo}>
                <Text style={styles.rotulo}>Fornecimento Total:</Text>
                <Text style={styles.valor}>{formatarNumero(cotacaoMoeda.total_supply)} {infoMoeda.symbol}</Text>
              </View>
              <View style={styles.linhaInfo}>
                <Text style={styles.rotulo}>Fornecimento Máx:</Text>
                <Text style={styles.valor}>{cotacaoMoeda.max_supply ? formatarNumero(cotacaoMoeda.max_supply) : 'Ilimitado'}</Text>
              </View>
            </View>

            <View style={styles.cartao}>
              <Text style={styles.tituloSecao}>Sobre</Text>
              <Text style={styles.descricao}>
                {infoMoeda.description ? infoMoeda.description : 'Nenhuma descrição disponível.'}
              </Text>
              
              <View style={styles.linhaInfo}>
                <Text style={styles.rotulo}>Algoritmo:</Text>
                <Text style={styles.valor}>{infoMoeda.hash_algorithm || 'N/A'}</Text>
              </View>
              <View style={styles.linhaInfo}>
                <Text style={styles.rotulo}>Código Aberto:</Text>
                <Text style={styles.valor}>{infoMoeda.open_source ? 'Sim' : 'Não'}</Text>
              </View>
            </View>

            {infoMoeda.tags && (
              <>
                <Text style={styles.tituloListaSecao}>Tags Relacionadas</Text>
                <FlatList
                  data={infoMoeda.tags}
                  keyExtractor={(item) => item.id}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View style={styles.itemTag}>
                      <Text style={styles.textoTag}>{item.name}</Text>
                    </View>
                  )}
                  style={styles.listaTags}
                />
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerSeguro: { 
    flex: 1,
    backgroundColor: '#121212'},
  containerCentral: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#121212' },
  textoCarregando: { 
    color: '#fff', 
    marginTop: 10 },
  containerRolagem: { 
    padding: 20 },
  cabecalho: { 
    alignItems: 'center', 
    marginBottom: 25 },
  logo: { 
    width: 80, 
    height: 80, 
    marginBottom: 10, 
    borderRadius: 40 },
  titulo: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#fff' },
  rank: { 
    fontSize: 18, 
    color: '#f7931a', 
    fontWeight: '600' },
  cartao: { 
    backgroundColor: '#1e1e1e', 
    borderRadius: 15, 
    padding: 20, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  tituloSecao: { 
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f7931a',
    marginBottom: 15 },
  containerPreco: { 
    flexDirection: 'row',
    alignItems: 'flex-end', 
    marginBottom: 15 },
  textoPreco: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginRight: 10 },
  textoPercentual: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 5 },
  textoVerde: { 
    color: '#00e676' },
  textoVermelho: { 
    color: '#ff1744' },
  divisor: { 
    height: 1, 
    backgroundColor: '#333', 
    marginBottom: 15 },
  descricao: { 
    color: '#bbb', 
    lineHeight: 22, 
    marginBottom: 20, 
    textAlign: 'justify' },
  linhaInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10 },
  rotulo: { 
    color: '#888', 
    fontWeight: '600', 
    flex: 1 },
  valor: { 
    color: '#fff', 
    flex: 1, 
    textAlign: 'right', 
    fontWeight: '500' },
  tituloListaSecao: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 12, 
    marginLeft: 5 },
  listaTags: { 
    marginBottom: 30 },
  itemTag: { 
    backgroundColor: '#2c2c2c', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#444'
  },
  textoTag: { 
    color: '#f7931a',
    fontSize: 13, 
    fontWeight: '500' },
});