import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';

interface Column<T> {
    header: string;
    accessor: keyof T;
    render?: (value: any, row: T) => React.ReactNode;
    width?: number;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    onRowPress?: (row: T) => void;
    emptyMessage?: string;
}

export function DataTable<T extends object>({ data, columns, loading = false, onRowPress, emptyMessage = 'No data available' }: DataTableProps<T>) {
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="var(--color-primary)" />
            </View>
        );
    }

    if (data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
        );
    }

    return (
        <ScrollView horizontal>
            <View style={styles.table}>
                {/* Header */}
                <View style={styles.headerRow}>
                    {columns.map((col, idx) => (
                        <Text key={idx} style={[styles.headerCell, col.width && { width: col.width }]}>{col.header}</Text>
                    ))}
                </View>
                {/* Rows */}
                {data.map((row, rowIdx) => (
                    <TouchableOpacity
                        key={rowIdx}
                        style={styles.row}
                        onPress={() => onRowPress && onRowPress(row)}
                        activeOpacity={onRowPress ? 0.6 : 1}
                    >
                        {columns.map((col, colIdx) => (
                            <View key={colIdx} style={[styles.cell, col.width && { width: col.width }]}>
                                {col.render ? col.render(row[col.accessor], row) : <Text>{String(row[col.accessor])}</Text>}
                            </View>
                        ))}
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    table: {
        borderWidth: 1,
        borderColor: 'var(--color-muted)',
        borderRadius: 8,
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: 'var(--color-surface)',
        borderBottomWidth: 1,
        borderBottomColor: 'var(--color-muted)',
    },
    headerCell: {
        padding: 12,
        fontWeight: '600',
        color: 'var(--color-text)',
    },
    row: {
        flexDirection: 'row',
        backgroundColor: 'var(--color-bg)',
        borderBottomWidth: 1,
        borderBottomColor: 'var(--color-muted)',
    },
    cell: {
        padding: 12,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: 'var(--color-muted)',
    },
});
