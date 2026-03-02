import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
// Note: In the monorepo, we import logic from the shared core package
import { calculateBlendedRate, calculateCombinedPayment, getQualificationResult } from '@brokerbox/core';
import { COLORS } from '@brokerbox/ui';

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

                {/* Property Details Category */}
                <Text style={styles.categoryTitle}>Property Details</Text>
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Province</Text>
                            <View style={styles.pickerContainer}>
                                <Picker style={styles.picker} selectedValue={'ON'}>
                                    <Picker.Item label="Ontario (ON)" value="ON" color={COLORS.text} />
                                    <Picker.Item label="British Columbia (BC)" value="BC" color={COLORS.text} />
                                    <Picker.Item label="Alberta (AB)" value="AB" color={COLORS.text} />
                                </Picker>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Property Type</Text>
                            <View style={styles.pickerContainer}>
                                <Picker style={styles.picker} selectedValue={'DETACHED'}>
                                    <Picker.Item label="Detached" value="DETACHED" color={COLORS.text} />
                                    <Picker.Item label="Condo" value="CONDO" color={COLORS.text} />
                                    <Picker.Item label="Semi-Detached" value="SEMI" color={COLORS.text} />
                                </Picker>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Loan Details Category */}
                <Text style={styles.categoryTitle}>Loan Details</Text>

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

                {/* Borrower Details Category */}
                <Text style={styles.categoryTitle}>Borrower Details</Text>
                <View style={styles.card}>
                    <Text style={styles.label}>Annual Income ($)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={income} onChangeText={setIncome} />
                </View>

                {/* Monthly Obligations Category */}
                <Text style={styles.categoryTitle}>Monthly Obligations</Text>
                <View style={styles.card}>

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
    headerSubtitle: { fontSize: 16, color: COLORS.muted, marginTop: 4 },
    categoryTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 24, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.surface, paddingBottom: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginBottom: 8, textTransform: 'uppercase' },
    card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#1f2937' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    label: { fontSize: 14, fontWeight: '500', color: COLORS.muted, marginBottom: 8 },
    value: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    input: {
        backgroundColor: COLORS.bg,
        borderRadius: 8,
        padding: 16,
        color: COLORS.text,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#374151',
        marginBottom: 12
    },
    pickerContainer: {
        backgroundColor: COLORS.bg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#374151',
        overflow: 'hidden',
    },
    picker: {
        color: COLORS.text,
        height: 54, // Ensure adequate touch target
    }
});
