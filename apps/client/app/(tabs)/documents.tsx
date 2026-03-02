import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '@brokerbox/ui';

export default function ClientDocumentsScreen() {
    // In a real app we'd fetch actual assigned document checklists here.
    const documents = [
        { id: '1', name: 'Government Photo ID (FSRA KYC)', status: 'PENDING', date: null },
        { id: '2', name: 'Full Property Appraisal Report', status: 'PENDING', date: null },
        { id: '3', name: 'Notice of Assessment (Recent)', status: 'UPLOADED', date: '2023-11-20' },
        { id: '4', name: 'Independent Legal Representation Waiver', status: 'PENDING', date: null },
        { id: '5', name: 'Purchase & Sale Agreement', status: 'ACCEPTED', date: '2023-11-21' },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Document Checklist</Text>
                <Text style={styles.headerSubtitle}>Please upload the following required documents securely.</Text>
            </View>

            <View style={{ padding: 16 }}>
                {documents.map((doc) => (
                    <View key={doc.id} style={styles.card}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.docName}>{doc.name}</Text>
                            {doc.date && <Text style={styles.docDate}>Uploaded: {doc.date}</Text>}
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                            {doc.status === 'PENDING' ? (
                                <TouchableOpacity style={styles.uploadBtn}>
                                    <Text style={styles.uploadBtnText}>Upload File</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={[
                                    styles.statusBadge,
                                    doc.status === 'ACCEPTED' ? { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' } : {}
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        doc.status === 'ACCEPTED' ? { color: '#10B981' } : {}
                                    ]}>{doc.status}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
    headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: COLORS.muted },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1f2937',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    docName: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
    docDate: { fontSize: 12, color: COLORS.muted },
    uploadBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    uploadBtnText: { color: '#0B0F14', fontWeight: '600', fontSize: 13 },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: COLORS.muted
    },
    statusText: { fontSize: 12, fontWeight: '700', color: COLORS.text }
});
