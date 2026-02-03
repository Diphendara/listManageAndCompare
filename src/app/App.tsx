import React, { useState } from "react";
import { View, StyleSheet, Pressable, Text, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import { InventoryScreen } from "../screens/inventory/InventoryScreen";
import { CustomListsScreen } from "../screens/lists/CustomListsScreen";
import { ComparisonsScreen } from "../screens/comparisons/ComparisonsScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { createIndexedDBAdapter } from "../services/indexedDBStorage";
import { createStorageService } from "../services/storageService";
import { createInventoryService } from "../services/inventoryService";
import { createCustomListsService } from "../services/customListsService";

const adapter = createIndexedDBAdapter();
const storage = createStorageService(adapter, "");
const inventoryService = createInventoryService(storage);
const customListsService = createCustomListsService(storage);

type TabName = "inventory" | "lists" | "comparisons";

export default function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabName>("inventory");
  const [showSettings, setShowSettings] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataChanged = () => {
    // Trigger refresh by incrementing counter
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {/* Header with Tab Navigation and Settings Button */}
      <View style={styles.header}>
        <View style={styles.tabBar}>
          <TabButton
            title="Inventory"
            isActive={activeTab === "inventory"}
            onPress={() => setActiveTab("inventory")}
          />
          <TabButton
            title="Lists"
            isActive={activeTab === "lists"}
            onPress={() => setActiveTab("lists")}
          />
          <TabButton
            title="Comparisons"
            isActive={activeTab === "comparisons"}
            onPress={() => setActiveTab("comparisons")}
          />
        </View>
        <Pressable
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "inventory" && (
          <InventoryScreen 
            inventoryService={inventoryService}
            refreshTrigger={refreshTrigger}
          />
        )}
        {activeTab === "lists" && (
          <CustomListsScreen 
            customListsService={customListsService}
            refreshTrigger={refreshTrigger}
          />
        )}
        {activeTab === "comparisons" && (
          <ComparisonsScreen
            inventoryService={inventoryService}
            customListsService={customListsService}
            refreshTrigger={refreshTrigger}
          />
        )}
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.settingsContainer}>
          <SettingsScreen
            storageService={storage}
            inventoryService={inventoryService}
            onClose={() => setShowSettings(false)}
            onDataChanged={handleDataChanged}
          />
        </View>
      </Modal>
    </View>
  );
}

interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ title, isActive, onPress }: TabButtonProps): React.JSX.Element {
  return (
    <Pressable
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  tabBar: {
    flex: 1,
    flexDirection: "row",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#2196f3",
  },
  tabButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: "#2196f3",
    fontWeight: "bold",
  },
  settingsButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsIcon: {
    fontSize: 24,
  },
  settingsContainer: {
    flex: 1,
    marginTop: 40,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
});
