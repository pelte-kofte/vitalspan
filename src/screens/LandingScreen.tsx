import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors } from '../theme';
export default function LandingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.emoji}>🌿</Text>
        <Text style={s.title}>Vitalspan</Text>
        <Text style={s.sub}>Live longer. Live better.</Text>
        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Onboarding')}>
          <Text style={s.btnTxt}>Get started</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Main')}>
          <Text style={s.ghost}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:Colors.bg},
  center:{flex:1,alignItems:'center',justifyContent:'center',padding:32},
  emoji:{fontSize:48,marginBottom:16},
  title:{fontSize:36,fontWeight:'300',color:Colors.textPrimary,marginBottom:8},
  sub:{fontSize:16,color:Colors.textMuted,marginBottom:32},
  btn:{backgroundColor:Colors.primary,borderRadius:14,paddingHorizontal:28,paddingVertical:14},
  btnTxt:{color:'#E1F5EE',fontSize:16,fontWeight:'500'},
  ghost:{color:Colors.textMuted,fontSize:14,marginTop:16},
});
