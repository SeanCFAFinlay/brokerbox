import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { calculateMortgagePayment, calculateBlendedRate, calculateCombinedPayment, getQualificationResult } from '../../../lib/math';

const COLORS = {
    bg: '#0B0F14',
    card: '#121822',
    surface: '#161D29',
    primary: '#14B8A6',
    text: '#E5E7EB',
    muted: '#6B7280',
    error: '#DC2626',
};

export default function CalculatorsScreen() {
    const [t1Amount, setT1Amount] = useState('680000');
    const [t1Rate, setT1Rate] = useState('4.85'); // %
    const [t1Amort, setT1Amort] = useState('25'); // years

    const [t2Amount, setT2Amount] = useState('0');
    const [t2Rate, setT2Rate] = useState('8.0'); // %
    const [t2Amort, setT2Amort] = useState('25');

    const [income, setIncome] = useState('125000');
    const [taxes, setTaxes] = useState('3600');
    const [heating, setHeating] = useState('150');
    const [condo, setCondo] = useState('400');
    const [debts, setDebts] = useState('300');

    // Parse inputs
    const pT1Amt = parseFloat(t1Amount) || 0;
    const pT1Rate = (parseFloat(t1Rate) || 0) / 100;
    const pT1Amort = parseFloat(t1Amort) || 0;

    const pT2Amt = parseFloat(t2Amount) || 0;
    const pT2Rate = (parseFloat(t2Rate) || 0) / 100;
    const pT2Amort = parseFloat(t2Amort) || 0;

    const pIncome = parseFloat(income) || 0;
    const pTaxes = parseFloat(taxes) || 0;
    const pHeating = parseFloat(heating) || 0;
    const pCondo = parseFloat(condo) || 0;
    const pDebts = parseFloat(debts) || 0;

    // Compute 
    const tranches: any[] = [];
    if (pT1Amt > 0) tranches.push({ amount: pT1Amt, rate: pT1Rate, amortizationYears: pT1Amort });
    if (pT2Amt > 0) tranches.push({ amount: pT2Amt, rate: pT2Rate, amortizationYears: pT2Amort });

    const blendedRate = calculateBlendedRate(tranches);
    const totalPayment = calculateCombinedPayment(tranches);
    const totalAmount = pT1Amt + pT2Amt;

    // Stress Test Qualification
    const qualResult = getQualificationResult(blendedRate, totalAmount, pT1Amort || pT2Amort, {
        annualTaxes: pTaxes,
        heating: pHeating,
        condoFees: pCondo,
        otherDebts: pDebts,
        grossIncome: pIncome
    });

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Scenario Builder</Text>
                <Text style={styles.headerSubtitle}>Multi-Tranche & Blended Rate</Text>
            </View>

            <View style={{ padding: 16 }}>
                {/* Results Card */}
                <View style={[styles.card, { borderColor: COLORS.primary, borderWidth: 2 }]}>
                    <Text style={styles.sectionTitle}>Combined Output</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Total Financing:</Text>
                        <Text style={styles.value}>${totalAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Blended Rate:</Text>
                        <Text style={[styles.value, { color: COLORS.primary }]}>{(blendedRate * 100).toFixed(3)}%</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Total Monthly Payment:</Text>
                        <Text style={[styles.value, { fontSize: 24, fontWeight: '700', color: COLORS.text }]}>
                            ${totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    </View>

                    <View style={[styles.row, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: COLORS.surface }]}>
                        <Text style={styles.label}>Stress Test Result:</Text>
                        <Text style={[styles.value, { color: qualResult.isQualified ? '#10B981' : COLORS.error }]}>
                            {qualResult.isQualified ? 'PASSED' : 'FAILED'}
                        </Text>
                    </View>
                    <Text style={[styles.label, { marginTop: 4 }]}>GDS: {qualResult.gds.toFixed(1)}% | TDS: {qualResult.tds.toFixed(1)}%</Text>
                </View>

                {/* Tranche 1 */}
                <Text style={[styles.sectionTitle, { marginTop: 8 }]}>1st Mortgage Tranche</Text>
                <View style={styles.card}>
                    <Text style={styles.label}>Amount ($)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={t1Amount} onChangeText={setT1Amount} />
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Rate (%)</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={t1Rate} onChangeText={setT1Rate} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Amort. (Yrs)</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={t1Amort} onChangeText={setT1Amort} />
                        </View>
                    </View>
                </View>

                {/* Tranche 2 */}
                <Text style={[styles.sectionTitle, { marginTop: 8 }]}>2nd Mortgage Tranche</Text>
                <View style={styles.card}>
                    <Text style={styles.label}>Amount ($) (Leave 0 to skip)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={t2Amount} onChangeText={setT2Amount} />
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Rate (%)</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={t2Rate} onChangeText={setT2Rate} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Amort. (Yrs)</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={t2Amort} onChangeText={setT2Amort} />
                        </View>
                    </View>
                </View>

                {/* Qualification Params */}
                <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Borrower Qualification Data</Text>
                <View style={styles.card}>
                    <Text style={styles.label}>Annual Income ($)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={income} onChangeText={setIncome} />

                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Annual Taxes</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={taxes} onChangeText={setTaxes} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Monthly Condo Half</Text>
                            <TextInput style={styles.input} keyboardType="numeric" value={condo} onChangeText={setCondo} />
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
    headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: COLORS.muted },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.muted, marginBottom: 8, textTransform: 'uppercase' },
    card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1f2937' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    label: { fontSize: 13, color: COLORS.muted, marginBottom: 6 },
    value: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    input: {
        backgroundColor: COLORS.bg,
        borderRadius: 8,
        padding: 12,
        color: COLORS.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#374151',
        marginBottom: 8
    }
});
