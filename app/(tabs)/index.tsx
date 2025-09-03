import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  DEFAULT_TARGETS,
  TIME_BANDS,
  calcDailyScore,
  deleteMealById,
  fetchMeals,
  initDb,
  todayStr,
  type BandId,
  type Meal, type Totals
} from "../../lib/core";

const BandChip = ({ band }: { band: BandId }) => {
  const label = TIME_BANDS.find(b => b.id === band)?.label ?? band;
  const warn = band === "late_night";
  return (
    <View style={[styles.chip, warn && styles.chipWarn]}>
      <Text style={[styles.chipText, warn && styles.chipTextWarn]}>{label}</Text>
    </View>
  );
};

export default function HomeScreen() {
  const [date] = useState(todayStr());
  const [meals, setMeals] = useState<Meal[]>([]);
  useEffect(()=>{ initDb(); },[]);
  useFocusEffect(React.useCallback(()=>{ fetchMeals(date).then(setMeals).catch(console.warn); },[date]));

  const totals: Totals = useMemo(()=>meals.reduce((a,m)=>({
    p:a.p+(m.p||0), f:a.f+(m.f||0), c:a.c+(m.c||0),
    fiber:a.fiber+(m.fiber||0), sodium:a.sodium+(m.sodium||0),
  }),{p:0,f:0,c:0,fiber:0,sodium:0}),[meals]);

  const score = useMemo(()=>calcDailyScore(totals, DEFAULT_TARGETS),[totals]);

  return (
    <View style={{ flex:1, backgroundColor:"#fff", padding:16 }}>
      <Text style={styles.title}>日付：{date}</Text>
      <Text style={styles.score}>本日のスコア：{score} 点</Text>
      <Text style={styles.sub}>
        P {totals.p.toFixed(1)}g / F {totals.f.toFixed(1)}g / C {totals.c.toFixed(1)}g /
        食物繊維 {totals.fiber.toFixed(1)}g / 塩分 {totals.sodium.toFixed(1)}g
      </Text>

      <View style={styles.bandRow}>
        {TIME_BANDS.map(b=>{
          const hit = meals.some(m=>m.band=== (b.id as BandId));
          return (
            <View key={b.id} style={[styles.bandBox, hit && styles.bandHit]}>
              <Text style={[styles.bandLabel, b.id==="late_night" && styles.warnText]}>{b.label}</Text>
              <Text style={[styles.bandMark, hit?styles.markHit:styles.markNone]}>{hit?"✔︎":"・"}</Text>
            </View>
          );
        })}
      </View>

      <FlatList
        data={meals}
        keyExtractor={i=>String(i.id)}
        contentContainerStyle={{ paddingBottom:24 }}
        renderItem={({item})=>(
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <BandChip band={item.band} />
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.name}>{item.name || "(名称なし)"}</Text>
            <Text style={styles.kv}>
              kcal {item.kcal || 0} ／ P {item.p || 0}g ／ F {item.f || 0}g ／ C {item.c || 0}g ／
              繊維 {item.fiber || 0}g ／ 塩分 {item.sodium || 0}g
            </Text>
            <TouchableOpacity style={styles.delBtn} onPress={()=>deleteMealById(item.id!).then(()=>fetchMeals(date).then(setMeals))}>
              <Text style={styles.delText}>削除</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{textAlign:"center",color:"#777",marginTop:16}}>未登録です</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title:{ fontSize:18, fontWeight:"bold", marginBottom:4 },
  score:{ fontSize:22, fontWeight:"bold", color:"#0ea5e9" },
  sub:{ marginTop:4, color:"#555" },
  bandRow:{ flexDirection:"row", flexWrap:"wrap", gap:8, marginVertical:8 },
  bandBox:{ borderWidth:1, borderColor:"#ddd", paddingHorizontal:10, paddingVertical:6, borderRadius:8 },
  bandHit:{ borderColor:"#0ea5e9", backgroundColor:"#e6f6fd" },
  bandLabel:{ fontSize:12 }, warnText:{ color:"#d97706" },
  bandMark:{ textAlign:"center", fontSize:12 }, markHit:{ color:"#0ea5e9", fontWeight:"bold" }, markNone:{ color:"#bbb" },
  card:{ borderWidth:1, borderColor:"#eee", borderRadius:12, padding:12, marginTop:10, backgroundColor:"#fff" },
  cardHead:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  chip:{ paddingHorizontal:10, paddingVertical:4, borderRadius:999, backgroundColor:"#e6f6fd" },
  chipWarn:{ backgroundColor:"#fff7ed", borderWidth:1, borderColor:"#fed7aa" },
  chipText:{ color:"#0ea5e9", fontWeight:"bold" }, chipTextWarn:{ color:"#d97706" },
  time:{ color:"#666", fontSize:12 }, name:{ marginTop:6, fontSize:16, fontWeight:"600" },
  kv:{ marginTop:6, color:"#444" },
  delBtn:{ alignSelf:"flex-end", marginTop:8, paddingHorizontal:10, paddingVertical:6, borderRadius:8, backgroundColor:"#fee2e2" },
  delText:{ color:"#b91c1c", fontWeight:"bold" },
});
