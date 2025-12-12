import { Pressable, Text, View } from 'react-native';

export default function AdviceCard({
  title,
  text,
  onRefresh,
}: {
  title: string;
  text: string;
  onRefresh?: () => void;
}) {
  return (
    <View style={{ gap: 8, padding: 16, borderRadius: 12, borderWidth: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>{title}</Text>
      <Text style={{ fontSize: 15, lineHeight: 22 }}>{text}</Text>
      {onRefresh && (
        <Pressable
          onPress={onRefresh}
          style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 8 }}
        >
          <Text>もう一度アドバイス</Text>
        </Pressable>
      )}
    </View>
  );
}
