import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { colors } from '../../../../Theme/colors';
import { spacing, radius } from '../../../../Theme/spacing';
import { typography } from '../../../../Theme/typography';
import { ShoppingListItemRow } from '../Components/ShoppingListItemRow';
import type { ShoppingListSectionDTO, ShoppingListViewModelDTO } from '../../ViewModel/ShoppingListViewModel';

export interface ShoppingListScreenProps extends ShoppingListViewModelDTO {
  onToggleItem: (key: string) => void;
  onClose: () => void;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildShareHtml(sections: ShoppingListSectionDTO[]) {
  const body = sections
    .map(section => {
      const items = section.items
        .map(
          item =>
            `<p>• ${escapeHtml(item.name)}${item.quantityLabel ? ` — ${escapeHtml(item.quantityLabel)}` : ''}</p>`,
        )
        .join('');
      return `<h2>${escapeHtml(section.title)}</h2>${items}`;
    })
    .join('');

  return `<html><head><meta charset="utf-8" /><style>
    body { font-family: -apple-system, Roboto, sans-serif; padding: 24px; color: #0F0F10; }
    h1 { font-size: 22px; margin-bottom: 16px; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6E6E76; margin: 20px 0 8px; }
    p { margin: 4px 0; font-size: 15px; }
  </style></head><body><h1>Lista della spesa</h1>${body}</body></html>`;
}

export function ShoppingListScreen({ loadState, onToggleItem, onClose }: ShoppingListScreenProps) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (loadState.status !== 'success' || isExportingPdf) {
      return;
    }
    setIsExportingPdf(true);
    try {
      const html = buildShareHtml(loadState.sections);
      const { filePath } = await generatePDF({ html, fileName: 'lista-della-spesa', base64: false });
      if (filePath) {
        await Share.open({
          url: `file://${filePath}`,
          type: 'application/pdf',
          title: 'Lista della spesa',
          failOnCancel: false,
        });
      }
    } catch {
      // Cancelling the share sheet also rejects — nothing to surface here.
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={styles.sheetSafeArea} edges={['bottom']}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.header}>
            <Text style={styles.title}>Lista della spesa</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.pdfButton}
                onPress={handleDownloadPdf}
                activeOpacity={0.7}
                disabled={isExportingPdf}
              >
                <Text style={styles.pdfLabel}>{isExportingPdf ? '…' : 'PDF'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.iconLabel}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loadState.status === 'loading' && <Text style={styles.info}>Caricamento…</Text>}
          {loadState.status === 'error' && <Text style={styles.info}>{loadState.message}</Text>}

          {loadState.status === 'success' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {loadState.sections.map(section => (
                <View key={section.id} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.items.map(item => (
                    <ShoppingListItemRow
                      key={item.key}
                      name={item.name}
                      quantityLabel={item.quantityLabel}
                      isChecked={item.isChecked}
                      onPress={() => onToggleItem(item.key)}
                    />
                  ))}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  sheetSafeArea: {
    maxHeight: '85%',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.card * 1.5,
    borderTopRightRadius: radius.card * 1.5,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerActions: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.textPrimary,
  },
  pdfButton: {
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfLabel: {
    ...typography.cardLabel,
    fontSize: 13,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.cardLabel,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  info: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
