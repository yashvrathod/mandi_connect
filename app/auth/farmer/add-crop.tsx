import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { commonAPI, priceAPI } from "../../../services/api";

/* ---------- TYPES ---------- */
type Crop = { id: string; name: string; type: string; variety?: string };
type Market = { id: string; marketName: string };

/* ---------- ALERT ---------- */
const showAlert = (title: string, message: string) => {
  Platform.OS === "web"
    ? window.alert(`${title}\n${message}`)
    : Alert.alert(title, message);
};

export default function AddFarmerEntry() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  /* ---------- STATE ---------- */
  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------- MODALS ---------- */
  const [showCropModal, setShowCropModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);

  const [newCropName, setNewCropName] = useState("");
  const [newCropType, setNewCropType] = useState("");
  const [newCropVariety, setNewCropVariety] = useState("");

  const [newMarketName, setNewMarketName] = useState("");
  const [marketCity, setMarketCity] = useState("");
  const [marketState, setMarketState] = useState("");
  const [marketCountry, setMarketCountry] = useState("");

  /* ---------- LOAD ---------- */
  useEffect(() => {
    fetchCropsAndMarkets();
  }, []);

  const fetchCropsAndMarkets = async () => {
    try {
      const [cropRes, marketRes] = await Promise.all([
        commonAPI.getAllCrops(),
        commonAPI.getAllMarkets(),
      ]);

      setCrops(
        cropRes.data.map((c: any) => ({
          id: c._id || c.id,
          name: c.name,
          type: c.type,
          variety: c.variety,
        })),
      );

      setMarkets(
        marketRes.data.map((m: any) => ({
          id: m._id || m.id,
          marketName: m.marketName,
        })),
      );
    } catch {
      showAlert("Error", "Failed to load data");
    }
  };

  /* ---------- IMAGE ---------- */
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      return showAlert("Permission denied", "Allow access");

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!res.canceled) setPhoto(res.assets[0].uri);
  };

  /* ---------- ADD CROP ---------- */
  const handleAddCrop = async () => {
    if (!newCropName || !newCropType || !newCropVariety)
      return showAlert("Missing", "Fill all fields");

    try {
      const res = await commonAPI.addCrop({
        name: newCropName,
        type: newCropType,
        variety: newCropVariety,
      });

      const crop = {
        id: res.data._id || res.data.id,
        name: res.data.name,
        type: res.data.type,
        variety: res.data.variety,
      };

      setCrops((p) => [...p, crop]);
      setSelectedCrop(crop);
      setShowCropModal(false);
      setNewCropName("");
      setNewCropType("");
      setNewCropVariety("");
    } catch (error: any) {
      if (error.response?.status === 401) await logout();
      showAlert("Error", "Failed to add crop");
    }
  };

  /* ---------- ADD MARKET ---------- */
  const handleAddMarket = async () => {
    if (!newMarketName || !marketCity || !marketState || !marketCountry)
      return showAlert("Missing", "Fill all fields");

    try {
      const res = await commonAPI.addMarket({
        marketName: newMarketName,
        marketAddress: {
          city: marketCity,
          state: marketState,
          country: marketCountry,
        },
      });

      const market = {
        id: res.data._id || res.data.id,
        marketName: res.data.marketName,
      };

      setMarkets((p) => [...p, market]);
      setSelectedMarket(market);
      setShowMarketModal(false);
      setNewMarketName("");
      setMarketCity("");
      setMarketState("");
      setMarketCountry("");
    } catch {
      showAlert("Error", "Failed to add market");
    }
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    if (!selectedCrop || !selectedMarket || !price || !quantity)
      return showAlert("Missing", "Fill all required fields");

    try {
      setLoading(true);

      const payload = {
        crop: { id: selectedCrop.id },
        market: { id: selectedMarket.id },
        price: Number(price),
        quantity: `${quantity} kg`,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      await priceAPI.addPriceEntry(payload);

      showAlert("Success", "Entry added successfully");
      router.replace("/auth/farmer/farmer-dashboard");
    } catch (error: any) {
      if (error.response?.status === 401) {
        await logout();
        router.replace("/auth/farmerlogin");
      } else {
        showAlert("Error", "Failed to submit entry");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Price Entry</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* INFO CARD */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <Text style={styles.infoText}>
              Share your crop prices to help farmers get better market insights
            </Text>
          </View>

          {/* CROP SELECTION */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.sectionLabel}>Select Crop</Text>
              <TouchableOpacity 
                onPress={() => setShowCropModal(true)}
                style={styles.addButton}
              >
                <Ionicons name="add-circle" size={18} color="#2E7D32" />
                <Text style={styles.addText}>Add New</Text>
              </TouchableOpacity>
            </View>

            {crops.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {crops.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedCrop(c)}
                    style={[
                      styles.chip,
                      selectedCrop?.id === c.id && styles.chipActive,
                    ]}
                  >
                    <Ionicons 
                      name={selectedCrop?.id === c.id ? "checkmark-circle" : "leaf-outline"} 
                      size={16} 
                      color={selectedCrop?.id === c.id ? "#fff" : "#2E7D32"} 
                    />
                    <Text style={[
                      styles.chipText,
                      selectedCrop?.id === c.id && styles.chipTextActive
                    ]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="leaf-outline" size={32} color="#9CA3AF" />
                <Text style={styles.emptyText}>No crops available. Add one!</Text>
              </View>
            )}
          </View>

          {/* MARKET SELECTION */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.sectionLabel}>Select Market</Text>
              <TouchableOpacity 
                onPress={() => setShowMarketModal(true)}
                style={styles.addButton}
              >
                <Ionicons name="add-circle" size={18} color="#2E7D32" />
                <Text style={styles.addText}>Add New</Text>
              </TouchableOpacity>
            </View>

            {markets.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {markets.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setSelectedMarket(m)}
                    style={[
                      styles.chip,
                      selectedMarket?.id === m.id && styles.chipActive,
                    ]}
                  >
                    <Ionicons 
                      name={selectedMarket?.id === m.id ? "checkmark-circle" : "location-outline"} 
                      size={16} 
                      color={selectedMarket?.id === m.id ? "#fff" : "#2E7D32"} 
                    />
                    <Text style={[
                      styles.chipText,
                      selectedMarket?.id === m.id && styles.chipTextActive
                    ]}>
                      {m.marketName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="location-outline" size={32} color="#9CA3AF" />
                <Text style={styles.emptyText}>No markets available. Add one!</Text>
              </View>
            )}
          </View>

          {/* PRICE & QUANTITY */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Price Details</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Price per kg</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="cash-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.inputSuffix}>₹</Text>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="scale-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.inputSuffix}>kg</Text>
                </View>
              </View>
            </View>
          </View>

          {/* PHOTO UPLOAD */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Photo (Optional)</Text>
            
            {photo ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photo }} style={styles.image} />
                <TouchableOpacity 
                  onPress={pickImage} 
                  style={styles.changePhotoBtn}
                >
                  <Ionicons name="camera" size={18} color="#fff" />
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={pickImage} style={styles.uploadBtn}>
                <View style={styles.uploadIconContainer}>
                  <Ionicons name="cloud-upload-outline" size={32} color="#2E7D32" />
                </View>
                <Text style={styles.uploadText}>Upload Photo</Text>
                <Text style={styles.uploadSubtext}>PNG, JPG up to 5MB</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!selectedCrop || !selectedMarket || !price || !quantity) && styles.submitBtnDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading || !selectedCrop || !selectedMarket || !price || !quantity}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitText}>Submit Price Entry</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------- CROP MODAL ---------- */}
      <Modal visible={showCropModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="leaf" size={24} color="#2E7D32" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Add New Crop</Text>
                  <Text style={styles.modalSubtitle}>Enter crop details</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowCropModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Crop Name *</Text>
                  <View style={styles.modalInputWrapper}>
                    <Ionicons name="text-outline" size={20} color="#6B7280" />
                    <TextInput
                      placeholder="e.g., Wheat, Rice"
                      style={styles.modalInput}
                      value={newCropName}
                      onChangeText={setNewCropName}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Crop Type *</Text>
                  <View style={styles.modalInputWrapper}>
                    <Ionicons name="pricetag-outline" size={20} color="#6B7280" />
                    <TextInput
                      placeholder="e.g., Cereal, Vegetable"
                      style={styles.modalInput}
                      value={newCropType}
                      onChangeText={setNewCropType}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Variety *</Text>
                  <View style={styles.modalInputWrapper}>
                    <Ionicons name="flower-outline" size={20} color="#6B7280" />
                    <TextInput
                      placeholder="e.g., Basmati, Hybrid"
                      style={styles.modalInput}
                      value={newCropVariety}
                      onChangeText={setNewCropVariety}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity 
                style={[
                  styles.modalSubmitBtn,
                  (!newCropName || !newCropType || !newCropVariety) && styles.modalSubmitBtnDisabled
                ]}
                onPress={handleAddCrop}
                disabled={!newCropName || !newCropType || !newCropVariety}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.modalSubmitText}>Save Crop</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ---------- MARKET MODAL ---------- */}
      <Modal visible={showMarketModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="location" size={24} color="#2E7D32" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Add New Market</Text>
                  <Text style={styles.modalSubtitle}>Enter market location details</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowMarketModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Market Name *</Text>
                  <View style={styles.modalInputWrapper}>
                    <Ionicons name="storefront-outline" size={20} color="#6B7280" />
                    <TextInput
                      placeholder="e.g., City Market"
                      style={styles.modalInput}
                      value={newMarketName}
                      onChangeText={setNewMarketName}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>City *</Text>
                  <View style={styles.modalInputWrapper}>
                    <Ionicons name="business-outline" size={20} color="#6B7280" />
                    <TextInput
                      placeholder="e.g., Mumbai"
                      style={styles.modalInput}
                      value={marketCity}
                      onChangeText={setMarketCity}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>State *</Text>
                  <View style={styles.modalInputWrapper}>
                    <Ionicons name="map-outline" size={20} color="#6B7280" />
                    <TextInput
                      placeholder="e.g., Maharashtra"
                      style={styles.modalInput}
                      value={marketState}
                      onChangeText={setMarketState}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Country *</Text>
                  <View style={styles.modalInputWrapper}>
                    <Ionicons name="globe-outline" size={20} color="#6B7280" />
                    <TextInput
                      placeholder="e.g., India"
                      style={styles.modalInput}
                      value={marketCountry}
                      onChangeText={setMarketCountry}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity 
                style={[
                  styles.modalSubmitBtn,
                  (!newMarketName || !marketCity || !marketState || !marketCountry) && styles.modalSubmitBtnDisabled
                ]}
                onPress={handleAddMarket}
                disabled={!newMarketName || !marketCity || !marketState || !marketCountry}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.modalSubmitText}>Save Market</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: "#F9FAFB" 
  },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  scroll: {
    padding: 16,
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },

  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 14,
  },

  chipsContainer: {
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  chipTextActive: {
    color: "#fff",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },

  inputGroup: {
    gap: 12,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 10,
  },
  inputSuffix: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },

  uploadBtn: {
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#86EFAC",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: "center",
    gap: 8,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
  },
  uploadSubtext: {
    fontSize: 13,
    color: "#6B7280",
  },

  photoPreview: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  changePhotoBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  changePhotoText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  modalInputContainer: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  modalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 10,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 10,
  },

  modalSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  modalSubmitBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  modalSubmitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
