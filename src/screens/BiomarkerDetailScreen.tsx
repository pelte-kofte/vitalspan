import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../theme';
export default function BiomarkerDetailScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.emoji}>📊</Text>
        <Text style={s.title}>Biomarker Detail</Text>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:Colors.bg},
  center:{flex:1,alignItems:'center',justifyContent:'center'},
  emoji:{fontSize:48,marginBottom:16},
  title:{fontSize:24,fontWeight:'500',color:Colors.textPrimary},
});
