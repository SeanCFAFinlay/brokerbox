import React from 'react';
import { Card as PaperCard, Title, Paragraph } from 'react-native-paper';

interface CardProps {
    title: string;
    subtitle?: string;
    content: string;
    onPress?: () => void;
    style?: any;
}

export const Card = ({ title, subtitle, content, onPress, style }: CardProps) => {
    return (
        <PaperCard style={[{ marginVertical: 8, borderRadius: 12 }, style]} onPress={onPress}>
            <PaperCard.Content>
                <Title>{title}</Title>
                {subtitle && <Paragraph style={{ opacity: 0.7 }}>{subtitle}</Paragraph>}
                <Paragraph style={{ marginTop: 8 }}>{content}</Paragraph>
            </PaperCard.Content>
        </PaperCard>
    );
};
