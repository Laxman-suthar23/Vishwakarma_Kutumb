import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { COLORS } from '@constants/colors';

// ─── Select Types ─────────────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string | number;
  emoji?: string;
  subtitle?: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string | number | null;
  options: SelectOption[];
  onChange: (value: string | number) => void;
  required?: boolean;
  searchable?: boolean;
  error?: string;
}

// ─── Select Component ─────────────────────────────────────────────────────────

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onChange,
  required = false,
  searchable = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = searchable
    ? options.filter((o) =>
        o.label.toLowerCase().includes(searchText.toLowerCase())
      )
    : options;

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchText('');
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Trigger */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={[styles.trigger, error ? styles.triggerError : null]}
        activeOpacity={0.8}
      >
        <View style={styles.triggerContent}>
          {selectedOption?.emoji && (
            <Text style={styles.selectedEmoji}>{selectedOption.emoji}</Text>
          )}
          <Text
            style={[
              styles.triggerText,
              !selectedOption && styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {selectedOption?.label ?? placeholder}
          </Text>
        </View>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal Picker */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        />

        <View style={styles.sheet}>
          {/* Sheet Handle */}
          <View style={styles.sheetHandle} />

          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label ?? 'Select Option'}</Text>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Text style={styles.sheetClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search (if searchable) */}
          {searchable && (
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                placeholder="Search..."
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
                placeholderTextColor={COLORS.sandal[400]}
                autoFocus
              />
            </View>
          )}

          {/* Options list */}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => String(item.value)}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={[
                  styles.option,
                  item.value === value && styles.optionSelected,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  {item.emoji && (
                    <Text style={styles.optionEmoji}>{item.emoji}</Text>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.optionLabel,
                        item.value === value && styles.optionLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.subtitle && (
                      <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                </View>
                {item.value === value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptySearch}>
                <Text style={styles.emptySearchText}>No options found</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        </View>
      </Modal>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.maroon[800],
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  required: {
    color: COLORS.saffron[500],
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEFDF8',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.cream[300],
    paddingHorizontal: 14,
    paddingVertical: 13,
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  triggerError: {
    borderColor: COLORS.error,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectedEmoji: {
    fontSize: 16,
  },
  triggerText: {
    fontSize: 15,
    color: COLORS.maroon[900],
    fontWeight: '400',
    flex: 1,
  },
  placeholderText: {
    color: COLORS.sandal[400],
  },
  chevron: {
    fontSize: 10,
    color: COLORS.gold[500],
    fontWeight: '700',
    marginLeft: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#FEFDF8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.cream[300],
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cream[200],
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.maroon[900],
  },
  sheetClose: {
    fontSize: 18,
    color: COLORS.sandal[400],
    fontWeight: '700',
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 12,
    backgroundColor: COLORS.cream[100],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.cream[300],
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.maroon[900],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionSelected: {
    backgroundColor: `${COLORS.gold[100]}80`,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionEmoji: {
    fontSize: 20,
  },
  optionLabel: {
    fontSize: 15,
    color: COLORS.maroon[800],
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: COLORS.maroon[900],
    fontWeight: '700',
  },
  optionSubtitle: {
    fontSize: 12,
    color: COLORS.sandal[400],
    marginTop: 2,
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.gold[600],
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.cream[200],
    marginHorizontal: 20,
  },
  emptySearch: {
    padding: 32,
    alignItems: 'center',
  },
  emptySearchText: {
    color: COLORS.sandal[400],
    fontSize: 14,
  },
});

export default Select;
