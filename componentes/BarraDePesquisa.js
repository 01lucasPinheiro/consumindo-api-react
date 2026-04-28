import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function BarraDePesquisa({ valor, aoMudarTexto, aoPesquisar }) {
  return (
    <View style={styles.containerPesquisa}>
      <TextInput
        style={styles.entrada}
        placeholder="Ex: eth-ethereum, sol-solana..."
        placeholderTextColor="#888"
        value={valor}
        onChangeText={aoMudarTexto}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.botaoPesquisa} onPress={aoPesquisar}>
        <Text style={styles.textoBotao}>Buscar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  containerPesquisa: { 
    flexDirection: 'row', 
    padding: 15, 
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  entrada: { 
    flex: 1, 
    backgroundColor: '#2c2c2c', 
    borderRadius: 8, 
    paddingHorizontal: 15, 
    color: '#fff',
    height: 45
  },
  botaoPesquisa: { 
    backgroundColor: '#f7931a', 
    marginLeft: 10, 
    justifyContent: 'center', 
    paddingHorizontal: 20, 
    borderRadius: 8 
  },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
});