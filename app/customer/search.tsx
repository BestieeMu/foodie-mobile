import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search as SearchIcon,
  TrendingUp,
  ChefHat,
  X as XIcon,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Restaurant } from "@/types";
import { apiService } from "@/services/api";
import { RestaurantCard } from "@/components/RestaurantCard";

const NIGERIAN_FOOD_CATEGORIES = [
  { id: "rice", name: "Rice & Grains", emoji: "🍚", color: "#FFB84D" },
  { id: "swallow", name: "Swallow & Soup", emoji: "🥘", color: "#8B4513" },
  { id: "proteins", name: "Proteins & Grills", emoji: "🍖", color: "#E74C3C" },
  { id: "party", name: "Party Packs", emoji: "🎉", color: "#9B59B6" },
  { id: "sides", name: "Sides & Extras", emoji: "🍌", color: "#27AE60" },
  { id: "drinks", name: "Drinks & Beverages", emoji: "🥤", color: "#3498DB" },
];

const POPULAR_SEARCHES = [
  "Jollof Rice",
  "Egusi Soup",
  "Suya",
  "Amala",
  "Pepper Soup",
  "Pounded Yam",
  "Fried Rice",
  "Party Jollof",
  "Asun",
  "Ofada Rice",
  "Efo Riro",
  "Moin Moin",
];

const TRENDING_DISHES = [
  { emoji: "🍛", name: "Jollof Rice", query: "jollof", tag: "Most Ordered" },
  { emoji: "🥘", name: "Egusi Soup", query: "egusi", tag: "Popular" },
  { emoji: "🍖", name: "Suya", query: "suya", tag: "Late Night" },
  { emoji: "🌶️", name: "Pepper Soup", query: "pepper", tag: "Spicy" },
  { emoji: "🍚", name: "Fried Rice", query: "fried rice", tag: "Quick" },
  { emoji: "🫘", name: "Moin Moin", query: "moin", tag: "Breakfast" },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Restaurant[]>([]);
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const data = await apiService.restaurants.getAll();
      setRecommendations(data.slice(0, 3));
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    }
  };

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    try {
      const data = await apiService.restaurants.search(text);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleQuickSearch = (searchText: string) => {
    setQuery(searchText);
    handleSearch(searchText);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSelectedCategory(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.searchContainer}>
          <SearchIcon size={20} color="#718096" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search Nigerian dishes, restaurants..."
            placeholderTextColor="#A0AEC0"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <XIcon size={18} color="#718096" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.length === 0 && !selectedCategory ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ChefHat size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Nigerian Food Categories</Text>
            </View>
            <View style={styles.categoriesGrid}>
              {NIGERIAN_FOOD_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { borderColor: category.color }]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Trending Now</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingContainer}
            >
              {TRENDING_DISHES.map((dish) => (
                <TouchableOpacity
                  key={dish.name}
                  style={styles.trendingCard}
                  onPress={() => handleQuickSearch(dish.query)}
                >
                  <View style={styles.trendingBadge}>
                    <Text style={styles.trendingBadgeText}>{dish.tag}</Text>
                  </View>
                  <Text style={styles.trendingEmoji}>{dish.emoji}</Text>
                  <Text style={styles.trendingName}>{dish.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SearchIcon size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Popular Searches</Text>
            </View>
            <View style={styles.chipsContainer}>
              {POPULAR_SEARCHES.map((search) => (
                <TouchableOpacity
                  key={search}
                  style={styles.chip}
                  onPress={() => handleQuickSearch(search.toLowerCase())}
                >
                  <Text style={styles.chipText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ChefHat size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Top Rated Near You</Text>
            </View>
            <View style={styles.restaurantList}>
              {recommendations.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onPress={() =>
                    router.push(`/customer/restaurant/${restaurant.id}` as any)
                  }
                />
              ))}
            </View>
          </View>
        </ScrollView>
      ) : selectedCategory ? (
        <View style={styles.categoryResults}>
          <View style={styles.categoryHeader}>
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.categoryTitle}>
              {
                NIGERIAN_FOOD_CATEGORIES.find((c) => c.id === selectedCategory)
                  ?.name
              }
            </Text>
          </View>
          <FlatList
            data={recommendations}
            renderItem={({ item }) => (
              <RestaurantCard
                restaurant={item}
                onPress={() =>
                  router.push(`/customer/restaurant/${item.id}` as any)
                }
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() =>
                router.push(`/customer/restaurant/${item.id}` as any)
              }
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No results found for &ldquo;{query}&rdquo;
              </Text>
              <Text style={styles.emptySubtext}>
                Try searching for Jollof, Suya, or Amala
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#1A202C",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A202C",
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  restaurantList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1A202C",
  },
  trendingContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#1A202C",
    textAlign: "center",
  },
  trendingCard: {
    width: 130,
    height: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  trendingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendingBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  trendingEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  trendingName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#1A202C",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  categoryResults: {
    flex: 1,
  },
  categoryHeader: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    gap: 12,
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FF6B35",
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#1A202C",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2D3748",
  },
  list: {
    padding: 20,
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A202C",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#718096",
  },
});
