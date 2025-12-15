// components/BarcodeScanModal.tsx
import { BarCodeScanner } from "expo-barcode-scanner";
import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
};

export default function BarcodeScanModal({ visible, onClose, onDetected }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
      setScanned(false);
    })();
  }, [visible]);

  function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    onDetected(data);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 12 }}>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <Text style={{ color: "white", fontSize: 16 }}>閉じる</Text>
          </TouchableOpacity>
          <Text style={{ color: "white", fontSize: 16, padding: 8 }}>バーコードを枠内に合わせてください</Text>
          <View style={{ width: 56 }} />
        </View>

        {hasPermission === null && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "white" }}>カメラ権限を確認中…</Text>
          </View>
        )}
        {hasPermission === false && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
            <Text style={{ color: "white", textAlign: "center" }}>
              カメラ権限がありません。設定から許可してください。
            </Text>
          </View>
        )}
        {hasPermission && (
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </Modal>
  );
}
