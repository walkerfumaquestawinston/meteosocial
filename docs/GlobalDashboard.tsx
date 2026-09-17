// React Native presentation component for the future native client.
// The deployed app remains the existing web client. No native build is claimed.
import React from 'react';
import {FlatList, Image, Pressable, StyleSheet, Text, View} from 'react-native';

type Story={id:string;author:string;caption:string;imageUrl?:string;translation?:string};
type Props={
 city:string;
 labels:{radar:string;risk:string;unknown:string;stories:string;more:string};
 risk:null|{score:number;period:string;source:string};
 radar:React.ReactNode;
 stories:Story[];
 loading:boolean;
 hasMore:boolean;
 onMore:()=>void;
 onRefresh:()=>void;
};
export function GlobalDashboard(p:Props){
 return <FlatList
   data={p.stories}
   keyExtractor={item=>item.id}
   style={styles.screen}
   contentContainerStyle={styles.content}
   refreshing={p.loading}
   onRefresh={p.onRefresh}
   onEndReached={()=>{if(p.hasMore&&!p.loading)p.onMore()}}
   onEndReachedThreshold={0.4}
   initialNumToRender={3}
   windowSize={5}
   ListHeaderComponent={<>
     <Text accessibilityRole="header" style={styles.title}>{p.city}</Text>
     <View style={styles.card}>
       <Text style={styles.label}>{p.labels.radar}</Text>
       {p.radar}
     </View>
     <View style={styles.card}>
       <Text style={styles.label}>{p.labels.risk}</Text>
       <Text style={styles.score}>{p.risk?`${p.risk.score} / 100`:'—'}</Text>
       <Text style={styles.text}>{p.risk?`${p.risk.period} · ${p.risk.source}`:p.labels.unknown}</Text>
     </View>
     <Text accessibilityRole="header" style={styles.title}>{p.labels.stories}</Text>
   </>}
   renderItem={({item})=><View style={styles.card}>
     {item.imageUrl&&<Image source={{uri:item.imageUrl}} style={styles.image} accessibilityLabel={item.caption}/>}
     <Text style={styles.label}>{item.author}</Text>
     <Text style={styles.text}>{item.caption}</Text>
     {item.translation&&<Text style={styles.translation}>{item.translation}</Text>}
   </View>}
   ListFooterComponent={p.hasMore?<Pressable accessibilityRole="button" disabled={p.loading} onPress={p.onMore} style={styles.button}><Text>{p.labels.more}</Text></Pressable>:null}
 />;
}
const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:'#0A192F'},
 content:{padding:20,paddingBottom:48},
 title:{fontSize:28,fontWeight:'800',color:'#FFFFFF',marginVertical:16},
 card:{backgroundColor:'#10243B',borderRadius:24,borderColor:'#29405E',borderWidth:1,padding:20,marginBottom:18},
 label:{color:'#63DFFF',fontSize:16,fontWeight:'700',marginBottom:12},
 score:{color:'#FFFFFF',fontSize:40,fontWeight:'800'},
 text:{color:'#FFFFFF',fontSize:17,lineHeight:25},
 translation:{color:'#BDDDF4',fontSize:17,lineHeight:25,marginTop:16},
 image:{width:'100%',aspectRatio:4/5,borderRadius:16,marginBottom:18},
 button:{backgroundColor:'#42D9FF',minHeight:48,alignItems:'center',justifyContent:'center',borderRadius:16}
});
