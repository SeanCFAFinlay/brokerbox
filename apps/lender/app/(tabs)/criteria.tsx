import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { COLORS } from '@brokerbox/ui';
import { useState } from 'react';

export default function LenderCriteriaScreen() {
    // Mock criteria setup
    const [maxLtv, setMaxLtv] = useState('80');
    const [minCredit, setMinCredit] = useState('650');
    const [maxGds, setMaxGds] = useState('39');
    const [maxTds, setMaxTds] = useState('44');

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lending Criteria</Text>
                <Text style={styles.headerSubtitle}>Update your live matching engine rules</Text>
            </View>

            <View style={{ padding: 16 }}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Risk Parameters</Text>

                    <View style={styles.inputRow}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                            <Text style={styles.label}>Max LTV (%)</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={maxLtv} onChangeText={setMaxLtv} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Min Credit Score</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={minCredit} onChangeText={setMinCredit} />
                        </View>
                    </View>

                    <View style={styles.inputRow}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                            <Text style={styles.label}>Max GDS (%)</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={maxGds} onChangeText={setMaxGds} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Max TDS (%)</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={maxTds} onChangeText={setMaxTds} />
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Approved Geographies</Text>
                    <View style={styles.tagList}>
                        <View style={styles.tag}><Text style={styles.tagText}>Ontario</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>British Columbia</Text></View>
                        <TouchableOpacity style={styles.addTagBtn}>
                            <Text style={styles.addTagText}>+ Add Region</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>Save Criteria</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
    headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: COLORS.muted },
    card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#1f2937' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
    inputRow: { flexDirection: 'row', marginBottom: 16 },
    label: { fontSize: 13, color: COLORS.muted, marginBottom: 8, fontWeight: '500' },
    input: { backgroundColor: COLORS.bg, borderRadius: 8, padding: 14, color: COLORS.text, fontSize: 16, borderWidth: 1, borderColor: '#374151' },
    tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { backgroundColor: 'rgba(20, 184, 166, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary },
    tagText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
    addTagBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.muted, borderStyle: 'dashed' },
    addTagText: { color: COLORS.muted, fontSize: 13, fontWeight: '500' },
    saveBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
    saveBtnText: { color: '#0B0F14', fontSize: 16, fontWeight: '700' }
});
