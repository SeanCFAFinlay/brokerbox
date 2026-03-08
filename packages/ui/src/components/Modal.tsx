import React from 'react';
import { Modal as PaperModal, Portal, Text, Button } from 'react-native-paper';

interface ModalProps {
    visible: boolean;
    onDismiss: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal = ({ visible, onDismiss, title, children }: ModalProps) => {
    const containerStyle = { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12 };

    return (
        <Portal>
            <PaperModal visible={visible} onDismiss={onDismiss} contentContainerStyle={containerStyle}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>{title}</Text>
                {children}
                <Button onPress={onDismiss} style={{ marginTop: 16 }}>Close</Button>
            </PaperModal>
        </Portal>
    );
};
