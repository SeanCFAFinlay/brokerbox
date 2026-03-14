/**
 * AssetMatcher.ts
 * Logic to match collateral types against lender appetite.
 */

export type CollateralType = 'residential' | 'land' | 'commercial' | 'industrial' | 'construction' | 'island';

export interface LenderAppetite {
    lenderName: string;
    allowedCollateral: CollateralType[];
    maxLtvByCollateral: Record<CollateralType, number>;
}

export const LENDERS: LenderAppetite[] = [
    {
        lenderName: 'Alpha Private Fund',
        allowedCollateral: ['residential', 'construction'],
        maxLtvByCollateral: { residential: 75, construction: 60, land: 0, commercial: 0, industrial: 0, island: 0 }
    },
    {
        lenderName: 'Terra Land Capital',
        allowedCollateral: ['land', 'residential'],
        maxLtvByCollateral: { land: 50, residential: 65, construction: 0, commercial: 0, industrial: 0, island: 0 }
    },
    {
        lenderName: 'Global Industrial REIT',
        allowedCollateral: ['industrial', 'commercial'],
        maxLtvByCollateral: { industrial: 65, commercial: 70, residential: 0, land: 0, construction: 0, island: 0 }
    }
];

export const matchLenders = (collateral: CollateralType, requestedLtv: number) => {
    return LENDERS.filter(l => 
        l.allowedCollateral.includes(collateral) && 
        (l.maxLtvByCollateral[collateral] || 0) >= requestedLtv
    );
};
