import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useCampaignStore } from '../../stores';
import CampaignCard from '../../components/CampaignCard';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../../constants/theme';
import { CATEGORIES } from '../../data/seed';

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'most_funded', label: 'Most Funded' },
  { value: 'ending_soon', label: 'Ending Soon' },
] as const;

export default function ExploreScreen() {
  const allCampaigns = useCampaignStore((s) => s.campaigns);
  const searchQuery = useCampaignStore((s) => s.searchQuery);
  const setSearchQuery = useCampaignStore((s) => s.setSearchQuery);
  const selectedCategory = useCampaignStore((s) => s.selectedCategory);
  const setCategory = useCampaignStore((s) => s.setCategory);
  const sortBy = useCampaignStore((s) => s.sortBy);
  const setSortBy = useCampaignStore((s) => s.setSortBy);

  const campaigns = React.useMemo(() => {
    let filtered = allCampaigns.filter((c) => c.status !== 'draft');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.creatorName.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (c) =>
          c.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory ||
          c.category.toLowerCase() === selectedCategory
      );
    }
    switch (sortBy) {
      case 'newest':
        return [...filtered].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'most_funded':
        return [...filtered].sort((a, b) => b.raisedAmount - a.raisedAmount);
      case 'ending_soon':
        return [...filtered].sort((a, b) => a.daysLeft - b.daysLeft);
      default:
        return [...filtered].sort((a, b) => b.backerCount - a.backerCount);
    }
  }, [allCampaigns, searchQuery, selectedCategory, sortBy]);

  const [showSortMenu, setShowSortMenu] = useState(false);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
    },
    [setSearchQuery]
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No campaigns found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your search terms or category filter.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search campaigns..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.sortBtn, showSortMenu && styles.sortBtnActive]}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Text style={styles.sortBtnText}>⇅</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortOption, sortBy === opt.value && styles.sortOptionActive]}
              onPress={() => {
                setSortBy(opt.value);
                setShowSortMenu(false);
              }}
            >
              <Text style={[styles.sortOptionText, sortBy === opt.value && styles.sortOptionTextActive]}>
                {opt.label}
              </Text>
              {sortBy === opt.value && <Text style={styles.sortCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
            ]}
            onPress={() => setCategory(cat.id)}
          >
            <Text
              style={[
                styles.categoryText,
                { color: selectedCategory === cat.id ? Colors.textOnPrimary : Colors.text },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.sortLabel}>
          {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Sorted'}
        </Text>
      </View>

      {/* Campaign List */}
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <CampaignCard campaign={item} />
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  searchContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  clearIcon: { fontSize: 14, color: Colors.textSecondary, padding: 4 },
  sortBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortBtnActive: { backgroundColor: Colors.primary },
  sortBtnText: { fontSize: 20, color: Colors.text },

  sortMenu: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
    zIndex: 100,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sortOptionActive: { backgroundColor: Colors.primaryLight + '18' },
  sortOptionText: { fontSize: FontSizes.md, color: Colors.text },
  sortOptionTextActive: { color: Colors.primary, fontWeight: FontWeights.semibold },
  sortCheck: { color: Colors.primary, fontWeight: FontWeights.bold },

  categoryBar: { backgroundColor: Colors.surface, maxHeight: 52 },
  categoryContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryText: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },

  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  resultsCount: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: FontWeights.medium },
  sortLabel: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: FontWeights.semibold },

  listContent: { padding: Spacing.lg, paddingTop: Spacing.sm },
  cardWrapper: { marginBottom: 0 },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.lg },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.sm },
  emptySubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },
});
