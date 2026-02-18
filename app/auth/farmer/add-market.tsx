import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../../context/AuthContext";
import { commonAPI, farmerMarketplaceAPI } from "../../../services/api";

type Crop = { _id?: string; id?: string; name: string };
type Market = { _id?: string; id?: string; marketName: string };

export default function AddMarket() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);

  const [selectedCropId, setSelectedCropId] = useState("");
  const [selectedMarketId, setSelectedMarketId] = useState("");

  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");

  const [village, setVillage] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Maharashtra");
  const country = "India";

  const [photoUrl, setPhotoUrl] = useState("");
  const [publicId, setPublicId] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setUserId(user?.id || "");

      const [cropRes, marketRes] = await Promise.all([
        commonAPI.getAllCrops(),
        commonAPI.getAllMarkets(),
      ]);

      setCrops(cropRes.data || []);
      setMarkets(marketRes.data || []);
    } catch (error: any) {
      if (error.response?.status === 401) await logout();
      Alert.alert("Error", "Failed to load crops or markets");
    }
  };

  /* ---------- IMAGE PICKER ---------- */
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo access to continue");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();

      formData.append("file", {
        uri,
        name: "listing.jpg",
        type: "image/jpeg",
      } as any);

      const res = await farmerMarketplaceAPI.uploadImage(formData);

      setPhotoUrl(res.data?.url || "");
      setPublicId(res.data?.public_id || "");
    } catch (error: any) {
      if (error.response?.status === 401) await logout();
      Alert.alert("Error", "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ---------- DELETE IMAGE ---------- */
  const deleteImage = async () => {
    if (!publicId) return;

    try {
      await farmerMarketplaceAPI.deleteImage(publicId);
      setPhotoUrl("");
      setPublicId("");
      Alert.alert("Success", "Image deleted successfully");
    } catch (error: any) {
      if (error.response?.status === 401) await logout();
      Alert.alert("Error", "Failed to delete image");
    }
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    if (!selectedCropId) return Alert.alert("Missing", "Please select a crop");
    if (!quantity || isNaN(Number(quantity)))
      return Alert.alert("Missing", "Enter valid quantity");
    if (!price || isNaN(Number(price)))
      return Alert.alert("Missing", "Enter valid price");

    try {
      setSubmitting(true);
      if (!userId) throw new Error("Not logged in");

      const payload: any = {
        farmer: { id: userId },
        crop: { id: selectedCropId },
        quantity: Number(quantity),
        unit,
        price: Number(price),
        location: {
          village,
          city,
          state: stateName,
          country,
        },
        photoUrl,
        publicId,
        status: "active",
      };

      if (selectedMarketId) {
        payload.market = { id: selectedMarketId };
      }

      await farmerMarketplaceAPI.createListing(payload);

      Alert.alert("Success", "Crop listing added");
      router.back();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await logout();
        router.replace("/auth/farmerlogin");
      } else {
        Alert.alert("Error", "Failed to add listing");
      }
    } finally {
      setSubmitting(false);
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
          style={styles.backButtonContainer}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Crop Listing</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* INFO CARD */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <Text style={styles.infoText}>
              List your crops for sale in the marketplace and connect with buyers
            </Text>
          </View>

          {/* CROP SELECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Crop *</Text>
            {crops.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {crops.map((crop) => (
                  <TouchableOpacity
                    key={crop._id || crop.id}
                    style={[
                      styles.chip,
                      selectedCropId === (crop._id || crop.id) && styles.chipSelected,
                    ]}
                    onPress={() => setSelectedCropId(crop._id || crop.id || "")}
                  >
                    <Ionicons 
                      name={selectedCropId === (crop._id || crop.id) ? "checkmark-circle" : "leaf-outline"} 
                      size={16} 
                      color={selectedCropId === (crop._id || crop.id) ? "#fff" : "#2E7D32"} 
                    />
                    <Text
                      style={[
                        styles.chipText,
                        selectedCropId === (crop._id || crop.id) && styles.chipTextSelected,
                      ]}
                    >
                      {crop.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="leaf-outline" size={32} color="#9CA3AF" />
                <Text style={styles.emptyText}>No crops available</Text>
              </View>
            )}
          </View>

          {/* MARKET SELECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Market (Optional)</Text>
            {markets.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {markets.map((market) => (
                  <TouchableOpacity
                    key={market._id || market.id}
                    style={[
                      styles.chip,
                      selectedMarketId === (market._id || market.id) && styles.chipSelected,
                    ]}
                    onPress={() => setSelectedMarketId(market._id || market.id || "")}
                  >
                    <Ionicons 
                      name={selectedMarketId === (market._id || market.id) ? "checkmark-circle" : "location-outline"} 
                      size={16} 
                      color={selectedMarketId === (market._id || market.id) ? "#fff" : "#2E7D32"} 
                    />
                    <Text
                      style={[
                        styles.chipText,
                        selectedMarketId === (market._id || market.id) && styles.chipTextSelected,
                      ]}
                    >
                      {market.marketName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="location-outline" size={32} color="#9CA3AF" />
                <Text style={styles.emptyText}>No markets available</Text>
              </View>
            )}
          </View>

          {/* QUANTITY & PRICE */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quantity & Pricing</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Quantity *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="scale-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TextInput
                    style={styles.unitInput}
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="kg"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Price per Unit *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="cash-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.inputSuffix}>₹</Text>
                </View>
              </View>
            </View>
          </View>

          {/* LOCATION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Village</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="home-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={village}
                  onChangeText={setVillage}
                  placeholder="Enter village name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="business-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>State</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="map-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    value={stateName}
                    onChangeText={setStateName}
                    placeholder="State"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Country</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Ionicons name="globe-outline" size={20} color="#9CA3AF" />
                <TextInput 
                  style={[styles.input, { color: "#9CA3AF" }]} 
                  value={country} 
                  editable={false} 
                />
              </View>
            </View>
          </View>

          {/* PHOTO UPLOAD */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Photo (Optional)</Text>
            
            {photoUrl ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUrl }} style={styles.image} />
                <TouchableOpacity
                  style={styles.deletePhotoBtn}
                  onPress={deleteImage}
                >
                  <Ionicons name="trash" size={18} color="#fff" />
                  <Text style={styles.deletePhotoText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickImage}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#2E7D32" />
                ) : (
                  <>
                    <View style={styles.uploadIconContainer}>
                      <Ionicons name="cloud-upload-outline" size={32} color="#2E7D32" />
                    </View>
                    <Text style={styles.uploadText}>Upload Photo</Text>
                    <Text style={styles.uploadSubtext}>PNG, JPG up to 5MB</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedCropId || !quantity || !price) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={submitting || !selectedCropId || !quantity || !price}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitText}>Add Listing</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  container: {
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
  chipSelected: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  chipTextSelected: {
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
    marginBottom: 12,
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
  inputDisabled: {
    backgroundColor: "#F9FAFB",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 10,
  },
  unitInput: {
    width: 50,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 10,
    textAlign: "center",
  },
  inputSuffix: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },

  row: {
    flexDirection: "row",
  },

  uploadButton: {
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
  deletePhotoBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(220, 38, 38, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deletePhotoText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
