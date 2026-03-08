import React from 'react';
import { DataTable } from 'react-native-paper';

interface TableProps {
    headers: string[];
    rows: any[][];
}

export const Table = ({ headers, rows }: TableProps) => {
    return (
        <DataTable>
            <DataTable.Header>
                {headers.map((header, i) => (
                    <DataTable.Title key={i}>{header}</DataTable.Title>
                ))}
            </DataTable.Header>

            {rows.map((row, i) => (
                <DataTable.Row key={i}>
                    {row.map((cell, j) => (
                        <DataTable.Cell key={j}>{cell}</DataTable.Cell>
                    ))}
                </DataTable.Row>
            ))}
        </DataTable>
    );
};
