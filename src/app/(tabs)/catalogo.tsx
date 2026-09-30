// src/app/(tabs)/catalogo.tsx
// Catálogo de Cursos conectado a useCatalogoController y getCatalogoStyles (Clean Architecture)

import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TarjetaProducto } from '@/components/TarjetaProducto';
import { useCatalogoController } from '@/controllers/useCatalogoController';
import { getCatalogoStyles } from '@/styles/catalogo.styles';

export default function CatalogScreen() {
  const {
    isDarkMode,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredCursos,
    toggleTheme,
    categorias,
  } = useCatalogoController();

  const styles = getCatalogoStyles(isDarkMode);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Cabecera con selector de tema */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Code Andes</Text>
          <Text style={styles.headerSubtitle}>Catálogo de Especializaciones 2026</Text>
        </View>

        <TouchableOpacity
          style={styles.themeToggle}
          onPress={toggleTheme}
          activeOpacity={0.8}
        >
          <Text style={styles.themeToggleText}>
            {isDarkMode ? '☀️ Claro' : '🌙 Oscuro'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Buscador reactivo */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar curso, tecnología o docente..."
          placeholderTextColor={isDarkMode ? '#71717A' : '#94A3B8'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filtros por categoría (Pills horizontales) */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categorias.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryPill,
                  isActive ? styles.categoryPillActive : styles.categoryPillInactive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isActive
                      ? styles.categoryPillTextActive
                      : styles.categoryPillTextInactive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Listado dinámico de cursos con FlatList optimizada */}
      <FlatList
        data={filteredCursos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TarjetaProducto curso={item} isDarkMode={isDarkMode} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No se encontraron cursos que coincidan con "{searchQuery}"
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
