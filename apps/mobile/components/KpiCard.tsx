import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
    card: '#121822',
    surface: '#161D29',
    primary: '#14B8A6',
    text: '#E5E7EB',
    muted: '#6B7280',
};

export function KpiCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 16,
        flex: 1,
        minWidth: '45%', // Ensure 2-column grid on most phones
        margin: 6,
        borderWidth: 1,
        borderColor: COLORS.surface,
    },
    title: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.muted,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 12,
        color: COLORS.primary,
        marginTop: 8,
        fontWeight: '500',
    }
});
