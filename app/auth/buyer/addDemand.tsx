import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Buffer } from "buffer";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { BuyerBanner } from "../../ui/components";

const BASE_URL = "https://mandiconnect.onrender.com";

/* ---------- TYPES ---------- */
type Crop = {
  id: string;
  name: string;
  type: string;
};

/* ---------- JWT decoder (Expo-safe) ---------- */
const decodeJwt = (token: string) => {
  const payload = token.split(".")[1];
  const decoded = Buffer.from(payload, "base64").toString("utf8");
  return JSON.parse(decoded);
};

export default function AddDemand() {
  const insets = useSafeAreaInsets();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [market, setMarket] = useState("");

  const [loading, setLoading] = useState(false);

  const [showAddCrop, setShowAddCrop] = useState(false);
  const [cropName, setCropName] = useState("");
  const [cropType, setCropType] = useState("");
  const [cropVariety, setCropVariety] = useState("");
  const [addingCrop, setAddingCrop] = useState(false);

  useEffect(() => {
    fetchCrops();
  }, []);

  /* ---------- Fetch crops ---------- */
  const fetchCrops = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/getAllCrop`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCrops(
        res.data.map((c: any) => ({
          id: c.id || c._id,
          name: c.name,
          type: c.type,
        })),
      );
    } catch {
      Alert.alert("Failed to load crops");
    }
  };

  /* ---------- Resolve buyer id ---------- */
  const resolveBuyerId = async (): Promise<string> => {
    const stored = await AsyncStorage.getItem("buyerId");
    if (stored) return stored;

    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Missing token");

    const decoded = decodeJwt(token);
    const email = decoded.email?.toLowerCase() || decoded.sub?.toLowerCase();

    if (!email) {
      throw new Error("Email not found in token");
    }

    const res = await axios.get(`${BASE_URL}/buyer/getAll`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const buyer = res.data.find((b: any) => b.Email?.toLowerCase() === email);

    if (!buyer?.id) {
      throw new Error("Buyer not found for this account");
    }

    await AsyncStorage.setItem("buyerId", buyer.id);
    return buyer.id;
  };

  /* ---------- Submit demand ---------- */
  const handleSubmit = async () => {
    if (!selectedCrop || !quantity || !price || !market) {
      Alert.alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Missing token");

      const buyerId = await resolveBuyerId();

      await axios.post(
        `${BASE_URL}/marketplace/buyer/add`,
        {
          BuyerId: buyerId,
          CropId: selectedCrop.id,
          RequiredQuantity: { Value: Number(quantity), Unit: "kg" },
          ExpectedPrice: { Value: Number(price), Currency: "INR" },
          Market: market,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Alert.alert("Success", "Demand added successfully");
      router.replace("/auth/buyer/marketplace");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || err.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Add crop ---------- */
  const handleAddCrop = async () => {
    if (!cropName || !cropType || !cropVariety) return;

    try {
      setAddingCrop(true);
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/addCrop`,
        { name: cropName, type: cropType, variety: cropVariety },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setShowAddCrop(false);
      setCropName("");
      setCropType("");
      setCropVariety("");
      fetchCrops();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || err.message || "Failed to add crop",
      );
    } finally {
      setAddingCrop(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌾 Add Demand</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Crop Details</Text>

          <View style={styles.cropHeader}>
            <Text style={styles.label}>Select Crop</Text>
            <TouchableOpacity onPress={() => setShowAddCrop(true)}>
              <Text style={styles.addCropText}>+ Add Crop</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {crops.map((crop) => (
              <TouchableOpacity
                key={crop.id}
                onPress={() => setSelectedCrop(crop)}
                style={[
                  styles.cropChip,
                  selectedCrop?.id === crop.id && styles.cropChipActive,
                ]}
              >
                <Text
                  style={
                    selectedCrop?.id === crop.id
                      ? styles.cropChipTextActive
                      : styles.cropChipText
                  }
                >
                  {crop.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Quantity (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter quantity"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={styles.label}>Expected Price (₹)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter price"
            value={price}
            onChangeText={setPrice}
          />

          <Text style={styles.label}>Market</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter market name"
            value={market}
            onChangeText={setMarket}
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? "Submitting..." : "Submit Demand"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showAddCrop && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add New Crop</Text>

            <TextInput
              style={styles.input}
              placeholder="Crop name"
              value={cropName}
              onChangeText={setCropName}
            />
            <TextInput
              style={styles.input}
              placeholder="Type"
              value={cropType}
              onChangeText={setCropType}
            />
            <TextInput
              style={styles.input}
              placeholder="Variety"
              value={cropVariety}
              onChangeText={setCropVariety}
            />

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.submitButton, { flex: 1, marginRight: 8 }]}
                onPress={handleAddCrop}
              >
                <Text style={styles.submitText}>
                  {addingCrop ? "Saving..." : "Add"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelBtn, { flex: 1 }]}
                onPress={() => setShowAddCrop(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  scroll: {
    alignItems: "center",
    paddingVertical: 24,
  },
  card: {
    width: "92%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  label: {
    marginTop: 14,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 15,
  },
  cropHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addCropText: {
    color: "#2E7D32",
    fontWeight: "700",
  },
  cropChip: {
    marginTop: 10,
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cropChipActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  cropChipText: {
    color: "#111827",
  },
  cropChipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelBtn: {
    marginTop: 24,
    backgroundColor: "#E5E7EB",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelText: {
    color: "#374151",
    fontWeight: "700",
  },
  modalOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "88%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalRow: {
    flexDirection: "row",
    marginTop: 16,
  },
});
